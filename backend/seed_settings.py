from database import Database

queries = [
    ("INSERT INTO system_settings (key, value, description) VALUES ('admission_registration_locked', 'false', 'Lock prospective students from applying for admission') ON CONFLICT (key) DO NOTHING", None),
    ("INSERT INTO system_settings (key, value, description) VALUES ('course_registration_locked', 'false', 'Lock current students from modifying course registration') ON CONFLICT (key) DO NOTHING", None),
    ("INSERT INTO system_settings (key, value, description) VALUES ('result_upload_locked', 'false', 'Lock lecturers and staff from uploading new result files') ON CONFLICT (key) DO NOTHING", None),
    ("INSERT INTO system_settings (key, value, description) VALUES ('undergraduate_admission_locked', 'false', 'Lock Undergraduate admission applications') ON CONFLICT (key) DO NOTHING", None),
    ("INSERT INTO system_settings (key, value, description) VALUES ('postgraduate_admission_locked', 'false', 'Lock Postgraduate admission applications') ON CONFLICT (key) DO NOTHING", None),
    ("INSERT INTO system_settings (key, value, description) VALUES ('part_time_admission_locked', 'false', 'Lock Part-Time admission applications') ON CONFLICT (key) DO NOTHING", None),
    ("INSERT INTO system_settings (key, value, description) VALUES ('jupeb_admission_locked', 'false', 'Lock JUPEB admission applications') ON CONFLICT (key) DO NOTHING", None)
]

for q, p in queries:
    Database.execute_update(q, p)

print("Settings seeded successfully.")
