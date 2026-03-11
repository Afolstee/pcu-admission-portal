from flask import Blueprint, request, jsonify, Response
from database import Database
from utils.auth import AuthHandler
from utils.document_handler import DocumentHandler
from utils.pdf_generator import PDFGenerator
from utils.payment_receipt_generator import PaymentReceiptGenerator
from utils.medical_form_generator import MedicalFormGenerator
from config import Config
from datetime import datetime
import os
import uuid

applicant_bp = Blueprint('applicant', __name__)

@applicant_bp.route('/programs', methods=['GET'])
def get_programs():
    """Get list of available programs grouped by faculty and department"""
    programs = Database.execute_query(
        '''SELECT p.id, p.name, p.description, p.level, p.session, p.is_locked,
                  d.name as department, f.name as faculty, pt.name as mode
           FROM programs p
           JOIN departments d ON p.department_id = d.id
           JOIN faculties f ON d.faculty_id = f.id
           JOIN program_types pt ON p.program_type_id = pt.id
           ORDER BY f.name, d.name, p.name'''
    )
    
    global_lock = False
    pt_status = {
        'undergraduate': True,
        'postgraduate': False,
        'part-time': False,
        'jupeb': False
    }
    
    try:
        settings_res = Database.execute_query("SELECT key, value FROM system_settings WHERE key IN ('admission_registration_locked', 'pt_undergraduate_enabled', 'pt_postgraduate_enabled', 'pt_part_time_enabled', 'pt_jupeb_enabled')")
        for s in (settings_res or []):
            if s['key'] == 'admission_registration_locked' and s['value'] == 'true':
                global_lock = True
            elif s['key'] == 'pt_undergraduate_enabled':
                pt_status['undergraduate'] = (s['value'] == 'true')
            elif s['key'] == 'pt_postgraduate_enabled':
                pt_status['postgraduate'] = (s['value'] == 'true')
            elif s['key'] == 'pt_part_time_enabled':
                pt_status['part-time'] = (s['value'] == 'true')
            elif s['key'] == 'pt_jupeb_enabled':
                pt_status['jupeb'] = (s['value'] == 'true')
    except:
        pass
        
    return jsonify({
        'programs': programs or [],
        'global_admission_locked': global_lock,
        'program_types_status': pt_status
    }), 200

@applicant_bp.route('/select-program', methods=['POST'])
@AuthHandler.token_required
def select_program(payload):
    """Select a program for application"""
    # Check if admission registration is locked
    res = Database.execute_query("SELECT value FROM system_settings WHERE key = 'admission_registration_locked'")
    if res and res[0]['value'] == 'true':
        return jsonify({'message': 'Admission registration is currently closed.'}), 403

    user_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'program_id' not in data:
        return jsonify({'message': 'program_id is required'}), 400
    
    program_id = data['program_id']
    
    # Verify program exists
    programs = Database.execute_query(
        'SELECT id FROM programs WHERE id = %s',
        (program_id,)
    )
    if not programs:
        return jsonify({'message': 'Invalid program'}), 400
    
    # Get applicant; if not present, create one for this user
    applicants = Database.execute_query(
        'SELECT id FROM applicants WHERE user_id = %s',
        (user_id,)
    )
    
    if not applicants:
        # Create applicant record tied to this user with the selected program
        applicant_id = Database.execute_update(
            'INSERT INTO applicants (user_id, program_id) VALUES (%s, %s) RETURNING id',
            (user_id, program_id),
            return_id=True
        )
        if not applicant_id:
            return jsonify({'message': 'Failed to create applicant record'}), 500
    else:
        applicant_id = applicants[0]['id']
        # Update program on existing applicant record
        success = Database.execute_update(
            'UPDATE applicants SET program_id = %s WHERE id = %s',
            (program_id, applicant_id)
        )
        if not success:
            return jsonify({'message': 'Failed to select program'}), 500
    
    return jsonify({
        'message': 'Program selected successfully',
        'applicant_id': applicant_id,
        'program_id': program_id
    }), 200

