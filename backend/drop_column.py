from database import Database

try:
    with Database.get_cursor() as cur:
        cur.execute("ALTER TABLE courses DROP COLUMN IF EXISTS lecturer;")
    print("Dropped legacy lecturer column successfully.")
except Exception as e:
    print("Error:", e)
