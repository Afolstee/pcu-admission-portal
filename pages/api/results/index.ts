import type { NextApiRequest, NextApiResponse } from 'next'
import { getConnection } from '@/lib/db'

// Interfaces
interface IncomingCourse {
  id?: string
  code: string
  unit?: number
  score: number
  ca?: number
  exam?: number
  gradePoint?: number
  gpa?: number
}

interface IncomingResult {
  studentInfo: {
    name: string
    matricNumber: string
    level: string
    faculty: string
    department: string
    academicSession: string
    semester: string
  }
  courses: IncomingCourse[]
  calculations?: {
    totalUnits: number
    totalUnitsPassed: number
    totalWGP: number
    cgpa: string
  }
}

// Ensure the db functions are async and use $1 parameters
async function resolveStudent(pool: any, info: IncomingResult['studentInfo']): Promise<number> {
  // Try to find student first
  const existing = await pool.query(`SELECT id FROM processor_students WHERE matric_number = $1`, [info.matricNumber])
  if (existing.rows.length > 0) return existing.rows[0].id

  // resolve department
  let deptRes = await pool.query(`SELECT id FROM departments WHERE name = $1`, [info.department])
  let departmentId: number;
  if (deptRes.rows.length > 0) {
    departmentId = deptRes.rows[0].id
  } else {
    // try to resolve faculty
    let facRes = await pool.query(`SELECT id FROM faculties WHERE name = $1`, [info.faculty])
    let facultyId: number;
    if (facRes.rows.length > 0) {
      facultyId = facRes.rows[0].id
    } else {
      let insFac = await pool.query(`
        INSERT INTO faculties (name) VALUES ($1) 
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
        RETURNING id
      `, [info.faculty])
      facultyId = insFac.rows[0].id
    }

    let insDept = await pool.query(`
      INSERT INTO departments (name, faculty_id) VALUES ($1, $2) 
      ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
      RETURNING id
    `, [info.department, facultyId])
    departmentId = insDept.rows[0].id
  }

  const levelInt = parseInt(info.level, 10) || 100

  const ins = await pool.query(`
    INSERT INTO processor_students (matric_number, full_name, department_id, current_level)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (matric_number) DO UPDATE SET 
      full_name = EXCLUDED.full_name,
      department_id = EXCLUDED.department_id,
      current_level = EXCLUDED.current_level
    RETURNING id
  `, [info.matricNumber, info.name, departmentId, levelInt])
  
  return ins.rows[0].id
}

async function resolveSession(pool: any, sessionName: string): Promise<number> {
  const existing = await pool.query(`SELECT id FROM academic_sessions WHERE session_name = $1`, [sessionName])
  if (existing.rows.length > 0) return existing.rows[0].id

  const ins = await pool.query(`
    INSERT INTO academic_sessions (session_name) VALUES ($1) 
    ON CONFLICT (session_name) DO UPDATE SET session_name = EXCLUDED.session_name
    RETURNING id
  `, [sessionName])
  return ins.rows[0].id
}

async function resolveCourse(
  pool: any,
  code: string,
  unit: number,
  departmentId: number
): Promise<{ id: number; title: string; units: number; remark: string }> {
  // Try exact match
  let res = await pool.query(`
    SELECT id, course_title, credit_units as units, remark
    FROM courses
    WHERE course_code = $1 AND department_id = $2 LIMIT 1
  `, [code, departmentId])

  if (res.rows.length > 0) {
    const r = res.rows[0]
    return { id: r.id, title: r.course_title, units: r.units, remark: r.remark ?? '' }
  }

  // Fallback match
  res = await pool.query(`
    SELECT id, course_title, credit_units as units, remark
    FROM courses
    WHERE course_code = $1 LIMIT 1
  `, [code])

  if (res.rows.length > 0) {
    const r = res.rows[0]
    return { id: r.id, title: r.course_title, units: r.units, remark: r.remark ?? '' }
  }

  // Generate missing course reference dynamically
  const ins = await pool.query(`
    INSERT INTO courses (course_code, course_title, credit_units, department_id)
    VALUES ($1, $2, $3, $4) 
    ON CONFLICT (course_code) DO UPDATE SET course_title = EXCLUDED.course_title
    RETURNING id
  `, [code, code, unit || 3, departmentId])
  
  return { id: ins.rows[0].id, title: code, units: unit || 3, remark: '' }
}

