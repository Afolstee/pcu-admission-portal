from database import Database

schema = """
CREATE TABLE IF NOT EXISTS global_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value VARCHAR(255) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO global_settings (setting_key, setting_value, description) 
VALUES 
('admission_portal_open', 'true', 'Toggle to open or close the admission application portal'),
('course_registration_open', 'true', 'Toggle to open or close course registration for all students')
ON CONFLICT (setting_key) DO NOTHING;
"""

try:
    with Database.get_cursor() as cursor:
        cursor.execute(schema)
    print("Settings table initialized")
except Exception as e:
    print("Settings table error:", e)
