-- ==========================================
-- STAGE 2 MIGRATION: STUDENT COURSE REGISTRATION
-- ==========================================

-- 1. Add username to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE;

-- 2. Create Students Table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    matric_number VARCHAR(50) UNIQUE NOT NULL,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    current_level VARCHAR(50) DEFAULT '100 Level',
    session VARCHAR(50),
    is_first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Courses Table (To be imported via Excel)
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_title VARCHAR(255) NOT NULL,
    credit_units INT NOT NULL,
    semester VARCHAR(50) NOT NULL, -- e.g., 'First', 'Second'
    level VARCHAR(50) NOT NULL,    -- e.g., '100 Level', '200 Level'
    program_id INT REFERENCES programs(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'Compulsory', 'Core', 'Elective'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create Course Registrations (Header per semester/session)
CREATE TABLE IF NOT EXISTS course_registrations (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted' (locked after deadline)
    total_credits INT DEFAULT 0,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, session, semester)
);

-- 5. Create Registered Courses (Items in the registration session)
CREATE TABLE IF NOT EXISTS registered_courses (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES course_registrations(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registration_id, course_id)
);

-- 6. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_students_matric_number ON students(matric_number);
CREATE INDEX IF NOT EXISTS idx_courses_program_level_semester ON courses(program_id, level, semester);
CREATE INDEX IF NOT EXISTS idx_course_registrations_student ON course_registrations(student_id, session, semester);

-- 7. Add registration deadline to programs
ALTER TABLE programs ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP;
