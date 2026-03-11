"""Migration: Create system_settings table."""
from database import Database

SQL = """
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO system_settings (key, value, description) 
VALUES 
    ('registration_locked', 'false', 'Lock the student registration portal'),
    ('admission_registration_locked', 'false', 'Lock the applicant admission registration portal (Signup)')
ON CONFLICT (key) DO NOTHING;
"""

def run():
    conn = Database.get_connection()
    if not conn:
        print("Could not connect to database"); return
    try:
        with conn.cursor() as cur:
            for stmt in SQL.strip().split(';'):
                stmt = stmt.strip()
                if stmt:
                    cur.execute(stmt)
        conn.commit()
        print("System settings migration complete.")
    except Exception as e:
        conn.rollback()
        print(f"Migration error: {e}")
    finally:
        Database.release_connection(conn)

if __name__ == "__main__":
    run()
