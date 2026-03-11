// pages/api/results/index.ts
// GET    → returns results grouped by department → session → semester
// POST   → saves one result object OR array of results
// DELETE → clears all results

import type { NextApiRequest, NextApiResponse } from 'next'
import sql from 'mssql'
import { getConnection } from '@/lib/db'

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

// ─── Auto-resolve helpers (create if not exists) ──────────────────────────────

async function resolveStudent(pool: sql.ConnectionPool, info: IncomingResult['studentInfo']): Promise<number> {
  const existing = await pool.request()
    .input('matric', sql.NVarChar, info.matricNumber)
    .query(`SELECT id FROM students WHERE matric_number = @matric`)

  if (existing.recordset.length > 0) return existing.recordset[0].id

  const deptRes = await pool.request()
    .input('deptName', sql.NVarChar, info.department)
    .query(`SELECT id FROM departments WHERE name = @deptName`)

  let departmentId: number
  if (deptRes.recordset.length > 0) {
    departmentId = deptRes.recordset[0].id
  } else {
    const ins = await pool.request()
      .input('name',    sql.NVarChar, info.department)
      .input('faculty', sql.NVarChar, info.faculty)
      .query(`INSERT INTO departments (name, faculty) OUTPUT INSERTED.id VALUES (@name, @faculty)`)
    departmentId = ins.recordset[0].id
  }

  const levelInt = parseInt(info.level, 10) || 100

  const ins = await pool.request()
    .input('matric',  sql.NVarChar, info.matricNumber)
    .input('name',    sql.NVarChar, info.name)
    .input('dept_id', sql.Int,      departmentId)
    .input('level',   sql.Int,      levelInt)
    .query(`
      INSERT INTO students (matric_number, full_name, department_id, current_level)
      OUTPUT INSERTED.id
      VALUES (@matric, @name, @dept_id, @level)
    `)
  return ins.recordset[0].id
}

async function resolveSession(pool: sql.ConnectionPool, sessionName: string): Promise<number> {
  const existing = await pool.request()
    .input('name', sql.NVarChar, sessionName)
    .query(`SELECT id FROM academic_sessions WHERE session_name = @name`)
  if (existing.recordset.length > 0) return existing.recordset[0].id

  const ins = await pool.request()
    .input('name', sql.NVarChar, sessionName)
    .query(`INSERT INTO academic_sessions (session_name) OUTPUT INSERTED.id VALUES (@name)`)
  return ins.recordset[0].id
}

// ─── Resolve course: match by code + student's department ────────────────────
async function resolveCourse(
  pool: sql.ConnectionPool,
  code: string,
  unit: number,
  departmentId: number
): Promise<{ id: number; title: string; units: number; remark: string }> {
  // 1. Try exact match: same code AND same department
  let res = await pool.request()
    .input('code',   sql.NVarChar, code)
    .input('dept_id', sql.Int,    departmentId)
    .query(`
      SELECT TOP 1 id, course_title, units, remark
      FROM courses
      WHERE course_code = @code AND department_id = @dept_id
    `)

  if (res.recordset.length > 0) {
    const r = res.recordset[0]
    return { id: r.id, title: r.course_title, units: r.units, remark: r.remark ?? '' }
  }

  // 2. Fallback: any row with this course code (different dept)
  res = await pool.request()
    .input('code', sql.NVarChar, code)
    .query(`
      SELECT TOP 1 id, course_title, units, remark
      FROM courses
      WHERE course_code = @code
    `)

  if (res.recordset.length > 0) {
    const r = res.recordset[0]
    return { id: r.id, title: r.course_title, units: r.units, remark: r.remark ?? '' }
  }


  const ins = await pool.request()
    .input('code',  sql.NVarChar, code)
    .input('title', sql.NVarChar, code)
    .input('units', sql.Int,      unit || 3)
    .input('level', sql.Int,      100)
    .input('sem',   sql.NVarChar, 'First Semester')
    .input('dept',  sql.Int,      departmentId)
    .query(`
      INSERT INTO courses (course_code, course_title, units, level, semester, department_id)
      OUTPUT INSERTED.id VALUES (@code, @title, @units, @level, @sem, @dept)
    `)
  return { id: ins.recordset[0].id, title: code, units: unit || 3, remark: '' }
}

function gradePointFromScore(score: number): number {
  if (score >= 70) return 5
  if (score >= 60) return 4
  if (score >= 50) return 3
  if (score >= 45) return 2
  if (score >= 40) return 1
  return 0
}

