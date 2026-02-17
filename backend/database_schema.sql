-- Create database
CREATE DATABASE IF NOT EXISTS admission_portal;
USE admission_portal;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    role ENUM('applicant', 'admin') NOT NULL DEFAULT 'applicant',
    status ENUM('active', 'inactive', 'suspended') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Programs table
CREATE TABLE programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    faculty VARCHAR(255),
    department VARCHAR(255),
    level VARCHAR(50),
    mode VARCHAR(50),
    session VARCHAR(20),
    resumption_date VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Program fees table (stores acceptance & tuition fees per program)
CREATE TABLE program_fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL UNIQUE,
    acceptance_fee DECIMAL(10, 2) NOT NULL,
    tuition_fee DECIMAL(10, 2) NOT NULL,
    other_fees DECIMAL(10, 2) DEFAULT 0,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- Insert program fees
INSERT INTO program_fees (program_id, acceptance_fee, tuition_fee, other_fees) VALUES
    (1, 20000.00, 177000.00, 123000.00),  -- Mass Communication (Part-Time)
    (2, 25000.00, 250000.00, 150000.00),  -- Computer Science (Full-Time)
    (3, 20000.00, 180000.00, 120000.00),  -- Business Administration (Part-Time)
    (4, 30000.00, 350000.00, 200000.00),  -- Law (Full-Time)
    (5, 25000.00, 220000.00, 130000.00);  -- Nursing (Full-Time)

-- Applicants table
CREATE TABLE applicants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    program_id INT NOT NULL,
    application_status ENUM('pending', 'submitted', 'under_review', 'accepted', 'rejected', 'recommended') NOT NULL DEFAULT 'pending',
    recommended_program_id INT,
    admission_status ENUM('not_admitted', 'admitted', 'admission_revoked') NOT NULL DEFAULT 'not_admitted',
    has_paid_acceptance_fee BOOLEAN DEFAULT FALSE,
    has_paid_tuition BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (recommended_program_id) REFERENCES programs(id)
);

-- Application forms table
CREATE TABLE application_forms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_id INT NOT NULL UNIQUE,
    program_id INT NOT NULL,
    -- Mock form fields for now 
    full_name VARCHAR(255),
    date_of_birth DATE,
    nationality VARCHAR(100),
    address TEXT,
    qualification_type VARCHAR(100),
    qualification_institution VARCHAR(255),
    qualification_year INT,
    work_experience TEXT,
    additional_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- Documents table
CREATE TABLE documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    application_form_id INT NOT NULL,
    document_type VARCHAR(100) NOT NULL, -- e.g., 'transcript', 'certificate', 'identification'
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    compressed_size INT,
    mime_type VARCHAR(100),
    is_compressed BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_form_id) REFERENCES application_forms(id) ON DELETE CASCADE,
    INDEX (application_form_id)
);

-- Admission letters table 
CREATE TABLE admission_letters (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_id INT NOT NULL,
    letter_template_id INT,
    recipient_email VARCHAR(255),
    recipient_name VARCHAR(255),
    program VARCHAR(100),
    admission_date DATE,
    letter_content LONGTEXT,
    status ENUM('generated', 'sent', 'viewed') DEFAULT 'generated',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);

-- Application reviews table
CREATE TABLE application_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_id INT NOT NULL,
    reviewed_by INT NOT NULL,
    review_notes TEXT,
    recommendation ENUM('accept', 'reject', 'recommend_other_program') DEFAULT 'accept',
    recommended_program_id INT,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    FOREIGN KEY (recommended_program_id) REFERENCES programs(id)
);

-- Payment transactions table 
CREATE TABLE payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    applicant_id INT NOT NULL,
    payment_type ENUM('acceptance_fee', 'tuition') NOT NULL,
    amount DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    payment_method VARCHAR(50),
    reference_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (applicant_id) REFERENCES applicants(id) ON DELETE CASCADE
);



-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_applicants_user_id ON applicants(user_id);
CREATE INDEX idx_applicants_status ON applicants(application_status);
CREATE INDEX idx_application_forms_applicant ON application_forms(applicant_id);
CREATE INDEX idx_admission_letters_applicant ON admission_letters(applicant_id);
CREATE INDEX idx_admission_letters_status ON admission_letters(status);