@applicant_bp.route('/form/<int:program_id>', methods=['GET'])
@AuthHandler.token_required
def get_form_template(payload, program_id):
    """Get application form template for a program"""
    
    # Mock form template based on program
    form_templates = {
        1: {
            'program': 'Undergraduate',
            'fields': [
                {'name': 'full_name', 'type': 'text', 'label': 'Full Name', 'required': True},
                {'name': 'date_of_birth', 'type': 'date', 'label': 'Date of Birth', 'required': True},
                {'name': 'nationality', 'type': 'text', 'label': 'Nationality', 'required': True},
                {'name': 'address', 'type': 'textarea', 'label': 'Address', 'required': True},
                {'name': 'qualification_type', 'type': 'select', 'label': 'Qualification Type', 'options': ['WAEC', 'NECO', 'GCE', 'Other'], 'required': True},
                {'name': 'qualification_institution', 'type': 'text', 'label': 'Issuing Institution', 'required': True},
                {'name': 'qualification_year', 'type': 'number', 'label': 'Year of Qualification', 'required': True},
                {'name': 'additional_info', 'type': 'textarea', 'label': 'Additional Information', 'required': False}
            ],
            'documents': [
                {'type': 'transcript', 'label': 'Academic Transcript', 'required': True},
                {'type': 'certificate', 'label': 'Qualification Certificate', 'required': True},
                {'type': 'identification', 'label': 'Identification (Passport/Driver License)', 'required': True}
            ]
        },
        2: {
            'program': 'Postgraduate',
            'fields': [
                {'name': 'full_name', 'type': 'text', 'label': 'Full Name', 'required': True},
                {'name': 'date_of_birth', 'type': 'date', 'label': 'Date of Birth', 'required': True},
                {'name': 'nationality', 'type': 'text', 'label': 'Nationality', 'required': True},
                {'name': 'address', 'type': 'textarea', 'label': 'Address', 'required': True},
                {'name': 'qualification_type', 'type': 'select', 'label': 'First Degree Type', 'options': ['BSc', 'BA', 'BEng', 'Other'], 'required': True},
                {'name': 'qualification_institution', 'type': 'text', 'label': 'University Name', 'required': True},
                {'name': 'qualification_year', 'type': 'number', 'label': 'Year of Graduation', 'required': True},
                {'name': 'work_experience', 'type': 'textarea', 'label': 'Work Experience', 'required': False},
                {'name': 'additional_info', 'type': 'textarea', 'label': 'Research Interests', 'required': False}
            ],
            'documents': [
                {'type': 'transcript', 'label': 'University Transcript', 'required': True},
                {'type': 'certificate', 'label': 'Degree Certificate', 'required': True},
                {'type': 'identification', 'label': 'Identification (Passport/Driver License)', 'required': True},
                {'type': 'recommendation', 'label': 'Recommendation Letters (2)', 'required': True}
            ]
        }
    }
    
    # Default template for other programs
    default_template = form_templates[1]
    template = form_templates.get(program_id, default_template)
    
    return jsonify(template), 200

@applicant_bp.route('/submit-form', methods=['POST'])
@AuthHandler.token_required
def submit_form(payload):
    user_id = payload['user_id']
    data = request.form.to_dict()

    # Get applicant + selected program
    applicant = Database.execute_query(
        'SELECT id, program_id FROM applicants WHERE user_id = %s',
        (user_id,)
    )

    if not applicant:
        return jsonify({'message': 'Applicant record not found'}), 404

    if not applicant[0]['program_id']:
        return jsonify({'message': 'Program not selected'}), 400

    applicant_id = applicant[0]['id']
    program_id = applicant[0]['program_id']

    # Check if form already exists
    existing_form = Database.execute_query(
        'SELECT id FROM application_forms WHERE applicant_id = %s',
        (applicant_id,)
    )

    if existing_form:
        form_id = existing_form[0]['id']
        Database.execute_update(
            '''
            UPDATE application_forms
            SET program_id = %s,
                full_name = %s,
                date_of_birth = %s,
                nationality = %s,
                address = %s,
                qualification_type = %s,
                qualification_institution = %s,
                qualification_year = %s,
                work_experience = %s,
                additional_info = %s
            WHERE id = %s
            ''',
            (
                program_id,
                data.get('full_name'),
                data.get('date_of_birth'),
                data.get('nationality'),
                data.get('address'),
                data.get('qualification_type'),
                data.get('qualification_institution'),
                data.get('qualification_year'),
                data.get('work_experience'),
                data.get('additional_info'),
                form_id
            )
        )
    else:
        form_id = Database.execute_update(
            '''
            INSERT INTO application_forms
            (applicant_id, program_id, full_name, date_of_birth, nationality, address,
             qualification_type, qualification_institution, qualification_year,
             work_experience, additional_info)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
            ''',
            (
                applicant_id,
                program_id,
                data.get('full_name'),
                data.get('date_of_birth'),
                data.get('nationality'),
                data.get('address'),
                data.get('qualification_type'),
                data.get('qualification_institution'),
                data.get('qualification_year'),
                data.get('work_experience'),
                data.get('additional_info')
            ),
            return_id=True
        )

    if not form_id:
        return jsonify({'message': 'Failed to save application form'}), 500

    return jsonify({
        'message': 'Form saved successfully',
        'form_id': form_id,
        'applicant_id': applicant_id
    }), 200

