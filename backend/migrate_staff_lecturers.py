from database import Database

schemas = [
    """
    ALTER TABLE courses
    DROP CONSTRAINT IF EXISTS courses_lecturer_id_fkey;
    """,
    """
    DROP TABLE IF EXISTS lecturers CASCADE;
    """,
    """
    ALTER TABLE courses 
    ADD CONSTRAINT courses_lecturer_id_fkey FOREIGN KEY (lecturer_id) REFERENCES staff(id) ON DELETE SET NULL;
    """
]

for stmt in schemas:
    try:
        with Database.get_cursor() as cursor:
            cursor.execute(stmt)
            print("Successfully executed:", stmt.strip().split('\n')[0])
    except Exception as e:
        print("Error executing:", stmt.strip().split('\n')[0], "->", e)

print("Migration completed.")
