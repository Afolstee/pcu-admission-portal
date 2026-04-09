from database import Database

try:
    # Get IDs for faculties and departments to be safe
    faculties = Database.execute_query("SELECT id FROM faculties LIMIT 1")
    departments = Database.execute_query("SELECT id FROM departments LIMIT 1")
    
    f_id = faculties[0]['id'] if faculties else 1
    d_id = departments[0]['id'] if departments else 1

    queries = [
        ("INSERT INTO programs (name, description, department_id, program_type_id, session, level) VALUES ('JUPEB General', 'General JUPEB Program', %s, 3, '2025/2026', '100 Level') ON CONFLICT (name, program_type_id) DO NOTHING", (d_id,)),
        ("INSERT INTO programs (name, description, department_id, program_type_id, session, level) VALUES ('HND Conversion Program', 'HND Conversion', %s, 4, '2025/2026', '300 Level') ON CONFLICT (name, program_type_id) DO NOTHING", (d_id,)),
        ("INSERT INTO programs (name, description, department_id, program_type_id, session, level) VALUES ('Postgraduate General', 'Postgraduate Studies', %s, 2, '2025/2026', 'Postgraduate') ON CONFLICT (name, program_type_id) DO NOTHING", (d_id,))
    ]

    for q, p in queries:
        Database.execute_update(q, p)
    print("Programs seeded successfully")
except Exception as e:
    print(f"Error: {e}")