function gradePointFromScore(score: number): number {
  if (score >= 70) return 5
  if (score >= 60) return 4
  if (score >= 50) return 3
  if (score >= 45) return 2
  if (score >= 40) return 1
  return 0
}

function gradeFromScore(score: number): string {
  if (score >= 70) return 'A'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C'
  if (score >= 45) return 'D'
  if (score >= 40) return 'E'
  return 'F'
}

async function batchSaveResults(pool: any, items: IncomingResult[], staffId: number | null = null): Promise<string[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const savedIds: string[] = [];
    const deptIds: Record<string, number> = {};
    const programIdsByMatric: Record<string, number | null> = {};

    for (const item of items) {
      const { studentInfo, courses } = item;
      
      // Resolve student/department context
      if (!deptIds[studentInfo.department]) {
        const deptRes = await client.query(`SELECT id FROM departments WHERE name = $1 LIMIT 1`, [studentInfo.department]);
        deptIds[studentInfo.department] = deptRes.rows[0]?.id ?? 1;
      }
      const departmentId = deptIds[studentInfo.department];

      if (programIdsByMatric[studentInfo.matricNumber] === undefined) {
        const studRes = await client.query(`SELECT program_id FROM students WHERE matric_number = $1`, [studentInfo.matricNumber]);
        programIdsByMatric[studentInfo.matricNumber] = studRes.rows[0]?.program_id || null;
      }
      const programId = programIdsByMatric[studentInfo.matricNumber];

      // Upsert into master_results
      for (const course of courses) {
        const gradePoint = course.gradePoint ?? course.gpa ?? gradePointFromScore(course.score);
        const grade = gradeFromScore(course.score);
        const status = course.score >= 40 ? 'P' : 'F';

        await client.query(`
          INSERT INTO master_results (
            matric_no, course_code, course_unit, session, semester, level, 
            ca, exam, total, grade, grade_point, status, program_id, lecturer_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (matric_no, course_code, session, semester) DO UPDATE SET
            course_unit = EXCLUDED.course_unit,
            level = EXCLUDED.level,
            ca = EXCLUDED.ca,
            exam = EXCLUDED.exam,
            total = EXCLUDED.total,
            grade = EXCLUDED.grade,
            grade_point = EXCLUDED.grade_point,
            status = EXCLUDED.status,
            program_id = EXCLUDED.program_id,
            lecturer_id = EXCLUDED.lecturer_id
        `, [
          studentInfo.matricNumber, course.code, course.unit || 3, studentInfo.academicSession,
          studentInfo.semester, studentInfo.level, course.ca || 0, course.exam || 0,
          course.score, grade, gradePoint, status, programId, staffId
        ]);
      }
      
      savedIds.push(studentInfo.matricNumber);
    }

    await client.query('COMMIT');
    return savedIds;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection()

  try {
    if (req.method === 'GET') {
      const result = await pool.query(`
        SELECT
          r.matric_no, r.total AS score, r.grade_point, r.semester, r.session AS session_name,
          r.course_code, r.course_unit AS units, r.level AS current_level, r.created_at,
          s.id AS student_id, s.full_name, s.matric_number,
          d.id AS department_id, d.name AS department_name,
          f.name AS faculty,
          c.course_title
        FROM master_results r
        JOIN processor_students s ON s.matric_number = r.matric_no
        JOIN departments       d ON d.id = s.department_id
        LEFT JOIN faculties    f ON f.id = d.faculty_id
        LEFT JOIN courses      c ON c.course_code = r.course_code
        ORDER BY d.name, r.session, r.semester, s.full_name
      `);
      
      const recordset = result.rows;

      const SEMESTER_ORDER: Record<string, number> = {
        'first semester': 1, 'first': 1,
        'second semester': 2, 'second': 2,
        'third semester': 3, 'third': 3,
      }

      const deptMap = new Map<number, any>()

      for (const row of recordset) {
        const deptId    = row.department_id
        const sessionName = row.session_name
        const semester  = row.semester
        const groupId   = `${row.matric_no}_${sessionName}_${semester}`

        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            id:       deptId,
            name:     row.department_name,
            faculty:  row.faculty || 'Unknown',
            sessions: new Map(),
          })
        }
        const dept = deptMap.get(deptId)!

        if (!dept.sessions.has(sessionName)) {
          dept.sessions.set(sessionName, {
            id:        sessionName,
            name:      sessionName,
            semesters: new Map(),
          })
        }
        const session = dept.sessions.get(sessionName)!

        if (!session.semesters.has(semester)) {
          session.semesters.set(semester, { name: semester, students: new Map() })
        }
        const sem = session.semesters.get(semester)!

        if (!sem.students.has(groupId)) {
          sem.students.set(groupId, {
            id:          groupId,
            timestamp:   new Date(row.created_at).getTime(),
            studentInfo: {
              name:            row.full_name,
              matricNumber:    row.matric_number,
              level:           String(row.current_level),
              faculty:         row.faculty || 'Unknown',
              department:      row.department_name,
              academicSession: row.session_name,
              semester:        row.semester,
            },
            courses:      [],
            calculations: { totalUnits: 0, totalUnitsPassed: 0, totalWGP: 0, cgpa: '0.00' },
          })
        }

        const student    = sem.students.get(groupId)!
        const units      = row.units
        const gradePoint = parseFloat(row.grade_point)
        const score      = row.score

        student.courses.push({
          id:         row.course_code,
          code:       row.course_code,
          title:      row.course_title ?? row.course_code,
          unit:       units,
          score,
          gradePoint,
          remark:     score >= 40 ? 'Pass' : 'Fail',
        })
        student.calculations.totalUnits += units
        student.calculations.totalWGP   += gradePoint * units
        if (score >= 40) student.calculations.totalUnitsPassed += units
      }

      const departments = Array.from(deptMap.values()).map((dept) => ({
        id:      dept.id,
        name:    dept.name,
        faculty: dept.faculty,
        sessions: Array.from(dept.sessions.values()).map((session: any) => ({
          id:   session.id,
          name: session.name,
          semesters: Array.from(session.semesters.values())
            .sort((a: any, b: any) => {
              const aOrder = SEMESTER_ORDER[a.name.toLowerCase()] ?? 99
              const bOrder = SEMESTER_ORDER[b.name.toLowerCase()] ?? 99
              return aOrder - bOrder
            })
            .map((sem: any) => ({
              name: sem.name,
              students: Array.from(sem.students.values()).map((student: any) => ({
                ...student,
                calculations: {
                  ...student.calculations,
                  cgpa: student.calculations.totalUnits > 0
                    ? (student.calculations.totalWGP / student.calculations.totalUnits).toFixed(2)
                    : '0.00',
                },
              })),
            })),
        })),
      }))

      return res.status(200).json(departments)
    }


    if (req.method === 'POST') {
      const body = req.body
      const pendingId = body.pendingId
      const resultsData = body.results || body
      const items: IncomingResult[] = Array.isArray(resultsData) ? resultsData : [resultsData]

      if (items.length === 0) {
        return res.status(200).json({ message: 'No results to save' })
      }

      for (const item of items) {
        if (!item?.studentInfo?.matricNumber) {
          return res.status(400).json({ error: 'Missing studentInfo.matricNumber' })
        }
      }

      let staffId = null;
      if (pendingId) {
        try {
          const pendRes = await pool.query('SELECT staff_id FROM pending_results WHERE id = $1', [pendingId]);
          if (pendRes.rows.length > 0) staffId = pendRes.rows[0].staff_id;
        } catch (e) {}
      }

      const ids = await batchSaveResults(pool, items, staffId)

      if (pendingId) {
        try {
          await pool.query(`UPDATE pending_results SET status = 'processed' WHERE id = $1`, [pendingId])
        } catch (updateErr) {
          console.error('[POST /api/results] Failed to update pending status', updateErr)
        }
      }

      return res.status(201).json({ message: `${ids.length} result(s) saved`, ids })
    }

    if (req.method === 'DELETE') {
      await pool.query(`DELETE FROM master_results`)
      return res.status(200).json({ message: 'All results cleared' })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/results]', err)
    return res.status(500).json({ error: (err as Error).message })
  }
}