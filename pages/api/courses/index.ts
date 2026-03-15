import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();

  if (req.method === 'GET') {
    const code = Array.isArray(req.query.code) ? req.query.code[0] : req.query.code;
    const department = Array.isArray(req.query.department) ? req.query.department[0] : req.query.department;

    if (!code) return res.status(400).json({ message: 'Missing course code' });

    try {
      let result;

      // Try exact match: code + department name
      if (department) {
        result = await pool.query(`
            SELECT 
              c.id,
              c.course_code,
              c.course_title,
              c.credit_units as units,
              c.remark,
              d.name AS department_name
            FROM courses c
            JOIN departments d ON d.id = c.department_id
            WHERE c.course_code = $1
              AND d.name = $2
            LIMIT 1
          `, [code, department]);
      }

      // Fallback 1: any row with this code across all departments
      if (!result || result.rows.length === 0) {
        result = await pool.query(`
            SELECT 
              c.id,
              c.course_code,
              c.course_title,
              c.credit_units as units,
              c.remark,
              d.name AS department_name
            FROM courses c
            LEFT JOIN departments d ON d.id = c.department_id
            WHERE c.course_code = $1
            LIMIT 1
          `, [code]);
      }

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const row = result.rows[0];
      return res.status(200).json({
        id:              row.id,
        course_code:     row.course_code,
        course_title:    row.course_title,
        units:           row.units,
        remark:          row.remark ?? '',
        department_name: row.department_name,
      });
    } catch (err) {
      console.error('[GET /api/courses]', err);
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  if (req.method === 'POST') {
    const { code, title } = req.body;
    if (!code || !title) return res.status(400).json({ message: 'Missing code or title' });

    try {
      const existing = await pool.query(`SELECT id FROM courses WHERE course_code = $1`, [code]);

      if (existing.rows.length > 0) {
        await pool.query(`UPDATE courses SET course_title = $2 WHERE course_code = $1`, [code, title]);
        return res.status(200).json({ message: 'Course updated' });
      } else {
        await pool.query(`
            INSERT INTO courses (course_code, course_title, credit_units)
            VALUES ($1, $2, 3)
          `, [code, title]);
        return res.status(201).json({ message: 'Course created' });
      }
    } catch (err) {
      console.error('[POST /api/courses]', err);
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}