// pages/api/results/session/[sessionId].ts
// GET → returns all students in a session with their semesters combined,
//        running CGPA calculated across ALL semesters ever taken

import type { NextApiRequest, NextApiResponse } from 'next'
import sql from 'mssql'
import { getConnection } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })

  const { sessionId } = req.query
  const sessId = parseInt(Array.isArray(sessionId) ? sessionId[0] : sessionId ?? '', 10)
  if (isNaN(sessId)) return res.status(400).json({ error: 'Invalid sessionId' })

  try {
    const pool = await getConnection()

    // ── 1. Fetch all results for this session ─────────────────────────────
    const { recordset: sessionRows } = await pool.request()
      .input('session_id', sql.Int, sessId)
      .query(`
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
          d.faculty,
          a.session_name,
          c.course_code,
          c.course_title,
          c.remark,
          c.units
        FROM results r
        JOIN students          s ON s.id = r.student_id
        JOIN departments       d ON d.id = s.department_id
        JOIN academic_sessions a ON a.id = r.session_id
        JOIN courses           c ON c.id = r.course_id
        WHERE r.session_id = @session_id
        ORDER BY s.full_name, r.semester, c.course_code
      `)

    // ── 2. Fetch ALL historical results for each student (for running CGPA) ─
    const studentIds = [...new Set(sessionRows.map((r) => r.student_id))]

    let allHistoryRows: any[] = []
    if (studentIds.length > 0) {
      // Build parameterised IN list
      const request = pool.request()
      const params = studentIds.map((id, i) => {
        request.input(`sid${i}`, sql.Int, id)
        return `@sid${i}`
      })
      const { recordset } = await request.query(`
        SELECT
          r.student_id,
          r.session_id,
          r.semester,
          r.score,
          r.grade_point,
          c.units,
          a.session_name
        FROM results r
        JOIN courses           c ON c.id = r.course_id
        JOIN academic_sessions a ON a.id = r.session_id
        WHERE r.student_id IN (${params.join(',')})
        ORDER BY r.student_id, a.session_name, r.semester
      `)
      allHistoryRows = recordset
    }

    // ── 3. Build per-student history map for running CGPA ─────────────────
    // Group ALL rows by student → ordered list of (semester key → courses)
    const SEMESTER_ORDER: Record<string, number> = {
      'first semester': 1, 'first': 1,
      'second semester': 2, 'second': 2,
      'third semester': 3, 'third': 3,
    }

    interface SemKey { sessionName: string; semester: string; order: number }
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

    // For a given student, compute running CGPA up to and including a semKey
    function runningCGPA(studentId: number, upToSessionName: string, upToSemester: string): string {
      const history = studentHistory.get(studentId)
      if (!history) return '0.00'

      const upToOrder = SEMESTER_ORDER[upToSemester.toLowerCase()] ?? 99

      let totalWGP = 0
      let totalUnits = 0

      for (const [key, val] of history.entries()) {
        const [sessionName, semester] = key.split('||')
        const semOrder = SEMESTER_ORDER[semester.toLowerCase()] ?? 99

        // Include if: earlier session, OR same session but same/earlier semester
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
            faculty:         row.faculty,
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
    const SEMESTER_ORDER_ARR = ['first semester', 'second semester', 'third semester', 'first', 'second', 'third']

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

      // Overall session totals
      const sessionTotalUnits       = semestersArr.reduce((a: number, s: any) => a + s.totalUnits, 0)
      const sessionTotalUnitsPassed = semestersArr.reduce((a: number, s: any) => a + s.totalUnitsPassed, 0)
      const sessionTotalWGP         = semestersArr.reduce((a: number, s: any) => a + s.totalWGP, 0)
      const sessionGPA = sessionTotalUnits > 0
        ? (sessionTotalWGP / sessionTotalUnits).toFixed(2)
        : '0.00'

      // Overall running CGPA = after the last semester in this session
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