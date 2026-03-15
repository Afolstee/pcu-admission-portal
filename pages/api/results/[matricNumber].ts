import type { NextApiRequest, NextApiResponse } from 'next'
import { getConnection } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { matricNumber } = req.query   
  const param = Array.isArray(matricNumber) ? matricNumber[0] : (matricNumber ?? '')

  const pool = await getConnection()

  try {
    if (req.method === 'GET') {
      const studentRes = await pool.query(`
          SELECT s.id, s.full_name, s.matric_number, s.current_level,
                 d.name AS department_name, f.name AS faculty
          FROM processor_students s
          JOIN departments d ON d.id = s.department_id
          LEFT JOIN faculties f ON f.id = d.faculty_id
          WHERE s.matric_number = $1
        `, [param])

      if (studentRes.rows.length === 0) {
        return res.status(404).json({ message: 'Student not found' })
      }

      const student = studentRes.rows[0]

      const coursesRes = await pool.query(`
          SELECT
            r.id AS result_id, r.session_id, r.semester, r.score, r.grade_point,
            r.created_at,
            c.id AS course_id, c.course_code, c.credit_units as units,
            a.session_name
          FROM processor_results r
          JOIN courses           c ON c.id = r.course_id
          JOIN academic_sessions a ON a.id = r.session_id
          WHERE r.student_id = $1
          ORDER BY r.created_at DESC
        `, [student.id])

      return res.status(200).json({
        studentInfo: {
          name:            student.full_name,
          matricNumber:    student.matric_number,
          level:           String(student.current_level),
          faculty:         student.faculty || 'Unknown',
          department:      student.department_name,
          academicSession: coursesRes.rows[0]?.session_name ?? '',
          semester:        coursesRes.rows[0]?.semester ?? '',
        },
        courses: coursesRes.rows.map((r: any) => ({
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

      await pool.query(`
          DELETE FROM processor_results
          WHERE student_id = $1
            AND session_id = $2
            AND semester   = $3
        `, [studentId, sessionId, semester])

      return res.status(200).json({ message: 'Result deleted successfully' })
    }

    return res.status(405).json({ message: 'Method not allowed' })
  } catch (err) {
    console.error('[/api/results/[matricNumber]]', err)
    return res.status(500).json({ error: (err as Error).message })
  }
}