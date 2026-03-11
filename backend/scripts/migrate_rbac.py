"""RBAC Migration: Creates staff, lecturer_courses, student_scores, score_audit_log, transcript_logs tables."""
from database import Database

SQL = """
-- Staff profiles
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    staff_id VARCHAR(50) UNIQUE,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    faculty_id INT REFERENCES faculties(id) ON DELETE SET NULL,
    title VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lecturer-to-course assignments
CREATE TABLE IF NOT EXISTS lecturer_courses (
    id SERIAL PRIMARY KEY,
    lecturer_id INT NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    session VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    UNIQUE(lecturer_id, course_id, session, semester)
);

-- Student scores / results
CREATE TABLE IF NOT EXISTS student_scores (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    registration_id INT REFERENCES course_registrations(id) ON DELETE SET NULL,
    session VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    ca_score DECIMAL(5,2),
    exam_score DECIMAL(5,2),
    total_score DECIMAL(5,2),
    grade VARCHAR(5),
    grade_point DECIMAL(4,2),
    status VARCHAR(50) DEFAULT 'draft',
    entered_by INT REFERENCES users(id) ON DELETE SET NULL,
    approved_by INT REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, course_id, session, semester)
);

-- Audit trail for every score change
CREATE TABLE IF NOT EXISTS score_audit_log (
    id SERIAL PRIMARY KEY,
    score_id INT NOT NULL REFERENCES student_scores(id) ON DELETE CASCADE,
    changed_by INT NOT NULL REFERENCES users(id),
    change_type VARCHAR(50) NOT NULL,
    old_ca_score DECIMAL(5,2),
    new_ca_score DECIMAL(5,2),
    old_exam_score DECIMAL(5,2),
    new_exam_score DECIMAL(5,2),
    reason TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transcript signing/issuing log
CREATE TABLE IF NOT EXISTS transcript_logs (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id),
    requested_by INT REFERENCES users(id) ON DELETE SET NULL,
    signed_by INT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending',
    signed_at TIMESTAMP,
    issued_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_dept ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_lc_lecturer ON lecturer_courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_lc_course ON lecturer_courses(course_id);
CREATE INDEX IF NOT EXISTS idx_scores_student ON student_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_scores_course ON student_scores(course_id);
CREATE INDEX IF NOT EXISTS idx_scores_status ON student_scores(status);
CREATE INDEX IF NOT EXISTS idx_audit_score ON score_audit_log(score_id);
CREATE INDEX IF NOT EXISTS idx_transcript_student ON transcript_logs(student_id);
"""

def compute_grade(total: float):
    """Return (grade, grade_point) from a total score."""
    if total >= 70: return 'A', 5.0
    if total >= 60: return 'B', 4.0
    if total >= 50: return 'C', 3.0
    if total >= 45: return 'D', 2.0
    if total >= 40: return 'E', 1.0
    return 'F', 0.0

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
        print("RBAC migration complete.")
    except Exception as e:
        conn.rollback()
        print(f"Migration error: {e}")
    finally:
        Database.release_connection(conn)

if __name__ == "__main__":
    run()
