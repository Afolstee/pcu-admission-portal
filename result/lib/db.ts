import sql from "mssql";

const config: sql.config = {
  user: process.env.DB_USER, // "sa",
  password: process.env.DB_PASSWORD, //"#Darasimi1",
  server: process.env.DB_HOST as string, // "localhost",   
  database: process.env.DB_NAME, //"ResultCalculatorDB",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  if (pool) return pool;

  try {
    pool = await sql.connect(config);
    console.log("✅ SQL Server connected");
    return pool;
  } catch (err) {
    console.error("❌ SQL Connection Error:", err);
    throw err;
  }
}
