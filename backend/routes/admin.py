from flask import Blueprint, request, jsonify, Response
from database import Database
from utils.auth import AuthHandler
from datetime import datetime
from email_utils import send_email
from utils.pdf_generator import PDFGenerator

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/applications', methods=['GET'])
@AuthHandler.token_required
@AuthHandler.admin_required
def get_applications(payload):
    """Get list of all applications with filtering options"""
    status = request.args.get('status', 'submitted')
    program_id = request.args.get('program_id')
    
    query = '''SELECT a.id, a.user_id, u.name, u.email, u.phone_number, 
                      a.program_id, p.name as program_name, a.application_status,
                      a.admission_status, a.submitted_at
               FROM applicants a
               JOIN users u ON a.user_id = u.id
               LEFT JOIN programs p ON a.program_id = p.id
               WHERE a.application_status = %s'''
    
    params = [status]
    
    if program_id:
        query += ' AND a.program_id = %s'
        params.append(program_id)
    
    query += ' ORDER BY a.submitted_at DESC'
    
    applications = Database.execute_query(query, tuple(params))
    
    return jsonify({
        'count': len(applications) if applications else 0,
        'applications': applications or []
    }), 200

@admin_bp.route('/application/<int:applicant_id>', methods=['GET'])
@AuthHandler.token_required
@AuthHandler.admin_required
def get_application_details(payload, applicant_id):
    """Get detailed application information"""
    
    # Get applicant details
    applicant = Database.execute_query(
        '''SELECT a.id, a.user_id, u.name, u.email, u.phone_number,
                  a.program_id, p.name as program_name, a.application_status,
                  a.admission_status, a.submitted_at
           FROM applicants a
           JOIN users u ON a.user_id = u.id
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.id = %s''',
        (applicant_id,)
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant not found'}), 404
    
    # Get application form
    form = Database.execute_query(
        'SELECT * FROM application_forms WHERE applicant_id = %s',
        (applicant_id,)
    )
    
    # Get documents
    documents = Database.execute_query(
        '''SELECT id, document_type, original_filename, file_size, compressed_size, is_compressed
           FROM documents d
           JOIN application_forms af ON d.application_form_id = af.id
           WHERE af.applicant_id = %s''',
        (applicant_id,)
    )
    
    # Get review history
    reviews = Database.execute_query(
        '''SELECT ar.id, ar.reviewed_by, u.name as reviewed_by_name, ar.review_notes,
                  ar.recommendation, ar.recommended_program_id, p.name as recommended_program,
                  ar.reviewed_at
           FROM application_reviews ar
           LEFT JOIN users u ON ar.reviewed_by = u.id
           LEFT JOIN programs p ON ar.recommended_program_id = p.id
           WHERE ar.applicant_id = %s
           ORDER BY ar.reviewed_at DESC''',
        (applicant_id,)
    )
    
    return jsonify({
        'applicant': applicant[0],
        'form': form[0] if form else None,
        'documents': documents or [],
        'reviews': reviews or []
    }), 200

@admin_bp.route('/review-application', methods=['POST'])
@AuthHandler.token_required
@AuthHandler.admin_required
def review_application(payload, admin_id=None):
    """Review and approve/reject/recommend application"""
    admin_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'applicant_id' not in data or 'recommendation' not in data:
        return jsonify({'message': 'applicant_id and recommendation are required'}), 400
    
    applicant_id = data['applicant_id']
    recommendation = data['recommendation']  # 'accept', 'reject', 'recommend_other_program'
    review_notes = data.get('review_notes', '')
    recommended_program_id = data.get('recommended_program_id')
    
    # Validate recommendation
    if recommendation not in ['accept', 'reject', 'recommend_other_program']:
        return jsonify({'message': 'Invalid recommendation'}), 400
    
    # Create review record
    review_id = Database.execute_update(
        '''INSERT INTO application_reviews 
           (applicant_id, reviewed_by, review_notes, recommendation, recommended_program_id)
           VALUES (%s, %s, %s, %s, %s)''',
        (applicant_id, admin_id, review_notes, recommendation, recommended_program_id if recommendation == 'recommend_other_program' else None)
    )
    
    if not review_id:
        return jsonify({'message': 'Failed to save review'}), 500
    
    # Update applicant status based on recommendation
    if recommendation == 'accept':
        new_status = 'accepted'
    elif recommendation == 'reject':
        new_status = 'rejected'
    else:
        new_status = 'recommended'
    
    Database.execute_update(
        'UPDATE applicants SET application_status = %s WHERE id = %s',
        (new_status, applicant_id)
    )
    
    # TODO: Send email to applicant based on recommendation
    
    return jsonify({
        'message': 'Application reviewed successfully',
        'review_id': review_id,
        'new_status': new_status
    }), 201

@admin_bp.route('/send-admission-letter', methods=['POST'])
@AuthHandler.token_required
@AuthHandler.admin_required
def send_admission_letter(payload):
    """Send admission letter to single applicant"""
    admin_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'applicant_id' not in data:
        return jsonify({'message': 'applicant_id is required'}), 400
    
    applicant_id = data['applicant_id']
    admission_date = data.get('admission_date', datetime.now().strftime('%Y-%m-%d'))
    
    # Get applicant details (including program_id)
    applicant = Database.execute_query(
        '''SELECT u.id, u.name, u.email, a.program_id, p.name as program_name
           FROM applicants a
           JOIN users u ON a.user_id = u.id
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.id = %s AND a.application_status = %s''',
        (applicant_id, 'accepted')
    )
    
    if not applicant:
        return jsonify({'message': 'Applicant not found or application not accepted'}), 404
    
    applicant_data = applicant[0]
    
    # Look up program fees (if configured)
    fees = Database.execute_query(
        'SELECT acceptance_fee, tuition_fee FROM program_fees WHERE program_id = %s',
        (applicant_data['program_id'],)
    )
    acceptance_fee_str = ''
    tuition_fee_str = ''
    if fees:
        acceptance_fee = fees[0]['acceptance_fee']
        tuition_fee = fees[0]['tuition_fee']
        acceptance_fee_str = f"{acceptance_fee:,.2f}"
        tuition_fee_str = f"{tuition_fee:,.2f}"
    
    # Get letter template - first try program-specific, then default
    template = Database.execute_query(
        'SELECT * FROM letter_templates WHERE program_id = %s LIMIT 1',
        (applicant_data['program_id'],)
    )
    
    if not template:
        # Fallback to default template
        template = Database.execute_query(
            'SELECT * FROM letter_templates WHERE program_id IS NULL LIMIT 1'
        )
    
    if not template:
        return jsonify({'message': 'Letter template not found'}), 404
    
    template_data = template[0]
    
    # Generate PDF
    pdf_bytes = PDFGenerator.generate_admission_letter_pdf(
        header_text=template_data['header_text'] or '',
        body_html=template_data['body_html'] or '',
        footer_text=template_data['footer_text'] or '',
        applicant_name=applicant_data['name'],
        program=applicant_data['program_name'] or '',
        admission_date=admission_date,
        acceptance_fee=acceptance_fee_str,
        tuition_fee=tuition_fee_str
    )
    
    # Save letter record
    letter_id = Database.execute_update(
        '''INSERT INTO admission_letters
           (applicant_id, letter_template_id, recipient_email, recipient_name, program, 
            admission_date, letter_content, status)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''',
        (applicant_id, template_data['id'], applicant_data['email'], applicant_data['name'],
         applicant_data['program_name'] or '', admission_date, 'PDF generated', 'generated')
    )
    
    if not letter_id:
        return jsonify({'message': 'Failed to generate letter'}), 500
    
    # Update admission status
    Database.execute_update(
        'UPDATE applicants SET admission_status = %s WHERE id = %s',
        ('admitted', applicant_id)
    )
    
    # Send email with PDF attachment
    subject = template_data.get('subject') or 'Admission Letter'
    body_text = f"Dear {applicant_data['name']},\n\nPlease find attached your admission letter.\n\nBest regards,\nAdmissions Office"
    
    attachments = [('admission_letter.pdf', pdf_bytes)]
    
    email_sent = send_email(
        to_email=applicant_data['email'],
        subject=subject,
        body_text=body_text,
        attachments=attachments
    )
    
    if email_sent:
        # Update letter status
        Database.execute_update(
            'UPDATE admission_letters SET status = %s, sent_at = NOW() WHERE id = %s',
            ('sent', letter_id)
        )
    
    return jsonify({
        'message': 'Admission letter generated and sent successfully' if email_sent else 'Admission letter generated but email failed',
        'letter_id': letter_id,
        'recipient_email': applicant_data['email'],
        'email_sent': email_sent
    }), 201


@admin_bp.route('/preview-admission-letter', methods=['POST'])
@AuthHandler.token_required
@AuthHandler.admin_required
def preview_admission_letter(payload):
    """Generate admission letter PDF and return it for preview (no DB save, no email)."""
    data = request.get_json() or {}
    if 'applicant_id' not in data:
        return jsonify({'message': 'applicant_id is required'}), 400

    applicant_id = data['applicant_id']
    admission_date = data.get('admission_date', datetime.now().strftime('%Y-%m-%d'))

    # Generate reference number
    ref_no = f"PCU/ADM/{datetime.now().strftime('%Y')}/{applicant_id:04d}"

    # Get applicant details
    applicant = Database.execute_query(
        '''SELECT u.id, u.name, u.email, a.program_id, p.name as program_name
           FROM applicants a
           JOIN users u ON a.user_id = u.id
           LEFT JOIN programs p ON a.program_id = p.id
           WHERE a.id = %s AND a.application_status = %s''',
        (applicant_id, 'accepted')
    )

    if not applicant:
        return jsonify({'message': 'Applicant not found or application not accepted'}), 404

    applicant_data = applicant[0]

    # Look up program fees (if configured)
    fees = Database.execute_query(
        'SELECT acceptance_fee, tuition_fee FROM program_fees WHERE program_id = %s',
        (applicant_data['program_id'],)
    )
    acceptance_fee_str = ''
    tuition_fee_str = ''
    if fees:
        acceptance_fee = fees[0]['acceptance_fee']
        tuition_fee = fees[0]['tuition_fee']
        acceptance_fee_str = f"₦{acceptance_fee:,.2f}"
        tuition_fee_str = f"₦{tuition_fee:,.2f}"

    # Get letter template - first try program-specific, then default
    template = Database.execute_query(
        'SELECT * FROM letter_templates WHERE program_id = %s LIMIT 1',
        (applicant_data['program_id'],)
    )

    if not template:
        template = Database.execute_query(
            'SELECT * FROM letter_templates WHERE program_id IS NULL LIMIT 1'
        )

    if not template:
        return jsonify({'message': 'Letter template not found'}), 404

    template_data = template[0]

    # Generate PDF bytes for preview
    pdf_bytes = PDFGenerator.generate_admission_letter_pdf(
        header_text=template_data.get('header_text') or '',
        body_html=template_data.get('body_html') or template_data.get('body_text') or '',
        footer_text=template_data.get('footer_text') or '',
        applicant_name=applicant_data['name'],
        program=applicant_data['program_name'] or '',
        admission_date=admission_date,
        acceptance_fee=acceptance_fee_str,
        tuition_fee=tuition_fee_str,
        ref_no=ref_no,
        session=data.get('session', '2025/2026'),
        level=data.get('level', '100 Level'),
        department=data.get('department', 'N/A'),
        faculty=data.get('faculty', 'N/A'),
        other_fees=data.get('other_fees', ''),
        resumption_date=data.get('resumption_date', '')
    )

    # Return PDF for inline preview
    return Response(pdf_bytes, mimetype='application/pdf', headers={
        'Content-Disposition': 'inline; filename=admission_preview.pdf'
    })

@admin_bp.route('/send-batch-letters', methods=['POST'])
@AuthHandler.token_required
@AuthHandler.admin_required
def send_batch_letters(payload):
    """Send admission letters to multiple applicants"""
    admin_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'applicant_ids' not in data:
        return jsonify({'message': 'applicant_ids is required'}), 400
    
    applicant_ids = data['applicant_ids']
    admission_date = data.get('admission_date', datetime.now().strftime('%Y-%m-%d'))
    
    if not isinstance(applicant_ids, list) or len(applicant_ids) == 0:
        return jsonify({'message': 'applicant_ids must be a non-empty list'}), 400
    
    letters_created = []
    errors = []
    
    for applicant_id in applicant_ids:
        try:
            # Get applicant details (including program_id)
            applicant = Database.execute_query(
                '''SELECT u.id, u.name, u.email, a.program_id, p.name as program_name
                   FROM applicants a
                   JOIN users u ON a.user_id = u.id
                   LEFT JOIN programs p ON a.program_id = p.id
                   WHERE a.id = %s AND a.application_status = %s''',
                (applicant_id, 'accepted')
            )
            
            if not applicant:
                errors.append({'applicant_id': applicant_id, 'error': 'Not found or not accepted'})
                continue
            
            applicant_data = applicant[0]
            
            # Look up program fees (if configured)
            fees = Database.execute_query(
                'SELECT acceptance_fee, tuition_fee FROM program_fees WHERE program_id = %s',
                (applicant_data['program_id'],)
            )
            acceptance_fee_str = ''
            tuition_fee_str = ''
            if fees:
                acceptance_fee = fees[0]['acceptance_fee']
                tuition_fee = fees[0]['tuition_fee']
                acceptance_fee_str = f"{acceptance_fee:,.2f}"
                tuition_fee_str = f"{tuition_fee:,.2f}"
            
            # Get letter template - first try program-specific, then default
            template = Database.execute_query(
                'SELECT * FROM letter_templates WHERE program_id = %s LIMIT 1',
                (applicant_data['program_id'],)
            )
            
            if not template:
                # Fallback to default template
                template = Database.execute_query(
                    'SELECT * FROM letter_templates WHERE program_id IS NULL LIMIT 1'
                )
            
            if not template:
                errors.append({'applicant_id': applicant_id, 'error': 'No template found'})
                continue
            
            template_data = template[0]
            
            # Generate PDF
            pdf_bytes = PDFGenerator.generate_admission_letter_pdf(
                header_text=template_data['header_text'] or '',
                body_html=template_data['body_html'] or '',
                footer_text=template_data['footer_text'] or '',
                applicant_name=applicant_data['name'],
                program=applicant_data['program_name'] or '',
                admission_date=admission_date,
                acceptance_fee=acceptance_fee_str,
                tuition_fee=tuition_fee_str
            )
            
            # Save letter record
            letter_id = Database.execute_update(
                '''INSERT INTO admission_letters
                   (applicant_id, letter_template_id, recipient_email, recipient_name, program,
                    admission_date, letter_content, status)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)''',
                (applicant_id, template_data['id'], applicant_data['email'], applicant_data['name'],
                 applicant_data['program_name'] or '', admission_date, 'PDF generated', 'generated')
            )
            
            if letter_id:
                Database.execute_update(
                    'UPDATE applicants SET admission_status = %s WHERE id = %s',
                    ('admitted', applicant_id)
                )
                letters_created.append({'applicant_id': applicant_id, 'letter_id': letter_id})
                
                # Try to send email with PDF attachment
                subject = template_data.get('subject') or 'Admission Letter'
                body_text = f"Dear {applicant_data['name']},\n\nPlease find attached your admission letter.\n\nBest regards,\nAdmissions Office"
                attachments = [('admission_letter.pdf', pdf_bytes)]
                
                email_ok = send_email(
                    to_email=applicant_data['email'],
                    subject=subject,
                    body_text=body_text,
                    attachments=attachments
                )
                if email_ok:
                    Database.execute_update(
                        'UPDATE admission_letters SET status = %s, sent_at = NOW() WHERE id = %s',
                        ('sent', letter_id)
                    )
                else:
                    errors.append({'applicant_id': applicant_id, 'error': 'Email send failed'})
            else:
                errors.append({'applicant_id': applicant_id, 'error': 'Failed to save letter'})
        
        except Exception as e:
            errors.append({'applicant_id': applicant_id, 'error': str(e)})
    
    return jsonify({
        'message': 'Batch letter generation completed',
        'total_requested': len(applicant_ids),
        'letters_created': len(letters_created),
        'errors': len(errors),
        'created': letters_created,
        'failed': errors
    }), 201

@admin_bp.route('/revoke-admission', methods=['POST'])
@AuthHandler.token_required
@AuthHandler.admin_required
def revoke_admission(payload):
    """Revoke admission for an applicant"""
    admin_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'applicant_id' not in data:
        return jsonify({'message': 'applicant_id is required'}), 400
    
    applicant_id = data['applicant_id']
    
    # Update admission status
    success = Database.execute_update(
        'UPDATE applicants SET admission_status = %s WHERE id = %s',
        ('admission_revoked', applicant_id)
    )
    
    if not success:
        return jsonify({'message': 'Failed to revoke admission'}), 500
    
    # TODO: Send email to applicant about revocation
    
    return jsonify({
        'message': 'Admission revoked successfully'
    }), 200

@admin_bp.route('/statistics', methods=['GET'])
@AuthHandler.token_required
@AuthHandler.admin_required
def get_statistics(payload):
    """Get application statistics"""
    
    stats = {}
    
    # Total applications
    total = Database.execute_query(
        'SELECT COUNT(*) as count FROM applicants WHERE application_status IN ("submitted", "under_review", "accepted", "rejected")'
    )
    stats['total_applications'] = total[0]['count'] if total else 0
    
    # By status
    by_status = Database.execute_query(
        '''SELECT application_status, COUNT(*) as count
           FROM applicants
           GROUP BY application_status'''
    )
    stats['by_status'] = by_status or []
    
    # By program
    by_program = Database.execute_query(
        '''SELECT p.name, COUNT(*) as count
           FROM applicants a
           LEFT JOIN programs p ON a.program_id = p.id
           GROUP BY a.program_id, p.name'''
    )
    stats['by_program'] = by_program or []
    
    # Admission status
    admitted = Database.execute_query(
        'SELECT COUNT(*) as count FROM applicants WHERE admission_status = "admitted"'
    )
    stats['total_admitted'] = admitted[0]['count'] if admitted else 0
    
    return jsonify(stats), 200

@admin_bp.route('/letter-templates', methods=['GET'])
@AuthHandler.token_required
@AuthHandler.admin_required
def get_letter_templates(payload):
    """Get all letter templates"""
    templates = Database.execute_query(
        '''SELECT lt.id, lt.name, lt.subject, lt.program_id, p.name as program_name
           FROM letter_templates lt
           LEFT JOIN programs p ON lt.program_id = p.id
           ORDER BY lt.program_id IS NULL DESC, p.name, lt.name'''
    )
    return jsonify({'templates': templates or []}), 200

@admin_bp.route('/letter-template/<int:template_id>', methods=['GET'])
@AuthHandler.token_required
@AuthHandler.admin_required
def get_letter_template(payload, template_id):
    """Get specific letter template"""
    template = Database.execute_query(
        '''SELECT lt.*, p.name as program_name
           FROM letter_templates lt
           LEFT JOIN programs p ON lt.program_id = p.id
           WHERE lt.id = %s''',
        (template_id,)
    )
    
    if not template:
        return jsonify({'message': 'Template not found'}), 404
    
    return jsonify({'template': template[0]}), 200

@admin_bp.route('/letter-templates', methods=['POST'])
@AuthHandler.token_required
@AuthHandler.admin_required
def create_letter_template(payload):
    """Create a new letter template"""
    admin_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'name' not in data or 'body_html' not in data:
        return jsonify({'message': 'name and body_html are required'}), 400
    
    name = data['name']
    program_id = data.get('program_id')  # Can be None for default
    subject = data.get('subject', 'Admission Letter')
    header_text = data.get('header_text', '')
    body_html = data['body_html']
    footer_text = data.get('footer_text', '')
    
    # Check if program exists if specified
    if program_id:
        program = Database.execute_query('SELECT id FROM programs WHERE id = %s', (program_id,))
        if not program:
            return jsonify({'message': 'Invalid program_id'}), 400
    
    template_id = Database.execute_update(
        '''INSERT INTO letter_templates
           (name, program_id, subject, header_text, body_html, footer_text, created_by)
           VALUES (%s, %s, %s, %s, %s, %s, %s)''',
        (name, program_id, subject, header_text, body_html, footer_text, admin_id)
    )
    
    if not template_id:
        return jsonify({'message': 'Failed to create template'}), 500
    
    return jsonify({
        'message': 'Template created successfully',
        'template_id': template_id
    }), 201

@admin_bp.route('/letter-template/<int:template_id>', methods=['PUT'])
@AuthHandler.token_required
@AuthHandler.admin_required
def update_letter_template(payload, template_id):
    """Update a letter template"""
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Check if template exists
    existing = Database.execute_query('SELECT id FROM letter_templates WHERE id = %s', (template_id,))
    if not existing:
        return jsonify({'message': 'Template not found'}), 404
    
    # Build update query dynamically
    update_fields = []
    params = []
    
    allowed_fields = ['name', 'program_id', 'subject', 'header_text', 'body_html', 'footer_text']
    for field in allowed_fields:
        if field in data:
            update_fields.append(f'{field} = %s')
            params.append(data[field])
    
    if not update_fields:
        return jsonify({'message': 'No valid fields to update'}), 400
    
    params.append(template_id)
    query = f'UPDATE letter_templates SET {", ".join(update_fields)}, updated_at = NOW() WHERE id = %s'
    
    success = Database.execute_update(query, tuple(params))
    
    if not success:
        return jsonify({'message': 'Failed to update template'}), 500
    
    return jsonify({'message': 'Template updated successfully'}), 200

@admin_bp.route('/letter-template/<int:template_id>', methods=['DELETE'])
@AuthHandler.token_required
@AuthHandler.admin_required
def delete_letter_template(payload, template_id):
    """Delete a letter template"""
    # Check if template exists
    existing = Database.execute_query('SELECT id FROM letter_templates WHERE id = %s', (template_id,))
    if not existing:
        return jsonify({'message': 'Template not found'}), 404
    
    # Check if template is being used
    used = Database.execute_query('SELECT id FROM admission_letters WHERE letter_template_id = %s LIMIT 1', (template_id,))
    if used:
        return jsonify({'message': 'Cannot delete template that has been used to generate letters'}), 400
    
    success = Database.execute_update('DELETE FROM letter_templates WHERE id = %s', (template_id,))
    
    if not success:
        return jsonify({'message': 'Failed to delete template'}), 500
    
    return jsonify({'message': 'Template deleted successfully'}), 200
