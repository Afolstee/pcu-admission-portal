from database import Database

def init_academic_settings():
    settings = [
        ('current_academic_session', '2025/2026', 'The active academic session for the entire portal.'),
        ('current_semester', 'First Semester', 'The active semester (First Semester, Second Semester).')
    ]
    
    for key, value, desc in settings:
        # Check if exists
        exists = Database.execute_query("SELECT 1 FROM system_settings WHERE key = %s", (key,))
        if not exists:
            Database.execute_update(
                "INSERT INTO system_settings (key, value, description) VALUES (%s, %s, %s)",
                (key, value, desc)
            )
            print(f"Initialized setting: {key} = {value}")
        else:
            print(f"Setting {key} already exists.")

if __name__ == "__main__":
    init_academic_settings()