// --- Batch save helper ---
async function batchSaveResults(pool: sql.ConnectionPool, items: IncomingResult[]): Promise<string[]> {
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  
  try {
    const studentIds: Record<string, number> = {};
    const sessionIds: Record<string, number> = {};
    const courseIds: Record<string, number> = {};
    const savedIds: string[] = [];


    for (const item of items) {
      const { studentInfo } = item;
      

      if (!sessionIds[studentInfo.academicSession]) {
        sessionIds[studentInfo.academicSession] = await resolveSession(transaction as any, studentInfo.academicSession);
      }
      
      // Resolve Student
      if (!studentIds[studentInfo.matricNumber]) {
        studentIds[studentInfo.matricNumber] = await resolveStudent(transaction as any, studentInfo);
      }
      
      const sessId = sessionIds[studentInfo.academicSession];
      const studId = studentIds[studentInfo.matricNumber];
      savedIds.push(`${studId}_${sessId}_${studentInfo.semester}`);
    }


    const resultsToInsert: { student_id: number, course_id: number, session_id: number, semester: string, score: number, grade_point: number }[] = [];
    

    const deptIds: Record<string, number> = {};

    for (const item of items) {
      const { studentInfo, courses } = item;
      const studId = studentIds[studentInfo.matricNumber];
      const sessId = sessionIds[studentInfo.academicSession];
      
      if (!deptIds[studentInfo.department]) {
        const deptRes = await transaction.request()
          .input('deptName', sql.NVarChar, studentInfo.department)
          .query(`SELECT id FROM departments WHERE name = @deptName`);
        deptIds[studentInfo.department] = deptRes.recordset[0]?.id ?? 1;
      }
      const departmentId = deptIds[studentInfo.department];

      for (const course of courses) {
        const cacheKey = `${course.code}_${departmentId}`;
        if (!courseIds[cacheKey]) {
          const { id } = await resolveCourse(transaction as any, course.code, course.unit ?? 3, departmentId);
          courseIds[cacheKey] = id;
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
      
      await transaction.request()
        .input('studId', sql.Int, studId)
        .input('sessId', sql.Int, sessId)
        .input('sem', sql.NVarChar, studentInfo.semester)
        .query(`DELETE FROM results WHERE student_id = @studId AND session_id = @sessId AND semester = @sem`);
    }

    
    const table = new sql.Table('results');
    table.create = false;
    table.columns.add('student_id', sql.Int, { nullable: false });
    table.columns.add('course_id', sql.Int, { nullable: false });
    table.columns.add('session_id', sql.Int, { nullable: false });
    table.columns.add('semester', sql.NVarChar(50), { nullable: false });
    table.columns.add('score', sql.Int, { nullable: false });
    table.columns.add('grade_point', sql.Decimal(5, 2), { nullable: false });

    for (const r of resultsToInsert) {
      table.rows.add(r.student_id, r.course_id, r.session_id, r.semester, r.score, r.grade_point);
    }

    const request = new sql.Request(transaction);
    await request.bulk(table);

    await transaction.commit();
    return savedIds;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection()

  try {

    if (req.method === 'GET') {
      const { recordset } = await pool.request().query(`
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
          c.units,
          c.remark
        FROM results r
        JOIN students          s ON s.id = r.student_id
        JOIN departments       d ON d.id = s.department_id
        JOIN academic_sessions a ON a.id = r.session_id
        JOIN courses           c ON c.id = r.course_id
        ORDER BY d.name, a.session_name, r.semester, s.full_name
      `)

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
            faculty:  row.faculty,
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
              faculty:         row.faculty,
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
          title:      row.course_title ?? row.course_code,   // ← pulled from DB
          unit:       units,
          score,
          gradePoint,
          remark:     row.remark ?? '',                      // ← pulled from DB
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
      const items: IncomingResult[] = Array.isArray(body) ? body : [body]

      if (items.length === 0) {
        return res.status(200).json({ message: 'No results to save' })
      }

      for (const item of items) {
        if (!item?.studentInfo?.matricNumber) {
          return res.status(400).json({ error: 'Missing studentInfo.matricNumber' })
        }
      }

      const ids = await batchSaveResults(pool, items)
      return res.status(201).json({ message: `${ids.length} result(s) saved`, ids })
    }

    if (req.method === 'DELETE') {
      await pool.request().query(`DELETE FROM results`)
      return res.status(200).json({ message: 'All results cleared' })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/results]', err)
    return res.status(500).json({ error: (err as Error).message })
  }
}