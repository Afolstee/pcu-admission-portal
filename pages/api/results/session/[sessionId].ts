import type { NextApiRequest, NextApiResponse } from 'next'
import { getConnection } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  const { sessionId } = req.query
  const sessId = parseInt(Array.isArray(sessionId) ? sessionId[0] : sessionId ?? '', 10)
  if (isNaN(sessId)) return res.status(400).json({ error: 'Invalid sessionId' })

  try {
    const pool = await getConnection()

    // ── 1. Fetch all processor_results for this session ─────────────────────────────
    const sessionRes = await pool.query(`
        SELECT
          r.student_id,
          r.course_id,
          r.session_id,
          r.semester,
          r.score,
          r.grade_point,
          r.created_at,
          s.full_name,
          s.matric_number,
          s.current_level,
          d.id            AS department_id,
          d.name          AS department_name,
          f.name          AS faculty,
          a.session_name,
          c.course_code,
          c.course_title,
          c.remark,
          c.credit_units  AS units
        FROM processor_results r
        JOIN processor_students s ON s.id = r.student_id
        JOIN departments       d ON d.id = s.department_id
        LEFT JOIN faculties    f ON f.id = d.faculty_id
        JOIN academic_sessions a ON a.id = r.session_id
        JOIN courses           c ON c.id = r.course_id
        WHERE r.session_id = $1
        ORDER BY s.full_name, r.semester, c.course_code
      `, [sessId])
    
    const sessionRows = sessionRes.rows;

    // ── 2. Fetch ALL historical results for each student (for running CGPA) ─
    const studentIds = [...new Set(sessionRows.map((r: any) => r.student_id))]

    let allHistoryRows: any[] = []
    if (studentIds.length > 0) {
      // Build parameterised IN list
      const paramsIdx = studentIds.map((_, i) => `$${i + 1}`);
      const historyRes = await pool.query(`
        SELECT
          r.student_id,
          r.session_id,
          r.semester,
          r.score,
          r.grade_point,
          c.credit_units as units,
          a.session_name
        FROM processor_results r
        JOIN courses           c ON c.id = r.course_id
        JOIN academic_sessions a ON a.id = r.session_id
        WHERE r.student_id IN (${paramsIdx.join(',')})
        ORDER BY r.student_id, a.session_name, r.semester
      `, studentIds)
      allHistoryRows = historyRes.rows
    }

    // ── 3. Build per-student history map for running CGPA ─────────────────
    const SEMESTER_ORDER: Record<string, number> = {
      'first semester': 1, 'first': 1,
      'second semester': 2, 'second': 2,
      'third semester': 3, 'third': 3,
    }

    const studentHistory = new Map<number, Map<string, { totalWGP: number; totalUnits: number }>>()

    for (const row of allHistoryRows) {
      if (!studentHistory.has(row.student_id)) {
        studentHistory.set(row.student_id, new Map())
      }
      const semKey = `${row.session_name}||${row.semester}`
      const map = studentHistory.get(row.student_id)!
      if (!map.has(semKey)) map.set(semKey, { totalWGP: 0, totalUnits: 0 })
      const entry = map.get(semKey)!
      entry.totalWGP   += parseFloat(row.grade_point) * row.units
      entry.totalUnits += row.units
    }

    function runningCGPA(studentId: number, upToSessionName: string, upToSemester: string): string {
      const history = studentHistory.get(studentId)
      if (!history) return '0.00'

      const upToOrder = SEMESTER_ORDER[upToSemester.toLowerCase()] ?? 99

      let totalWGP = 0
      let totalUnits = 0

      for (const [key, val] of history.entries()) {
        const [sessionName, semester] = key.split('||')
        const semOrder = SEMESTER_ORDER[semester.toLowerCase()] ?? 99

        if (
          sessionName < upToSessionName ||
          (sessionName === upToSessionName && semOrder <= upToOrder)
        ) {
          totalWGP   += val.totalWGP
          totalUnits += val.totalUnits
        }
      }

      return totalUnits > 0 ? (totalWGP / totalUnits).toFixed(2) : '0.00'
    }

    // ── 4. Group session rows by student → semester ───────────────────────
    const studentMap = new Map<number, any>()

    for (const row of sessionRows) {
      if (!studentMap.has(row.student_id)) {
        studentMap.set(row.student_id, {
          studentInfo: {
            name:            row.full_name,
            matricNumber:    row.matric_number,
            level:           String(row.current_level),
            faculty:         row.faculty || 'Unknown',
            department:      row.department_name,
            academicSession: row.session_name,
            semester:        '',
          },
          departmentId: row.department_id,
          semesters: new Map<string, any>(),
        })
      }

      const student = studentMap.get(row.student_id)!
      const semester = row.semester

      if (!student.semesters.has(semester)) {
        student.semesters.set(semester, {
          name:    semester,
          courses: [],
          totalUnits:       0,
          totalUnitsPassed: 0,
          totalWGP:         0,
          semesterGPA:      '0.00',
          cumulativeCGPA:   '0.00',
        })
      }

      const sem = student.semesters.get(semester)!
      const units      = row.units
      const gradePoint = parseFloat(row.grade_point)
      const score      = row.score

      sem.courses.push({
        id:         String(row.course_id),
        code:       row.course_code,
        title:      row.course_title,
        remark:     row.remark ?? '',
        unit:       units,
        score,
        gradePoint,
      })
      sem.totalUnits += units
      sem.totalWGP   += gradePoint * units
      if (score >= 40) sem.totalUnitsPassed += units
    }

    // ── 5. Finalise semester GPAs and running CGPAs, then serialise ────────
    const result = Array.from(studentMap.values()).map((student) => {
      const semestersArr = Array.from(student.semesters.values())
        .sort((a: any, b: any) => {
          const aO = SEMESTER_ORDER[a.name.toLowerCase()] ?? 99
          const bO = SEMESTER_ORDER[b.name.toLowerCase()] ?? 99
          return aO - bO
        })
        .map((sem: any) => {
          const semGPA = sem.totalUnits > 0
            ? (sem.totalWGP / sem.totalUnits).toFixed(2)
            : '0.00'

          const studentId = [...studentMap.entries()]
            .find(([, v]) => v === student)?.[0] ?? 0

          const cumCGPA = runningCGPA(
            studentId,
            student.studentInfo.academicSession,
            sem.name
          )

          return {
            ...sem,
            semesterGPA:    semGPA,
            cumulativeCGPA: cumCGPA,
          }
        })

      const sessionTotalUnits       = semestersArr.reduce((a: number, s: any) => a + s.totalUnits, 0)
      const sessionTotalUnitsPassed = semestersArr.reduce((a: number, s: any) => a + s.totalUnitsPassed, 0)
      const sessionTotalWGP         = semestersArr.reduce((a: number, s: any) => a + s.totalWGP, 0)
      const sessionGPA = sessionTotalUnits > 0
        ? (sessionTotalWGP / sessionTotalUnits).toFixed(2)
        : '0.00'

      const lastSem = semestersArr[semestersArr.length - 1]
      const overallCGPA = lastSem?.cumulativeCGPA ?? '0.00'

      return {
        studentInfo:          student.studentInfo,
        departmentId:         student.departmentId,
        semesters:            semestersArr,
        sessionTotalUnits,
        sessionTotalUnitsPassed,
        sessionTotalWGP,
        sessionGPA,
        overallCGPA,
      }
    })

    return res.status(200).json(result)
  } catch (err) {
    console.error('[/api/results/session/[sessionId]]', err)
    return res.status(500).json({ error: (err as Error).message })
  }
}