-- Drop tables in reverse dependency order to ensure a clean slate
DROP TABLE IF EXISTS registered_courses CASCADE;
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
DROP TABLE IF EXISTS letter_templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- 1. Users Table (Stores Admins, Applicants, and Students authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) UNIQUE, -- Auto-generated for students (e.g., Surname)
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    role VARCHAR(50) DEFAULT 'applicant', -- 'applicant', 'student', 'admin'
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Programs Table (All Academic Programs/Courses)
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    faculty VARCHAR(255),
    department VARCHAR(255),
    level VARCHAR(50),
    mode VARCHAR(50),
    session VARCHAR(50),
    resumption_date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Program Fees Table (Acceptance and Tuition requirements)
CREATE TABLE program_fees (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    acceptance_fee DECIMAL(12, 2) DEFAULT 0.00,
    tuition_fee DECIMAL(12, 2) DEFAULT 0.00,
    other_fees DECIMAL(12, 2) DEFAULT 0.00
);

-- 4. Applicants Table (Core applicant profile mapping to a user)
CREATE TABLE applicants (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    application_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'submitted', 'under_review', 'accepted', 'rejected'
    admission_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'admitted', 'admission_revoked'
    has_paid_acceptance_fee BOOLEAN DEFAULT FALSE,
    has_paid_tuition BOOLEAN DEFAULT FALSE,
    recommended_course_response VARCHAR(50),
    accepted_recommended_program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Application Forms Table (The actual application data submitted by an applicant)
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

-- 6. Documents Table (Files/Attachments uploaded during application)
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

-- 7. Payment Transactions Table (Receipts generated for portal payments)
CREATE TABLE payment_transactions (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    payment_type VARCHAR(50) NOT NULL, -- 'acceptance_fee', 'tuition'
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(100),
    reference_id VARCHAR(255) UNIQUE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Application Reviews Table (Admin's reviews or recommendations changing program)
CREATE TABLE application_reviews (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    reviewed_by INT REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    recommendation VARCHAR(50), -- 'accept', 'reject', 'recommend_other_program'
    recommended_program_id INT REFERENCES programs(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Letter Templates Table (For sending admission letters)
CREATE TABLE letter_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    mode VARCHAR(50),
    content TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. Admission Letter Tracking Table (Keeps track of send failures/successes via SendGrid)
CREATE TABLE admission_letter_tracking (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'sent', 'failed'
    error_message TEXT,
    retry_count INT DEFAULT 0,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- STAGE 2: STUDENT COURSE REGISTRATION
-- ==========================================

-- 11. Students Table (Created upon application acceptance / tuition payment)
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

-- 12. Courses Table (To be imported via Excel in pgAdmin)
CREATE TABLE courses (
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

-- 13. Student Course Registrations (Header per semester/session)
CREATE TABLE course_registrations (
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

-- 14. Registered Courses (Items in the registration session)
CREATE TABLE registered_courses (
    id SERIAL PRIMARY KEY,
    registration_id INT NOT NULL REFERENCES course_registrations(id) ON DELETE CASCADE,
    course_id INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registration_id, course_id)
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_applicants_user_id ON applicants(user_id);
CREATE INDEX idx_applicants_status ON applicants(application_status);
CREATE INDEX idx_payment_transactions_applicant ON payment_transactions(applicant_id);
CREATE INDEX idx_documents_app_form ON documents(application_form_id);
CREATE INDEX idx_students_matric_number ON students(matric_number);
CREATE INDEX idx_courses_program_level_semester ON courses(program_id, level, semester);
CREATE INDEX idx_course_registrations_student ON course_registrations(student_id, session, semester);


-- ==========================================
-- DUMMY SEED / DEFAULT DATA
-- ==========================================

INSERT INTO programs (name, description, faculty, department, level, mode, session) VALUES
    ('Computer Science', 'BSc Computer Science', 'Sciences', 'Computer Science', '100 Level', 'Full-Time', '2025/2026'),
    ('Business Administration', 'BSc Business Administration', 'Management', 'Business', '100 Level', 'Full-Time', '2025/2026'),
    ('Nursing', 'BSc Nursing', 'Sciences', 'Nursing', '100 Level', 'Full-Time', '2025/2026');

INSERT INTO program_fees (program_id, acceptance_fee, tuition_fee, other_fees) VALUES
    (1, 25000.00, 250000.00, 150000.00),
    (2, 20000.00, 180000.00, 120000.00),
    (3, 25000.00, 220000.00, 130000.00);

-- Note: Admin creation logic is traditionally handled by `seed.py`.
