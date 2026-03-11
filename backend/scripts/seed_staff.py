"""
seed_staff.py
=============
Creates one seed staff account per role, with staff profiles assigned to
real departments/faculties from the database.

Faculty layout:
  id=1  Faculty of Pure and Applied Sciences (FPAS)
  id=2  Faculty of Social and Management Sciences (FSMS)

Department layout:
  id=1  Natural Science       (faculty 1)
  id=2  Physical Science      (faculty 1)
  id=3  Mass Communication    (faculty 2)
  id=4  Accounting            (faculty 2)
  id=5  Business Administration (faculty 2)
  id=6  International Relations (faculty 2)
  id=7  Procurement           (faculty 2)
  id=8  Economics             (faculty 2)

Default password for ALL seed accounts: Password@123
"""

import hashlib
from database import Database

# ── helpers ───────────────────────────────────────────────────────────────────

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

DEFAULT_PASSWORD = hash_pw("Password@123")

# ── seed data ─────────────────────────────────────────────────────────────────

STAFF_SEEDS = [
    # --- DEAN ---
    {
        "name":          "Prof. Chukwuemeka Obi",
        "email":         "dean.fpas@pcu.edu.ng",
        "role":          "dean",
        "title":         "Prof.",
        "department_id": None,          # Dean oversees whole faculty
        "faculty_id":    1,             # FPAS
        "staff_id":      "DEAN-FPAS-001",
    },
    {
        "name":          "Prof. Adaeze Nwosu",
        "email":         "dean.fsms@pcu.edu.ng",
        "role":          "dean",
        "title":         "Prof.",
        "department_id": None,
        "faculty_id":    2,             # FSMS
        "staff_id":      "DEAN-FSMS-001",
    },

    # --- HOD ---
    {
        "name":          "Dr. Emeka Uzo",
        "email":         "hod.natscience@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 1,             # Natural Science
        "faculty_id":    1,
        "staff_id":      "HOD-NSC-001",
    },
    {
        "name":          "Dr. Funmi Bello",
        "email":         "hod.physcience@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 2,             # Physical Science
        "faculty_id":    1,
        "staff_id":      "HOD-PSC-001",
    },
    {
        "name":          "Dr. Kola Adeyemi",
        "email":         "hod.accounting@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 4,             # Accounting
        "faculty_id":    2,
        "staff_id":      "HOD-ACC-001",
    },
    {
        "name":          "Dr. Ngozi Eze",
        "email":         "hod.masscomm@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 3,             # Mass Communication
        "faculty_id":    2,
        "staff_id":      "HOD-MCM-001",
    },
    {
        "name":          "Dr. Segun Alade",
        "email":         "hod.busadmin@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 5,             # Business Administration
        "faculty_id":    2,
        "staff_id":      "HOD-BUS-001",
    },
    {
        "name":          "Dr. Amara Obiora",
        "email":         "hod.intlrel@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 6,             # International Relations
        "faculty_id":    2,
        "staff_id":      "HOD-IRS-001",
    },
    {
        "name":          "Dr. Yusuf Garba",
        "email":         "hod.procurement@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 7,             # Procurement
        "faculty_id":    2,
        "staff_id":      "HOD-PRM-001",
    },
    {
        "name":          "Dr. Chisom Okafor",
        "email":         "hod.economics@pcu.edu.ng",
        "role":          "hod",
        "title":         "Dr.",
        "department_id": 8,             # Economics
        "faculty_id":    2,
        "staff_id":      "HOD-ECO-001",
    },

    # --- LECTURERS ---
    {
        "name":          "Mr. Tunde Lawal",
        "email":         "t.lawal@pcu.edu.ng",
        "role":          "lecturer",
        "title":         "Mr.",
        "department_id": 2,             # Physical Science (CSC/CYB/PHY)
        "faculty_id":    1,
        "staff_id":      "LEC-PSC-001",
    },
    {
        "name":          "Mrs. Blessing Okoro",
        "email":         "b.okoro@pcu.edu.ng",
        "role":          "lecturer",
        "title":         "Mrs.",
        "department_id": 4,             # Accounting
        "faculty_id":    2,
        "staff_id":      "LEC-ACC-001",
    },
    {
        "name":          "Dr. Fatima Suleiman",
        "email":         "f.suleiman@pcu.edu.ng",
        "role":          "lecturer",
        "title":         "Dr.",
        "department_id": 3,             # Mass Communication
        "faculty_id":    2,
        "staff_id":      "LEC-MCM-001",
    },
    {
        "name":          "Mr. Emeka Nwachukwu",
        "email":         "e.nwachukwu@pcu.edu.ng",
        "role":          "lecturer",
        "title":         "Mr.",
        "department_id": 5,             # Business Administration
        "faculty_id":    2,
        "staff_id":      "LEC-BUS-001",
    },
    {
        "name":          "Dr. Adaora Igwe",
        "email":         "a.igwe@pcu.edu.ng",
        "role":          "lecturer",
        "title":         "Dr.",
        "department_id": 1,             # Natural Science (Biochemistry/Microbiology)
        "faculty_id":    1,
        "staff_id":      "LEC-NSC-001",
    },
    {
        "name":          "Mr. Bashir Usman",
        "email":         "b.usman@pcu.edu.ng",
        "role":          "lecturer",
        "title":         "Mr.",
        "department_id": 8,             # Economics
        "faculty_id":    2,
        "staff_id":      "LEC-ECO-001",
    },

    # --- DEO (Data Entry Officer) ---
    {
        "name":          "Miss. Grace Effiong",
        "email":         "deo.fpas@pcu.edu.ng",
        "role":          "deo",
        "title":         "Miss.",
        "department_id": None,
        "faculty_id":    1,             # FPAS
        "staff_id":      "DEO-FPAS-001",
    },
    {
        "name":          "Mr. Solomon Taiwo",
        "email":         "deo.fsms@pcu.edu.ng",
        "role":          "deo",
        "title":         "Mr.",
        "department_id": None,
        "faculty_id":    2,             # FSMS
        "staff_id":      "DEO-FSMS-001",
    },

    # --- REGISTRAR ---
    {
        "name":          "Mrs. Patience Okafor",
        "email":         "registrar@pcu.edu.ng",
        "role":          "registrar",
        "title":         "Mrs.",
        "department_id": None,
        "faculty_id":    None,
        "staff_id":      "REG-001",
    },
]

