from flask import Blueprint, request, jsonify, Response
from database import Database
from utils.auth import AuthHandler
from utils.document_handler import DocumentHandler
from utils.pdf_generator import PDFGenerator
from config import Config
from datetime import datetime
import os

applicant_bp = Blueprint('applicant', __name__)

@applicant_bp.route('/programs', methods=['GET'])
def get_programs():
    """Get list of available programs"""
    programs = Database.execute_query('SELECT id, name, description FROM programs')
    return jsonify({
        'programs': programs
    }), 200

@applicant_bp.route('/select-program', methods=['POST'])
@AuthHandler.token_required
def select_program(payload):
    """Select a program for application"""
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
            'INSERT INTO applicants (user_id, program_id) VALUES (%s, %s)',
            (user_id, program_id)
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
            )
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
    
    # Store document metadata in database
    file_path = os.path.join(upload_folder, stored_filename)
    mime_type = DocumentHandler.get_mime_type(file.filename)
    
    doc_id = Database.execute_update(
        '''INSERT INTO documents 
           (application_form_id, document_type, original_filename, stored_filename, file_path, 
            file_size, compressed_size, mime_type, is_compressed)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)''',
        (form_id, document_type, file.filename, stored_filename, file_path,
         original_size, compressed_size, mime_type, is_compressed)
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
        '''SELECT id, document_type, original_filename, file_size, compressed_size, is_compressed
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
        '''SELECT faculty, department, level, mode, session, resumption_date
           FROM programs WHERE id = %s''',
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
        '''SELECT faculty, department, level, mode, session, resumption_date
           FROM programs WHERE id = %s''',
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
        applicant_name=applicant_data['name'],
        program=applicant_data['program_name'] or '',
        level=level,
        department=department,
        faculty=faculty,
        session=session,
        mode=mode,
        admission_date=datetime.now().strftime('%d %B, %Y'),
        acceptance_fee=acceptance_fee_str,
        tuition_fee=tuition_fee_str,
        other_fees=other_fees_str,
        resumption_date=resumption_date,
        reference=ref_no,
        body_html=''
    )

    # Return PDF as downloadable file
    return Response(
        pdf_bytes,
        mimetype='application/pdf',
        headers={'Content-Disposition': f'attachment;filename=admission_letter_{applicant_data["id"]}.pdf'}
    )