@applicant_bp.route('/upload-document', methods=['POST'])
@AuthHandler.token_required
def upload_document(payload):
    """Upload application document"""
    user_id = payload['user_id']
    
    if 'file' not in request.files or 'form_id' not in request.form or 'document_type' not in request.form:
        return jsonify({'message': 'Missing file, form_id, or document_type'}), 400
    
    file = request.files['file']
    form_id = request.form.get('form_id')
    document_type = request.form.get('document_type')
    
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if not DocumentHandler.allowed_file(file.filename):
        return jsonify({'message': 'File type not allowed'}), 400
    
    # Check file size
    file_size = DocumentHandler.get_file_size(file)
    if file_size > Config.MAX_CONTENT_LENGTH:
        return jsonify({'message': f'File size exceeds {Config.MAX_CONTENT_LENGTH / (1024*1024):.0f}MB limit'}), 400
    
    # Create upload folder for this applicant
    upload_folder = os.path.join(Config.UPLOAD_FOLDER, f'applicant_{user_id}')
    
    # Save document with compression
    stored_filename, original_size, compressed_size, is_compressed = DocumentHandler.save_document(file, upload_folder)
    
    if not stored_filename:
        return jsonify({'message': 'Failed to save document'}), 500
    
    if not form_id:
        return jsonify({'message': 'form_id is required'}), 400
        
    try:
        form_id_int = int(form_id)                 
        is_compressed_bool = bool(is_compressed)  
        original_size_int = int(original_size)    
        compressed_size_int = int(compressed_size)
    except (TypeError, ValueError) as e:
        print(f"Metadata conversion error: {e}, form_id={form_id}")
        return jsonify({'message': f'Invalid file metadata: {str(e)}'}), 400
    
    # Store document metadata in database
    file_path = os.path.join(upload_folder, stored_filename)
    mime_type = DocumentHandler.get_mime_type(file.filename)
    
    doc_id = Database.execute_update(
    '''INSERT INTO documents 
       (application_form_id, document_type, original_filename, stored_filename, file_path, 
        file_size, compressed_size, mime_type, is_compressed)
       VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id''',
    (form_id_int, document_type, file.filename, stored_filename, file_path,
     original_size_int, compressed_size_int, mime_type, is_compressed_bool),
    return_id=True
)
    
    if not doc_id:
        DocumentHandler.delete_document(file_path)
        return jsonify({'message': 'Failed to save document metadata'}), 500
    
    compression_ratio = (1 - compressed_size / original_size) * 100 if original_size > 0 else 0
    
    return jsonify({
        'message': 'Document uploaded successfully',
        'document_id': doc_id,
        'original_size': original_size,
        'compressed_size': compressed_size,
        'is_compressed': is_compressed,
        'compression_ratio': f'{compression_ratio:.1f}%'
    }), 201

@applicant_bp.route('/get-form/<int:applicant_id>', methods=['GET'])
@AuthHandler.token_required
def get_form(payload, applicant_id):
    """Get saved application form"""
    user_id = payload['user_id']
    
    # Verify ownership
    applicants = Database.execute_query(
        'SELECT id FROM applicants WHERE id = %s AND user_id = %s',
        (applicant_id, user_id)
    )
    
    if not applicants:
        return jsonify({'message': 'Applicant not found'}), 404
    
    form = Database.execute_query(
        'SELECT * FROM application_forms WHERE applicant_id = %s',
        (applicant_id,)
    )
    
    documents = Database.execute_query(
    '''SELECT 
           d.id AS document_id,
           d.document_type,
           d.original_filename,
           d.file_size,
           d.compressed_size,
           d.is_compressed
       FROM documents d
       JOIN application_forms af ON d.application_form_id = af.id
       WHERE af.applicant_id = %s''',
    (applicant_id,)
)
    
    return jsonify({
        'form': form[0] if form else None,
        'documents': documents or []
    }), 200

@applicant_bp.route('/submit-application', methods=['POST'])
@AuthHandler.token_required
def submit_application(payload):
    """Submit completed application for review"""
    # Check if admission registration is locked
    res = Database.execute_query("SELECT value FROM system_settings WHERE key = 'admission_registration_locked'")
    if res and res[0]['value'] == 'true':
        return jsonify({'message': 'Admission registration is currently closed.'}), 403

    user_id = payload['user_id']
    data = request.get_json()
    applicant_id = data.get('applicant_id')
    
    if not applicant_id:
        return jsonify({'message': 'applicant_id is required'}), 400
    
    # Verify ownership
    applicants = Database.execute_query(
        'SELECT id FROM applicants WHERE id = %s AND user_id = %s',
        (applicant_id, user_id)
    )
    
    if not applicants:
        return jsonify({'message': 'Applicant not found'}), 404
    
    # Update status to submitted
    success = Database.execute_update(
        'UPDATE applicants SET application_status = %s, submitted_at = NOW() WHERE id = %s',
        ('submitted', applicant_id)
    )
    
    if not success:
        return jsonify({'message': 'Failed to submit application'}), 500
    
    return jsonify({
        'message': 'Application submitted successfully'
    }), 200

