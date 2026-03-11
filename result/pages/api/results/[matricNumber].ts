import type { NextApiRequest, NextApiResponse } from 'next'
import sql from 'mssql'
import { getConnection } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { matricNumber } = req.query   
  const param = Array.isArray(matricNumber) ? matricNumber[0] : (matricNumber ?? '')

  const pool = await getConnection()

  try {

    if (req.method === 'GET') {
      const studentRes = await pool.request()
        .input('matric', sql.NVarChar, param)
        .query(`
          SELECT s.id, s.full_name, s.matric_number, s.current_level,
                 d.name AS department_name, d.faculty
          FROM students s
          JOIN departments d ON d.id = s.department_id
          WHERE s.matric_number = @matric
        `)

      if (studentRes.recordset.length === 0) {
        return res.status(404).json({ message: 'Student not found' })
      }

      const student = studentRes.recordset[0]

      const coursesRes = await pool.request()
        .input('student_id', sql.Int, student.id)
        .query(`
          SELECT
            r.id AS result_id, r.session_id, r.semester, r.score, r.grade_point,
            r.created_at,
            c.id AS course_id, c.course_code, c.units,
            a.session_name
          FROM results r
          JOIN courses           c ON c.id = r.course_id
          JOIN academic_sessions a ON a.id = r.session_id
          WHERE r.student_id = @student_id
          ORDER BY r.created_at DESC
        `)

      return res.status(200).json({
        studentInfo: {
          name:            student.full_name,
          matricNumber:    student.matric_number,
          level:           String(student.current_level),
          faculty:         student.faculty,
          department:      student.department_name,
          academicSession: coursesRes.recordset[0]?.session_name ?? '',
          semester:        coursesRes.recordset[0]?.semester ?? '',
        },
        courses: coursesRes.recordset.map((r) => ({
          id:         String(r.course_id),
          code:       r.course_code,
          unit:       r.units,
          score:      r.score,
          gradePoint: parseFloat(r.grade_point),
        })),
      })
    }

    if (req.method === 'DELETE') {
      const parts = param.split('_')

      if (parts.length < 3) {
        return res.status(400).json({ error: 'Invalid id format. Expected studentId_sessionId_semester' })
      }

      const studentId = parseInt(parts[0], 10)
      const sessionId = parseInt(parts[1], 10)
      const semester  = parts.slice(2).join('_')   // rejoin in case semester has underscores

      if (isNaN(studentId) || isNaN(sessionId)) {
        return res.status(400).json({ error: 'Invalid id: studentId and sessionId must be numbers' })
      }

      await pool.request()
        .input('student_id', sql.Int, studentId)
        .input('session_id', sql.Int, sessionId)
        .input('semester',   sql.NVarChar, semester)
        .query(`
          DELETE FROM results
          WHERE student_id = @student_id
            AND session_id = @session_id
            AND semester   = @semester
        `)

      return res.status(200).json({ message: 'Result deleted successfully' })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/results/[matricNumber]]', err)
    return res.status(500).json({ error: (err as Error).message })
  }
}