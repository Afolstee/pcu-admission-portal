import type { NextApiRequest, NextApiResponse } from 'next'
import { getConnection } from '@/lib/db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const pool = await getConnection()

  if (req.method === 'DELETE') {
    try {
      const departmentId = parseInt(req.query.id as string, 10)
      if (isNaN(departmentId)) return res.status(400).json({ error: 'Invalid department ID' })

      // Only clearing master_results now as it is the single source of truth

      await pool.query(`
          DELETE FROM master_results
          WHERE matric_no IN (
            SELECT matric_number FROM processor_students WHERE department_id = $1
          )
        `, [departmentId])
      
      return res.status(200).json({ message: `Department results cleared for ID ${departmentId}` })
    } catch (err) {
      console.error('[/api/results/department/[id]]', err)
      return res.status(500).json({ error: (err as Error).message })
    }
  }

  return res.status(405).json({ message: 'Method not allowed' })
}
