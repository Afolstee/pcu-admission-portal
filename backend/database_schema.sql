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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Program fees table (stores acceptance & tuition fees per program)
CREATE TABLE program_fees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    program_id INT NOT NULL UNIQUE,
    acceptance_fee DECIMAL(10, 2) NOT NULL,
    tuition_fee DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (program_id) REFERENCES programs(id)
);

-- Insert programs
INSERT INTO programs (name, description) VALUES
    ('Undergraduate', 'Bachelor degree programs'),
    ('Postgraduate', 'Master and PhD programs'),
    ('HND', 'Higher National Diploma programs'),
    ('Part time', 'Part-time study options'),
    ('Jupeb', 'Judicial Postgraduate Education and Bar programs');

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
    letter_template_id INT NOT NULL,
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

-- Letter templates table (we need more samples from admission)
CREATE TABLE letter_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    program_id INT,
    subject VARCHAR(255),
    header_text TEXT,
    body_html LONGTEXT,
    footer_text TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (program_id) REFERENCES programs(id),
    FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY unique_template_per_program (name, program_id)
);

-- default letter template
INSERT INTO letter_templates (name, program_id, subject, header_text, body_html, footer_text) VALUES 
    ('Default', NULL, 'Admission Letter', 'ADMISSION LETTER', 'Dear [APPLICANT_NAME],\n\nCongratulations! We are pleased to inform you that your application for admission to our institution has been accepted.\n\nProgram: [PROGRAM]\nAdmission Date: [ADMISSION_DATE]\n\nPlease proceed with your acceptance by paying the acceptance fee within the stipulated time.\n\nBest regards,\nAdmissions Office', 'This letter is auto-generated and does not require a signature.');

-- FSMS Part Time template
INSERT INTO letter_templates (name, program_id, subject, body_html) VALUES 
    ('Part Time Provisional Admission', 4, 'Provisional Admission – Part Time',
'<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {
    font-family: "Times New Roman", serif;
    font-size: 14px;
    line-height: 1.6;
    color: #000;
}
.header {
    text-align: center;
}
.title {
    text-align: center;
    font-weight: bold;
    margin-top: 20px;
}
.section {
    margin-top: 20px;
}
.fees-table {
    width: 60%;
    margin-top: 10px;
}
.fees-table td {
    padding: 4px 0;
}
.signature {
    margin-top: 40px;
}
</style>
</head>

<body>

<div class="header">
<strong>PRECIOUS CORNERSTONE UNIVERSITY</strong><br>
Garden of Victory, Olaogun Street, Old Ife Road,<br>
P.M.B. 60, Agodi Post Office, Ibadan, Oyo State.<br>
A Tertiary Institution of The Sword of The Spirit Ministries<br><br>

<strong>OFFICE OF THE REGISTRAR</strong><br><br>

Ref: {{ref_no}}<br>
Date: {{admission_date}}
</div>

<div class="section">
Dear {{applicant_name}},
</div>

<div class="title">
OFFER OF PROVISIONAL ADMISSION INTO PART-TIME DEGREE PROGRAMME OF THE PRECIOUS CORNERSTONE UNIVERSITY FOR {{session}} SESSION
</div>

<div class="section">
I write to inform you that you have been offered a provisional admission into {{level}} undergraduate programme in {{program}} in the Department of {{department}}, Faculty of {{faculty}} at the Precious Cornerstone University (PCU), Ibadan for {{session}} academic session on part-time.
</div>

<div class="section">
Please note that this offer is on the condition that you possess the minimum requirement of admission into the programme and if it is discovered at any time that you do not possess the qualification which you claim to have obtained, you will be required to withdraw from the University.
</div>

<div class="section">
At the time of registration, you will be required to present the original and four (4) photocopies of each of the following:
<ol>
<li>Five (5) passport photographs</li>
<li>O’Level Result (WAEC/NECO SSCE)</li>
<li>OND/NCE Certificates and Academic Transcript (if applicable)</li>
<li>JAMB Registration Slip for Part-Time</li>
<li>Birth Certificate or sworn declaration of age</li>
<li>Letter of Attestation from three reputable personalities</li>
<li>Medical examination report from a Government Hospital</li>
</ol>
</div>

<div class="section">
Possession of one webcam-enabled laptop for academic activities is mandatory.
</div>

<div class="section">
The scheduled School fee is detailed below:
<table class="fees-table">
<tr>
<td>Tuition:</td>
<td>{{tuition_fee}}</td>
</tr>
<tr>
<td>Others:</td>
<td>{{other_fees}}</td>
</tr>
</table>
</div>

<div class="section">
Please ensure the payment of the Acceptance Fee of {{acceptance_fee}} within two (2) weeks upon receipt of this admission letter.
</div>

<div class="section">
All payments should be made through the authorized University portal.
</div>

<div class="section">
The date of resumption for the {{session}} academic session is slated for {{resumption_date}}.
</div>

<div class="section">
Accept my congratulations on your admission.
</div>

<div class="signature">
<strong>Mrs. Morenike F. Afolabi</strong><br>
Registrar
</div>

</body>
</html>');

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