@applicant_bp.route('/get-applicant-status', methods=['GET'])
@AuthHandler.token_required
def get_applicant_status(payload):
    """Get applicant's current status"""
    user_id = payload['user_id']
    
    applicant = Database.execute_query(
        '''SELECT a.id, a.program_id, a.application_status, a.admission_status, 
                  a.has_paid_acceptance_fee, a.has_paid_tuition, a.submitted_at,
                  p.name as program_name
           FROM applicants a
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.user_id = %s''',
        (user_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant record not found'}), 404
    
    return jsonify({
        'applicant': applicant[0]
    }), 200

@applicant_bp.route('/admission-letter', methods=['GET'])
@AuthHandler.token_required
def get_admission_letter(payload):
    """Get admission letter data for the authenticated applicant"""
    user_id = payload['user_id']

    # Get applicant details
    applicant = Database.execute_query(
        '''SELECT a.id, a.program_id, a.admission_status, u.name, p.name as program_name
           FROM applicants a
           JOIN users u ON a.user_id = u.id
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.user_id = %s AND a.admission_status = %s''',
        (user_id, 'admitted')
    )

    if not applicant:
        return jsonify({'message': 'Admission letter not available'}), 404

    applicant_data = applicant[0]

    # Look up program fees
    fees = Database.execute_query(
        'SELECT acceptance_fee, tuition_fee, other_fees FROM program_fees WHERE program_id = %s',
        (applicant_data['program_id'],)
    )

    acceptance_fee = 0
    tuition_fee = 0
    other_fees = 0
    if fees:
        acceptance_fee = fees[0]['acceptance_fee'] or 0
        tuition_fee = fees[0]['tuition_fee'] or 0
        other_fees = fees[0]['other_fees'] or 0

    # Get program details for letter
    program_details = Database.execute_query(
        '''SELECT f.name as faculty, d.name as department, p.level, pt.name as mode, p.session, p.resumption_date
           FROM programs p 
           LEFT JOIN departments d ON p.department_id = d.id
           LEFT JOIN faculties f ON d.faculty_id = f.id
           LEFT JOIN program_types pt ON p.program_type_id = pt.id
           WHERE p.id = %s''',
        (applicant_data['program_id'],)
    )

    faculty = 'N/A'
    department = 'N/A'
    level = '100 Level'
    mode = 'Full-Time'
    session = '2025/2026'
    resumption_date = ''

    if program_details:
        pd = program_details[0]
        faculty = pd['faculty'] or 'N/A'
        department = pd['department'] or 'N/A'
        level = pd['level'] or '100 Level'
        mode = pd['mode'] or 'Full-Time'
        session = pd['session'] or '2025/2026'
        resumption_date = pd['resumption_date'] or ''

    # Generate reference number
    ref_no = f"PCU/ADM/{datetime.now().strftime('%Y')}/{applicant_data['id']:04d}"

    return jsonify({
        'candidateName': applicant_data['name'],
        'programme': applicant_data['program_name'] or '',
        'level': level,
        'department': department,
        'faculty': faculty,
        'session': session,
        'mode': mode,
        'date': datetime.now().strftime('%d %B, %Y'),
        'resumptionDate': resumption_date,
        'acceptanceFee': f"₦{acceptance_fee:,.2f}",
        'tuition': f"₦{tuition_fee:,.2f}",
        'otherFees': f"₦{other_fees:,.2f}",
        'reference': ref_no
    }), 200
@applicant_bp.route('/print-admission-letter', methods=['POST'])
@AuthHandler.token_required
def print_admission_letter(payload):
    """Generate and download admission letter as PDF"""
    user_id = payload['user_id']

    # Get applicant details
    applicant = Database.execute_query(
        '''SELECT a.id, a.program_id, a.admission_status, u.name, p.name as program_name
           FROM applicants a
           JOIN users u ON a.user_id = u.id
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.user_id = %s AND a.admission_status = %s''',
        (user_id, 'admitted')
    )

    if not applicant:
        return jsonify({'message': 'Admission letter not available'}), 404

    applicant_data = applicant[0]

    # Look up program fees
    fees = Database.execute_query(
        'SELECT acceptance_fee, tuition_fee, other_fees FROM program_fees WHERE program_id = %s',
        (applicant_data['program_id'],)
    )

    acceptance_fee_str = ''
    tuition_fee_str = ''
    other_fees_str = ''
    if fees:
        acceptance_fee = fees[0]['acceptance_fee'] or 0
        tuition_fee = fees[0]['tuition_fee'] or 0
        other_fees = fees[0]['other_fees'] or 0
        acceptance_fee_str = f"₦{acceptance_fee:,.2f}"
        tuition_fee_str = f"₦{tuition_fee:,.2f}"
        other_fees_str = f"₦{other_fees:,.2f}"

    # Get program details for letter
    program_details = Database.execute_query(
        '''SELECT f.name as faculty, d.name as department, p.level, pt.name as mode, p.session, p.resumption_date
           FROM programs p 
           LEFT JOIN departments d ON p.department_id = d.id
           LEFT JOIN faculties f ON d.faculty_id = f.id
           LEFT JOIN program_types pt ON p.program_type_id = pt.id
           WHERE p.id = %s''',
        (applicant_data['program_id'],)
    )

    faculty = 'N/A'
    department = 'N/A'
    level = '100 Level'
    mode = 'Full-Time'
    session = '2025/2026'
    resumption_date = ''

    if program_details:
        pd = program_details[0]
        faculty = pd['faculty'] or 'N/A'
        department = pd['department'] or 'N/A'
        level = pd['level'] or '100 Level'
        mode = pd['mode'] or 'Full-Time'
        session = pd['session'] or '2025/2026'
        resumption_date = pd['resumption_date'] or ''

    # Generate reference number
    ref_no = f"PCU/ADM/{datetime.now().strftime('%Y')}/{applicant_data['id']:04d}"

    # Generate PDF
    pdf_bytes = PDFGenerator.generate_admission_letter_pdf(
        candidateName=applicant_data['name'],
        programme=applicant_data['program_name'] or '',
        level=level,
        department=department,
        faculty=faculty,
        session=session,
        mode=mode,
        date=datetime.now().strftime('%d %B, %Y'),
        acceptanceFee=acceptance_fee_str,
        tuition=tuition_fee_str,
        otherFees=other_fees_str,
        resumptionDate=resumption_date,
        reference=ref_no,
        body_html=''
    )

    # Return PDF as downloadable file
    return Response(
        pdf_bytes,
        mimetype='application/pdf',
        headers={'Content-Disposition': f'attachment;filename=admission_letter_{applicant_data["id"]}.pdf'}
    )

@applicant_bp.route('/process-payment', methods=['POST'])
@AuthHandler.token_required
def process_payment(payload):
    """Process and save payment transaction"""
    user_id = payload['user_id']
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['payment_type', 'amount']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields: payment_type, amount'}), 400
    
    payment_type = data.get('payment_type')  # acceptance_fee or tuition
    amount = float(data.get('amount', 0))
    payment_method = data.get('payment_method', 'online')
    reference_id = data.get('reference_id', '')
    
    # Validate payment type
    if payment_type not in ['acceptance_fee', 'tuition']:
        return jsonify({'message': 'Invalid payment_type. Must be acceptance_fee or tuition'}), 400
    
    if amount <= 0:
        return jsonify({'message': 'Amount must be greater than 0'}), 400
    
    # Get applicant
    applicant = Database.execute_query(
        'SELECT id, program_id FROM applicants WHERE user_id = %s',
        (user_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant record not found'}), 404
    
    applicant_id = applicant[0]['id']
    
    # Verify amount matches program fee
    program_id = applicant[0]['program_id']
    if not program_id:
        return jsonify({'message': 'Program not selected'}), 400
    
    fees = Database.execute_query(
        'SELECT acceptance_fee, tuition_fee FROM program_fees WHERE program_id = %s',
        (program_id,)
    )

    if fees:
        fee_map = {
            'acceptance_fee': float(fees[0]['acceptance_fee'] or 0),
            'tuition': float(fees[0]['tuition_fee'] or 0)
        }
        expected_amount = fee_map.get(payment_type, 0)
        # Log discrepancy but do NOT block — amount shown on frontend already came from DB
        if expected_amount and round(amount, 2) != round(expected_amount, 2):
            print(f"[WARN] Payment amount discrepancy: sent={amount}, expected={expected_amount} for {payment_type}")
        # Use the authoritative DB amount for the transaction record
        amount = expected_amount if expected_amount else amount
    
    # Create payment transaction record
    try:
        success = Database.execute_update(
            '''INSERT INTO payment_transactions 
               (applicant_id, payment_type, amount, status, payment_method, reference_id, completed_at)
               VALUES (%s, %s, %s, %s, %s, %s, NOW())''',
            (applicant_id, payment_type, amount, 'completed', payment_method, reference_id)
        )
        
        if not success:
            return jsonify({'message': 'Failed to save payment transaction'}), 500
        
        # Update applicant payment status flags
        if payment_type == 'acceptance_fee':
            Database.execute_update(
                'UPDATE applicants SET has_paid_acceptance_fee = TRUE WHERE id = %s',
                (applicant_id,)
            )
        elif payment_type == 'tuition':
            Database.execute_update(
                'UPDATE applicants SET has_paid_tuition = TRUE WHERE id = %s',
                (applicant_id,)
            )
            
        # Check if both are paid, if so upgrade to student
        applicant_status = Database.execute_query(
            '''SELECT a.user_id, a.has_paid_acceptance_fee, a.has_paid_tuition, a.program_id,
                      u.email, u.name, u.role
               FROM applicants a JOIN users u ON a.user_id = u.id
               WHERE a.id = %s''',
            (applicant_id,)
        )
        
        upgraded = False
        initial_password = ""
        if applicant_status and applicant_status[0]['role'] == 'applicant':
            app_data = applicant_status[0]
            if app_data.get('has_paid_acceptance_fee') and app_data.get('has_paid_tuition'):
                # Upgrade to student
                app_user_id = app_data['user_id']
                # Derive surname from the full name (last word) — used as initial password
                full_name = app_data.get('name') or 'password'
                surname = full_name.strip().split(' ')[-1]
                initial_password = surname.strip().lower()
                app_program_id = app_data['program_id']
                
                matric_number = f"PCU/{datetime.now().strftime('%Y')}/{applicant_id:04d}"
                username = app_data['email']
                password_hash = AuthHandler.hash_password(initial_password)
                
                try:
                    success_user = Database.execute_update(
                        'UPDATE users SET username = %s, password_hash = %s, role = %s WHERE id = %s',
                        (username, password_hash, 'student', app_user_id)
                    )
                    
                    success_student = Database.execute_update(
                        '''INSERT INTO students (user_id, matric_number, program_id, current_level, session, is_first_login)
                           VALUES (%s, %s, %s, %s, %s, TRUE) 
                           ON CONFLICT (user_id) DO UPDATE SET matric_number = EXCLUDED.matric_number''',
                        (app_user_id, matric_number, app_program_id, '100 Level', '2025/2026')
                    )
                    if success_user and success_student:
                        upgraded = True
                except Exception as e:
                    print(f"Error upgrading applicant to student: {e}")
        
        # Prepare receipt data
        transaction_id = reference_id or f"PAY-{uuid.uuid4().hex[:12].upper()}"
        
        return jsonify({
            'message': 'Payment processed successfully',
            'transaction_id': transaction_id,
            'applicant_id': applicant_id,
            'payment_type': payment_type,
            'amount': amount,
            'status': 'completed',
            'completed_at': datetime.now().isoformat(),
            'upgraded_to_student': upgraded,
            'initial_password': initial_password if upgraded else None
        }), 200
    
    except Exception as e:
        print(f"Payment processing error: {e}")
        return jsonify({'message': 'Error processing payment'}), 500

@applicant_bp.route('/payment-receipt/<int:transaction_id>', methods=['GET'])
@AuthHandler.token_required
def get_payment_receipt(payload, transaction_id):
    """Download payment receipt as PDF"""
    user_id = payload['user_id']
    
    # Get transaction and verify ownership
    transaction = Database.execute_query(
        '''SELECT pt.id, pt.applicant_id, pt.payment_type, pt.amount, pt.created_at, 
                  pt.reference_id, pt.payment_method
           FROM payment_transactions pt
           JOIN applicants a ON pt.applicant_id = a.id
           WHERE pt.id = %s AND a.user_id = %s''',
        (transaction_id, user_id)
    )
    
    if not transaction:
        return jsonify({'message': 'Payment receipt not found'}), 404
    
    trans_data = transaction[0]
    applicant_id = trans_data['applicant_id']
    
    # Get applicant and program info
    applicant = Database.execute_query(
        '''SELECT u.name, p.name as program_name, a.program_id
           FROM applicants a
           JOIN users u ON a.user_id = u.id
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.id = %s''',
        (applicant_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant not found'}), 404
    
    applicant_data = applicant[0]
    
    # Generate PDF receipt
    receipt_id = f"RCP-{trans_data['id']:06d}"
    payment_date = trans_data['created_at'].strftime('%d %B %Y') if trans_data['created_at'] else datetime.now().strftime('%d %B %Y')
    
    pdf_bytes = PaymentReceiptGenerator.generate_payment_receipt_pdf(
        receipt_id=receipt_id,
        applicant_name=applicant_data['name'],
        program_name=applicant_data['program_name'] or 'N/A',
        payment_type=trans_data['payment_type'],
        amount=float(trans_data['amount']),
        payment_date=payment_date,
        reference_number=trans_data['reference_id'] or '',
        payment_method=trans_data['payment_method'] or 'Online',
        currency='NGN'
    )
    
    return Response(
        pdf_bytes,
        mimetype='application/pdf',
        headers={'Content-Disposition': f'attachment;filename=payment_receipt_{receipt_id}.pdf'}
    )

@applicant_bp.route('/medical-form', methods=['GET'])
@AuthHandler.token_required
def get_medical_form(payload):
    """Download medical examination form as PDF"""
    user_id = payload['user_id']
    
    # Get applicant and verify document download eligibility (paid both fees?)
    # Usually students can download this once they are admitted, but user said "after tuition and acceptance has been paid"
    applicant = Database.execute_query(
        '''SELECT a.id, a.program_id, u.name, p.name as program_name, a.has_paid_acceptance_fee, a.has_paid_tuition
           FROM applicants a
           JOIN users u ON a.user_id = u.id
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.user_id = %s''',
        (user_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant record not found'}), 404
        
    app_data = applicant[0]
    
    if not app_data['has_paid_acceptance_fee'] or not app_data['has_paid_tuition']:
        return jsonify({'message': 'Please complete acceptance and tuition payments to download this form'}), 403
    
    # Try to serve the official PDF file from data folder
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    medical_form_path = os.path.join(base_dir, 'data', "PCU STUDENTS' MEDICAL REPORT FORM_ (1) - Copy.pdf")
    
    if os.path.exists(medical_form_path):
        with open(medical_form_path, 'rb') as f:
            pdf_bytes = f.read()
        filename = "pcu_medical_report_form.pdf"
    else:
        # Fallback to generated one if file is missing
        pdf_bytes = MedicalFormGenerator.generate_medical_form_pdf(
            applicant_name=app_data['name'],
            program_name=app_data['program_name'] or 'N/A',
            applicant_id=app_data['id']
        )
        filename = f"medical_form_{app_data['id']}.pdf"
    
    return Response(
        pdf_bytes,
        mimetype='application/pdf',
        headers={'Content-Disposition': f'attachment;filename={filename}'}
    )

@applicant_bp.route('/admission-notice', methods=['GET'])
@AuthHandler.token_required
def get_admission_notice(payload):
    """Download official admission notice as PDF"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, 'data', "PCU NOTICE TO CANDIDATES OFFERED PROVISIONAL ADMISSION 2025.pdf")
    
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            pdf_bytes = f.read()
        return Response(
            pdf_bytes,
            mimetype='application/pdf',
            headers={'Content-Disposition': 'attachment;filename=pcu_admission_notice_2025.pdf'}
        )
    return jsonify({'message': 'Notice file not found'}), 404

@applicant_bp.route('/affidavit-form', methods=['GET'])
@AuthHandler.token_required
def get_affidavit_form(payload):
    """Download official affidavit form as PDF"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    file_path = os.path.join(base_dir, 'data', "PCU AFFIDAVIT FOR GOOD CONDUCT - Copy.pdf")
    
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            pdf_bytes = f.read()
        return Response(
            pdf_bytes,
            mimetype='application/pdf',
            headers={'Content-Disposition': 'attachment;filename=pcu_affidavit_for_good_conduct.pdf'}
        )
    return jsonify({'message': 'Affidavit file not found'}), 404

@applicant_bp.route('/payment-history', methods=['GET'])
@AuthHandler.token_required
def get_payment_history(payload):
    """Get payment history for the applicant"""
    user_id = payload['user_id']
    
    # Get applicant
    applicant = Database.execute_query(
        'SELECT id FROM applicants WHERE user_id = %s',
        (user_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant record not found'}), 404
    
    applicant_id = applicant[0]['id']
    
    # Get payment history
    transactions = Database.execute_query(
        '''SELECT id, payment_type, amount, status, payment_method, reference_id, 
                  created_at, completed_at
           FROM payment_transactions
           WHERE applicant_id = %s
           ORDER BY created_at DESC''',
        (applicant_id,)
    )
    
    # Format transactions
    formatted_transactions = []
    for trans in (transactions or []):
        formatted_transactions.append({
            'transaction_id': trans['id'],
            'payment_type': trans['payment_type'],
            'amount': float(trans['amount']),
            'status': trans['status'],
            'payment_method': trans['payment_method'],
            'reference_id': trans['reference_id'],
            'created_at': trans['created_at'].isoformat() if trans['created_at'] else None,
            'completed_at': trans['completed_at'].isoformat() if trans['completed_at'] else None
        })
    
    return jsonify({
        'payment_history': formatted_transactions,
        'total_payments': len(formatted_transactions)
    }), 200

@applicant_bp.route('/get-recommendations', methods=['GET'])
@AuthHandler.token_required
def get_recommendations(payload):
    """Get recommended courses for the applicant"""
    user_id = payload['user_id']
    
    # Get applicant
    applicant = Database.execute_query(
        'SELECT id FROM applicants WHERE user_id = %s',
        (user_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant record not found'}), 404
    
    applicant_id = applicant[0]['id']
    
    # Get all reviews with recommendations for this applicant
    recommendations = Database.execute_query(
        '''SELECT ar.id, ar.review_notes, ar.recommended_program_id, p.name as program_name,
                  ar.reviewed_at, ar.reviewed_by, u.name as reviewed_by_name,
                  a.recommended_course_response, a.accepted_recommended_program_id
           FROM application_reviews ar
           LEFT JOIN programs p ON ar.recommended_program_id = p.id
           LEFT JOIN users u ON ar.reviewed_by = u.id
           LEFT JOIN applicants a ON a.id = %s
           WHERE ar.applicant_id = %s AND ar.recommendation = %s''',
        (applicant_id, applicant_id, 'recommend_other_program')
    )
    
    # Format recommendations
    formatted_recommendations = []
    for rec in (recommendations or []):
        formatted_recommendations.append({
            'review_id': rec['id'],
            'program_id': rec['recommended_program_id'],
            'program_name': rec['program_name'],
            'review_notes': rec['review_notes'],
            'reviewed_by': rec['reviewed_by_name'],
            'reviewed_at': rec['reviewed_at'].isoformat() if rec['reviewed_at'] else None,
            'response': rec['recommended_course_response'],
            'is_accepted': rec['accepted_recommended_program_id'] == rec['recommended_program_id'] if rec['accepted_recommended_program_id'] else None
        })
    
    return jsonify({
        'recommendations': formatted_recommendations,
        'total_recommendations': len(formatted_recommendations)
    }), 200

@applicant_bp.route('/respond-to-recommendation', methods=['POST'])
@AuthHandler.token_required
def respond_to_recommendation(payload):
    """Accept or decline a recommended course"""
    user_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'review_id' not in data or 'response' not in data:
        return jsonify({'message': 'review_id and response are required'}), 400
    
    review_id = data['review_id']
    response = data['response']  # 'accepted' or 'declined'
    
    if response not in ['accepted', 'declined']:
        return jsonify({'message': 'response must be either "accepted" or "declined"'}), 400
    
    # Verify ownership and get review details
    applicant = Database.execute_query(
        'SELECT id FROM applicants WHERE user_id = %s',
        (user_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant record not found'}), 404
    
    applicant_id = applicant[0]['id']
    
    # Get the review to verify it exists and get program details
    review = Database.execute_query(
        '''SELECT ar.id, ar.applicant_id, ar.recommended_program_id
           FROM application_reviews ar
           WHERE ar.id = %s AND ar.applicant_id = %s''',
        (review_id, applicant_id)
    )
    
    if not review:
        return jsonify({'message': 'Review not found'}), 404
    
    recommended_program_id = review[0]['recommended_program_id']
    
    try:
        # Update applicant with response
        if response == 'accepted':
            success = Database.execute_update(
                '''UPDATE applicants 
                   SET recommended_course_response = %s, accepted_recommended_program_id = %s
                   WHERE id = %s''',
                (response, recommended_program_id, applicant_id)
            )
            # Update program to the recommended one if accepted
            if success:
                Database.execute_update(
                    'UPDATE applicants SET program_id = %s WHERE id = %s',
                    (recommended_program_id, applicant_id)
                )
        else:  # declined
            success = Database.execute_update(
                '''UPDATE applicants 
                   SET recommended_course_response = %s
                   WHERE id = %s''',
                (response, applicant_id)
            )
        
        if not success:
            return jsonify({'message': 'Failed to save response'}), 500
        
        return jsonify({
            'message': f'Recommendation {response} successfully',
            'applicant_id': applicant_id,
            'response': response
        }), 200
    
    except Exception as e:
        print(f"Error processing recommendation response: {e}")
        return jsonify({'message': 'Error processing response'}), 500
