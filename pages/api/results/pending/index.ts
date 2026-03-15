
import type { NextApiRequest, NextApiResponse } from 'next';
import { getConnection } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection();

  if (req.method === 'GET') {
    const { staffId } = req.query;
    try {
      let query = `
        SELECT p.*, u.name as staff_name
        FROM pending_results p
        LEFT JOIN users u ON u.id = p.staff_id
      `;
      const params: any[] = [];
      const whereClauses: string[] = [];
      
      if (staffId) {
        params.push(staffId);
        whereClauses.push(`p.staff_id = $${params.length}`);
      }
      
      if (req.query.status) {
        params.push(req.query.status);
        whereClauses.push(`p.status = $${params.length}`);
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ` + whereClauses.join(' AND ');
      }
      
      query += ` ORDER BY p.created_at DESC`;
      
      const result = await pool.query(query, params);
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error('[GET /api/results/pending]', err);
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  if (req.method === 'POST') {
    const { staffId, fileName, sheetName, courseCode, payload, fileContent } = req.body;
    
    if (!payload && !fileContent) return res.status(400).json({ message: 'Missing payload or fileContent' });

    try {
      const ins = await pool.query(`
        INSERT INTO pending_results (staff_id, file_name, sheet_name, course_code, payload, status, file_content)
        VALUES ($1, $2, $3, $4, $5, 'pending', $6)
        RETURNING id
      `, [staffId, fileName, sheetName, courseCode, JSON.stringify(payload), fileContent]);
      
      return res.status(201).json({ message: 'Result uploaded successfully and pending processing', id: ins.rows[0].id });
    } catch (err) {
      console.error('[POST /api/results/pending]', err);
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  if (req.method === 'PATCH') {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ message: 'Missing id or status' });

    try {
      await pool.query(`UPDATE pending_results SET status = $1 WHERE id = $2`, [status, id]);
      return res.status(200).json({ message: 'Status updated' });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: 'Missing id' });

    try {
      await pool.query(`DELETE FROM pending_results WHERE id = $1`, [id]);
      return res.status(200).json({ message: 'Pending result deleted' });
    } catch (err) {
      return res.status(500).json({ error: (err as Error).message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
