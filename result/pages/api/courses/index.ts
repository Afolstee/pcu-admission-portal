// pages/api/courses/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import sql from 'mssql';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();

  // ── GET: fetch course by code, optionally filtered by department name ──────
  if (req.method === 'GET') {
    const code       = Array.isArray(req.query.code)        ? req.query.code[0]        : req.query.code;
    const department = Array.isArray(req.query.department)  ? req.query.department[0]  : req.query.department;

    if (!code) return res.status(400).json({ message: 'Missing course code' });

    try {
      let result;

      // 1. Try exact match: code + department name
      if (department) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .input('dept', sql.NVarChar, department)
          .query(`
            SELECT TOP 1
              c.id,
              c.course_code,
              c.course_title,
              c.units,
              c.remark,
              d.name AS department_name
            FROM courses c
            JOIN departments d ON d.id = c.department_id
            WHERE c.course_code = @code
              AND d.name = @dept
          `);
      }

      // 2. Fallback 1: match by faculty + elective/required remark
      if (department && (!result || result.recordset.length === 0)) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .input('dept', sql.NVarChar, department)
          .query(`
            SELECT TOP 1
              c.id,
              c.course_code,
              c.course_title,
              c.units,
              c.remark,
              d.name AS department_name
            FROM courses c
            JOIN departments d ON d.id = c.department_id
            WHERE c.course_code = @code
              AND (c.remark = 'E' OR c.remark LIKE '%Elective%' OR c.remark LIKE '%elective%')
              AND d.faculty = (SELECT TOP 1 faculty FROM departments WHERE name = @dept)
          `);
      }

      // 3. Fallback 2: any row with this code across all departments
      if (!result || result.recordset.length === 0) {
        result = await pool.request()
          .input('code', sql.NVarChar, code)
          .query(`
            SELECT TOP 1
              c.id,
              c.course_code,
              c.course_title,
              c.units,
              c.remark,
              d.name AS department_name
            FROM courses c
            JOIN departments d ON d.id = c.department_id
            WHERE c.course_code = @code
          `);
      }

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Course not found' });
      }

      const row = result.recordset[0];
      // Return a clean, consistent shape the frontend can rely on
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

  // ── POST: update or insert a course title ─────────────────────────────────
  if (req.method === 'POST') {
    const { code, title } = req.body;
    if (!code || !title) return res.status(400).json({ message: 'Missing code or title' });

    try {
      const existing = await pool.request()
        .input('code', sql.NVarChar, code)
        .query(`SELECT id FROM courses WHERE course_code = @code`);

      if (existing.recordset.length > 0) {
        await pool.request()
          .input('code',  sql.NVarChar, code)
          .input('title', sql.NVarChar, title)
          .query(`UPDATE courses SET course_title = @title WHERE course_code = @code`);
        return res.status(200).json({ message: 'Course updated' });
      } else {
        await pool.request()
          .input('code',  sql.NVarChar, code)
          .input('title', sql.NVarChar, title)
          .query(`
            INSERT INTO courses (course_code, course_title, units, level, semester, department_id)
            VALUES (@code, @title, 3, 100, 'First Semester', 1)
          `);
        return res.status(201).json({ message: 'Course created' });
      }
    } catch (err) {
      console.error('[POST /api/courses]', err);
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}