# ── insert ────────────────────────────────────────────────────────────────────

def run():
    created = []
    skipped = []

    for s in STAFF_SEEDS:
        # Check if email already exists
        existing = Database.execute_query(
            "SELECT id FROM users WHERE email = %s", (s["email"],)
        )
        if existing:
            skipped.append(s["email"])
            continue

        # Insert user
        user_id = Database.execute_update(
            """INSERT INTO users (name, email, password_hash, role, status)
               VALUES (%s, %s, %s, %s, 'active') RETURNING id""",
            (s["name"], s["email"], DEFAULT_PASSWORD, s["role"]),
            return_id=True,
        )
        if not user_id:
            print(f"  ✗ Failed to create user for {s['email']}")
            continue

        # Insert staff profile
        Database.execute_update(
            """INSERT INTO staff (user_id, staff_id, department_id, faculty_id, title)
               VALUES (%s, %s, %s, %s, %s)""",
            (user_id, s["staff_id"], s["department_id"], s["faculty_id"], s["title"]),
        )

        created.append({"email": s["email"], "role": s["role"], "name": s["name"]})
        print(f"  ✓ Created [{s['role']:10}]  {s['name']} — {s['email']}")

    print(f"\n{'─'*60}")
    print(f"Created : {len(created)}")
    print(f"Skipped : {len(skipped)} (already exist)")
    if skipped:
        for e in skipped:
            print(f"  • {e}")
    print(f"\nDefault password for all new accounts: Password@123")
    print("Change these after first login!")

if __name__ == "__main__":
    run()
