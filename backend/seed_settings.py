from database import Database

queries = [
    ("INSERT INTO system_settings (key, value, description) VALUES ('admission_registration_locked', 'false', 'Lock prospective students from applying for admission') ON CONFLICT (key) DO NOTHING", None),
    ("INSERT INTO system_settings (key, value, description) VALUES ('registration_locked', 'false', 'Lock current students from modifying course registration') ON CONFLICT (key) DO NOTHING", None)
]

for q, p in queries:
    Database.execute_update(q, p)

print("Settings seeded successfully.")
