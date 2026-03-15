import { Pool } from 'pg';

let pool: Pool | null = null;

export async function getConnection() {
  if (pool) return pool;

  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
    });
    console.log("✅ Postgres DB connected via pg package");
    return pool;
  } catch (err) {
    console.error("❌ Postgres Connection Error:", err);
    throw err;
  }
}
