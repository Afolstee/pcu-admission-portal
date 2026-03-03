
CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    slug VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    faculty_id INT NOT NULL REFERENCES faculties(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(faculty_id, slug)
);


CREATE TABLE IF NOT EXISTS degree_programs (
    id SERIAL PRIMARY KEY,
    program_id INT NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    mode VARCHAR(50), -- full-time / part-time
    duration_years INT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(program_id, department_id, slug)
);

CREATE TABLE IF NOT EXISTS applicants (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE, -- link to auth users table
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    applicant_id INT NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
    degree_program_id INT NOT NULL REFERENCES degree_programs(id) ON DELETE RESTRICT,
    session VARCHAR(20) NOT NULL,
    form_data JSONB NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS application_reviews (
    id SERIAL PRIMARY KEY,
    application_id INT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    reviewer_id INT,
    recommended_degree_program_id INT 
        REFERENCES degree_programs(id) ON DELETE SET NULL,
    decision VARCHAR(50), -- approved / rejected / pending
    comments TEXT,
    reviewed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_departments_faculty 
ON departments(faculty_id);

CREATE INDEX IF NOT EXISTS idx_degree_programs_program 
ON degree_programs(program_id);

CREATE INDEX IF NOT EXISTS idx_degree_programs_department 
ON degree_programs(department_id);

CREATE INDEX IF NOT EXISTS idx_applications_applicant 
ON applications(applicant_id);

CREATE INDEX IF NOT EXISTS idx_applications_degree_program 
ON applications(degree_program_id);


INSERT INTO program_fees (program_id, acceptance_fee, tuition_fee, other_fees) VALUES
    (1, 20000.00, 177000.00, 123000.00),  -- Mass Communication (Part-Time)
    (2, 25000.00, 250000.00, 150000.00),  -- Computer Science (Full-Time)
    (3, 20000.00, 180000.00, 120000.00),  -- Business Administration (Part-Time)
    (4, 30000.00, 350000.00, 200000.00),  -- Law (Full-Time)
    (5, 25000.00, 220000.00, 130000.00);  -- Nursing (Full-Time)


CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_applicants_user_id ON applicants(user_id);
CREATE INDEX idx_applicants_status ON applicants(application_status);
CREATE INDEX idx_application_forms_applicant ON application_forms(applicant_id);
CREATE INDEX idx_admission_letters_applicant ON admission_letters(applicant_id);
CREATE INDEX idx_admission_letters_status ON admission_letters(status);

