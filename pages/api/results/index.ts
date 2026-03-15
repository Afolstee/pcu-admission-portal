import type { NextApiRequest, NextApiResponse } from 'next'
import { getConnection } from '@/lib/db'

// Interfaces
interface IncomingCourse {
  id?: string
  code: string
  unit?: number
  score: number
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

async function batchSaveResults(pool: any, items: IncomingResult[]): Promise<string[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Using mapping dicts to reduce duplicate resolutions in same batch request
    const studentIds: Record<string, number> = {};
    const sessionIds: Record<string, number> = {};
    const courseIds: Record<string, number> = {};
    const deptIds: Record<string, number> = {};
    const savedIds: string[] = [];

    const resultsToInsert: any[] = [];

    // Pre-resolve students and sessions
    for (const item of items) {
      const { studentInfo } = item;
      
      if (!sessionIds[studentInfo.academicSession]) {
        sessionIds[studentInfo.academicSession] = await resolveSession(client, studentInfo.academicSession);
      }
      if (!studentIds[studentInfo.matricNumber]) {
        studentIds[studentInfo.matricNumber] = await resolveStudent(client, studentInfo);
      }
      
      const sessId = sessionIds[studentInfo.academicSession];
      const studId = studentIds[studentInfo.matricNumber];
      savedIds.push(`${studId}_${sessId}_${studentInfo.semester}`);
    }

    // Process Courses and compute Results insertions
    for (const item of items) {
      const { studentInfo, courses } = item;
      const studId = studentIds[studentInfo.matricNumber];
      const sessId = sessionIds[studentInfo.academicSession];
      
      // Determine department ID for this student context
      if (!deptIds[studentInfo.department]) {
        const deptRes = await client.query(`SELECT id FROM departments WHERE name = $1 LIMIT 1`, [studentInfo.department]);
        deptIds[studentInfo.department] = deptRes.rows[0]?.id ?? 1;
      }
      const departmentId = deptIds[studentInfo.department];

      // Delete existing records before recreating
      await client.query(`
        DELETE FROM processor_results 
        WHERE student_id = $1 AND session_id = $2 AND semester = $3
      `, [studId, sessId, studentInfo.semester]);

      // Deduplicate courses within this student's result to avoid ON CONFLICT duplicate issues in same query
      const uniqueCourses = new Map();
      for (const c of courses) {
        uniqueCourses.set(c.code, c);
      }

      for (const course of Array.from(uniqueCourses.values())) {
        const cacheKey = `${course.code}_${departmentId}`;
        if (!courseIds[cacheKey]) {
          const resolvedCrs = await resolveCourse(client, course.code, course.unit ?? 3, departmentId);
          courseIds[cacheKey] = resolvedCrs.id;
        }
        
        const courseId = courseIds[cacheKey];
        const gradePoint = course.gradePoint ?? course.gpa ?? gradePointFromScore(course.score);

        resultsToInsert.push({
          student_id: studId,
          course_id: courseId,
          session_id: sessId,
          semester: studentInfo.semester,
          score: Math.round(course.score),
          grade_point: gradePoint
        });
      }
    }

    // Batch Insert Results
    if (resultsToInsert.length > 0) {
      const queryParts = [];
      const values = [];
      let paramId = 1;
      
      for (const r of resultsToInsert) {
        queryParts.push(`($${paramId++}, $${paramId++}, $${paramId++}, $${paramId++}, $${paramId++}, $${paramId++})`);
        values.push(r.student_id, r.course_id, r.session_id, r.semester, r.score, r.grade_point);
      }
      
      await client.query(`
        INSERT INTO processor_results (student_id, course_id, session_id, semester, score, grade_point)
        VALUES ${queryParts.join(', ')}
        ON CONFLICT (student_id, course_id, session_id, semester) DO UPDATE 
        SET score = EXCLUDED.score, grade_point = EXCLUDED.grade_point
      `, values);
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
          c.credit_units  AS units,
          c.remark
        FROM processor_results r
        JOIN processor_students s ON s.id = r.student_id
        JOIN departments       d ON d.id = s.department_id
        LEFT JOIN faculties    f ON f.id = d.faculty_id
        JOIN academic_sessions a ON a.id = r.session_id
        JOIN courses           c ON c.id = r.course_id
        ORDER BY d.name, a.session_name, r.semester, s.full_name
      `);
      
      const recordset = result.rows;

      const SEMESTER_ORDER: Record<string, number> = {
        'first semester':  1,
        'second semester': 2,
        'third semester':  3,
        'first':  1,
        'second': 2,
        'third':  3,
      }

      const deptMap = new Map<number, any>()

      for (const row of recordset) {
        const deptId    = row.department_id
        const sessionId = row.session_id
        const semester  = row.semester
        const groupId   = `${row.student_id}_${sessionId}_${semester}`

        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            id:       deptId,
            name:     row.department_name,
            faculty:  row.faculty || 'Unknown',
            sessions: new Map(),
          })
        }
        const dept = deptMap.get(deptId)!

        if (!dept.sessions.has(sessionId)) {
          dept.sessions.set(sessionId, {
            id:        sessionId,
            name:      row.session_name,
            semesters: new Map(),
          })
        }
        const session = dept.sessions.get(sessionId)!

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
          id:         String(row.course_id),
          code:       row.course_code,
          title:      row.course_title ?? row.course_code,
          unit:       units,
          score,
          gradePoint,
          remark:     row.remark ?? '',
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

      const ids = await batchSaveResults(pool, items)

      if (pendingId) {
        try {
          await pool.query(`UPDATE pending_results SET status = 'processed' WHERE id = $1`, [pendingId])
        } catch (updateErr) {
          console.error('[POST /api/results] Failed to update pending status', updateErr)
          // Don't fail the whole request since results are already saved
        }
      }

      return res.status(201).json({ message: `${ids.length} result(s) saved`, ids })
    }

    if (req.method === 'DELETE') {
      await pool.query(`DELETE FROM processor_results`)
      return res.status(200).json({ message: 'All results cleared' })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/results]', err)
    return res.status(500).json({ error: (err as Error).message })
  }
}