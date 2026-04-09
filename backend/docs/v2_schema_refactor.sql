-- Database Schema Refactoring for faculties, departments, and programs
-- WARNING: This script drops and recreates tables. 

DROP TABLE IF EXISTS registered_courses CASCADE;
DROP TABLE IF EXISTS program_courses CASCADE;
DROP TABLE IF EXISTS course_registrations CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS admission_letter_tracking CASCADE;
DROP TABLE IF EXISTS application_reviews CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS application_forms CASCADE;
DROP TABLE IF EXISTS applicants CASCADE;
DROP TABLE IF EXISTS program_fees CASCADE;
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS program_types CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS faculties CASCADE;
DROP TABLE IF EXISTS letter_templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'applicant',
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Faculties
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    code VARCHAR(10) UNIQUE
);

-- 3. Departments
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    faculty_id INT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
    code VARCHAR(10) UNIQUE
);

-- 4. Program Types (Mode of Study)
CREATE TABLE program_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- 5. Programs Table
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL, -- e.g. "B.Sc. Computer Science"
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    program_type_id INT NOT NULL REFERENCES program_types(id) ON DELETE CASCADE,
    description TEXT,
    duration_years INT DEFAULT 4,
    level VARCHAR(50) DEFAULT '100 Level',
    session VARCHAR(50) DEFAULT '2025/2026',
    resumption_date VARCHAR(100),
    registration_deadline TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, program_type_id)
);

-- 6. Program Fees Table
CREATE TABLE program_fees (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    acceptance_fee DECIMAL(12, 2) DEFAULT 0.00,
    tuition_fee DECIMAL(12, 2) DEFAULT 0.00,
    other_fees DECIMAL(12, 2) DEFAULT 0.00
);

-- 7. Applicants Table
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    application_status VARCHAR(50) DEFAULT 'pending',
    admission_status VARCHAR(50) DEFAULT 'pending',
    has_paid_acceptance_fee BOOLEAN DEFAULT FALSE,
    has_paid_tuition BOOLEAN DEFAULT FALSE,
    recommended_course_response VARCHAR(50),
    accepted_recommended_program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Application Forms Table
CREATE TABLE application_forms (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE UNIQUE,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    full_name VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(100),
    address TEXT,
    qualification_type VARCHAR(100),
    qualification_institution VARCHAR(255),
    qualification_year INT,
    work_experience TEXT,
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Documents
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    application_form_id INT NOT NULL REFERENCES application_forms(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    compressed_size BIGINT,
    mime_type VARCHAR(100),
    is_compressed BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Payment Transactions
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    reference_id VARCHAR(255) UNIQUE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Application Reviews Table
CREATE TABLE application_reviews (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    reviewed_by INT REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    recommendation VARCHAR(50),
    recommended_program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Letter Templates Table
CREATE TABLE letter_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    mode VARCHAR(50),
    content TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Admission Letter Tracking Table
CREATE TABLE admission_letter_tracking (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    error_message TEXT,
    retry_count INT DEFAULT 0,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- STAGE 2: STUDENT COURSE REGISTRATION
-- ==========================================

-- 14. Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    matric_number VARCHAR(50) UNIQUE NOT NULL,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    current_level VARCHAR(50) DEFAULT '100 Level',
    session VARCHAR(50),
    is_first_login BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 15. Courses Table
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) NOT NULL UNIQUE,
    course_title VARCHAR(255) NOT NULL,
    credit_units INT NOT NULL,
    department_id INT REFERENCES departments(id) ON DELETE SET NULL,
    remark VARCHAR(50) DEFAULT 'Compulsory', -- 'Compulsory', 'Core', 'Elective'
    lecturer VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 16. Program Courses (Curriculum Logic)
CREATE TABLE program_courses (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    UNIQUE(program_id, course_id, level, semester)
);

-- 17. Course Registrations
CREATE TABLE course_registrations (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    session VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'draft',
    total_credits INT DEFAULT 0,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, session, semester)
);

-- 18. Registered Courses
CREATE TABLE registered_courses (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES course_registrations(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registration_id, course_id)
);


-- INDEXES
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_applicants_user_id ON applicants(user_id);
CREATE INDEX idx_departments_faculty ON departments(faculty_id);
CREATE INDEX idx_programs_department ON programs(department_id);
CREATE INDEX idx_courses_department ON courses(department_id);

-- ==========================================
-- DUMMY SEED DATA
-- ==========================================

-- Seed Faculties
INSERT INTO faculties (name, code) VALUES
    ('Faculty of Pure and Applied Sciences', 'FPAS'),
    ('Faculty of Social and Management Sciences', 'FSMS');

-- Seed Departments
INSERT INTO departments (name, faculty_id, code) VALUES
    ('Natural Science', 1, 'NSC'),
    ('Physical Science', 1, 'PSC'),
    ('Mass Communication', 2, 'MAC'),
    ('Accounting', 2, 'ACC'),
    ('Business Administration', 2, 'BUS'),
    ('International Relations', 2, 'IRE'),
    ('Procurement', 2, 'PRM'),
    ('Economics', 2, 'ECO');

-- Seed Program Types (Modes of Study)
INSERT INTO program_types (name) VALUES
    ('Undergraduate'),
    ('Postgraduate'),
    ('Jupeb'),
    ('Part-Time (HND Conversion)');

-- Seed Programs (Course of Study mapping to departments and modes)
-- NOTE: We are assigning basic Undergraduate programs for demonstration
INSERT INTO programs (name, department_id, program_type_id, description, duration_years) VALUES
    ('B.Sc. Microbiology', 1, 1, 'Undergraduate Microbiology degrees', 4),
    ('B.Sc. Computer Science', 2, 1, 'Undergraduate Computer Science', 4),
    ('B.Sc. Cyber Security', 2, 1, 'Undergraduate Cyber Security', 4),
    ('B.Sc. Physics with Electronics', 2, 1, 'Undergraduate Physics with Electronics', 4),
    ('B.Sc. Mass Communication', 3, 1, 'Undergraduate Mass Communication', 4),
    ('B.Sc. Accounting', 4, 1, 'Undergraduate Accounting', 4),
    ('B.Sc. Business Administration', 5, 1, 'Undergraduate Business Admin', 4),
    ('B.Sc. International Relations', 6, 1, 'Undergraduate International Relations', 4),
    ('B.Sc. Procurement', 7, 1, 'Undergraduate Procurement', 4),
    ('B.Sc. Economics', 8, 1, 'Undergraduate Economics', 4);

-- Seed Fees (Assumes all undergraduate programs map 1:1 roughly)
INSERT INTO program_fees (program_id, acceptance_fee, tuition_fee, other_fees) VALUES
    (1, 25000.00, 250000.00, 150000.00),
    (2, 25000.00, 250000.00, 150000.00),
    (3, 25000.00, 250000.00, 150000.00),
    (4, 25000.00, 250000.00, 150000.00),
    (5, 20000.00, 180000.00, 120000.00),
    (6, 20000.00, 180000.00, 120000.00),
    (7, 20000.00, 180000.00, 120000.00),
    (8, 20000.00, 180000.00, 120000.00),
    (9, 20000.00, 180000.00, 120000.00),
    (10, 20000.00, 180000.00, 120000.00);
