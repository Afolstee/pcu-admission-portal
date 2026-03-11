from database import Database

schemas = [
    """
    CREATE TABLE IF NOT EXISTS lecturers (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE,
        phone_number VARCHAR(50),
        department_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """,
    """
    ALTER TABLE courses 
    ADD COLUMN IF NOT EXISTS lecturer_id INT REFERENCES lecturers(id) ON DELETE SET NULL;
    """
]

for stmt in schemas:
    try:
        with Database.get_cursor() as cursor:
            cursor.execute(stmt)
            print("Successfully executed:", stmt.strip().split('\\n')[0])
    except Exception as e:
        print("Error executing:", stmt.strip().split('\\n')[0], "->", e)

print("Migration completed.")
