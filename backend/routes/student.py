from flask import Blueprint, request, jsonify
from database import Database
from utils.auth import AuthHandler

student_bp = Blueprint('student', __name__)

@student_bp.route('/change-password', methods=['POST'])
@AuthHandler.token_required
def change_password(payload):
    """Change student password on first login"""
    user_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'new_password' not in data:
        return jsonify({'message': 'New password required'}), 400
        
    if len(data['new_password']) < 6:
         return jsonify({'message': 'Password must be at least 6 characters'}), 400

    hashed_pw = AuthHandler.hash_password(data['new_password'])
    
    # Update password and disable first login flag
    try:
        Database.execute_update(
            'UPDATE users SET password_hash = %s WHERE id = %s',
            (hashed_pw, user_id)
        )
        Database.execute_update(
            'UPDATE students SET is_first_login = FALSE WHERE user_id = %s',
            (user_id,)
        )
        return jsonify({'message': 'Password updated successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error updating password: {e}'}), 500

@student_bp.route('/courses', methods=['GET'])
@AuthHandler.token_required
def get_courses(payload):
    """Retrieve available courses for the student's program, level, and semester"""
    user_id = payload['user_id']
    semester = request.args.get('semester', 'First')
    
    # Get student info
    student = Database.execute_query(
        '''SELECT s.id, s.program_id, s.current_level, s.session, p.registration_deadline 
           FROM students s JOIN programs p ON s.program_id = p.id 
           WHERE s.user_id = %s''',
        (user_id,)
    )
    
    if not student:
        return jsonify({'message': 'Student record not found'}), 404
        
    s_data = student[0]
    
    # Fetch courses
    courses = Database.execute_query(
        '''SELECT id, course_code, course_title, credit_units, category 
           FROM courses 
           WHERE program_id = %s AND level = %s AND semester = %s
           ORDER BY category, course_code''',
        (s_data['program_id'], s_data['current_level'], semester)
    )
    
    # Fetch existing registration if any
    reg_status = None
    registered_ids = []
    
    reg = Database.execute_query(
        'SELECT id, status FROM course_registrations WHERE student_id = %s AND session = %s AND semester = %s',
        (s_data['id'], s_data['session'], semester)
    )
    
    if reg:
        reg_status = reg[0]['status']
        reg_courses = Database.execute_query(
            'SELECT course_id FROM registered_courses WHERE registration_id = %s',
            (reg[0]['id'],)
        )
        registered_ids = [rc['course_id'] for rc in (reg_courses or [])]
        
    return jsonify({
        'courses': courses or [],
        'registration_status': reg_status,
        'registered_course_ids': registered_ids,
        'student': s_data,
        'registration_deadline': s_data.get('registration_deadline')
    }), 200

@student_bp.route('/register-courses', methods=['POST'])
@AuthHandler.token_required
def register_courses(payload):
    """Submit course registration"""
    user_id = payload['user_id']
    data = request.get_json()
    
    if not data or 'course_ids' not in data or 'semester' not in data:
        return jsonify({'message': 'course_ids and semester are required'}), 400
        
    course_ids = data['course_ids']
    semester = data['semester']
    
    if not isinstance(course_ids, list):
         return jsonify({'message': 'course_ids must be a list'}), 400

    student = Database.execute_query(
        '''SELECT s.id, s.session, s.program_id, s.current_level, p.registration_deadline 
           FROM students s JOIN programs p ON s.program_id = p.id 
           WHERE s.user_id = %s''',
        (user_id,)
    )
    
    if not student:
        return jsonify({'message': 'Student record not found'}), 404
        
    s_data = student[0]
    student_id = s_data['id']
    current_session = s_data['session']
    registration_deadline = s_data.get('registration_deadline')
    
    # Enforce deadline if set
    import datetime
    if registration_deadline and datetime.datetime.now() > registration_deadline:
        return jsonify({'message': 'Registration deadline has passed'}), 403
        
    # Check if already submitted
    reg = Database.execute_query(
        'SELECT id, status FROM course_registrations WHERE student_id = %s AND session = %s AND semester = %s',
        (student_id, current_session, semester)
    )
    
    if reg and reg[0]['status'] == 'submitted':
        return jsonify({'message': 'Course registration already submitted and locked'}), 403
        
    # Validation against valid courses (prevent injection)
    valid_courses = Database.execute_query(
         '''SELECT id, credit_units, category FROM courses 
            WHERE program_id = %s AND level = %s AND semester = %s''',
         (s_data['program_id'], s_data['current_level'], semester)
    )
    valid_map = {c['id']: c for c in (valid_courses or [])}
    
    # Calculate totals
    total_credits = 0
    selected_valid = []
    
    for cid in course_ids:
        # Convert to int just in case
        try:
             cid = int(cid)
        except:
             continue
             
        if cid in valid_map:
             selected_valid.append(cid)
             total_credits += valid_map[cid]['credit_units']
             
    # Ensure compulsory/core are met? Basic validation:
    compulsory_courses = [c['id'] for c in (valid_courses or []) if c['category'].lower() in ('compulsory', 'core')]
    missing = set(compulsory_courses) - set(selected_valid)
    if missing:
        return jsonify({'message': 'You must select all compulsory and core courses'}), 400
        
    try:
        if reg:
            reg_id = reg[0]['id']
            # Update
            Database.execute_update(
                'UPDATE course_registrations SET total_credits = %s, status = %s, submitted_at = NOW() WHERE id = %s',
                (total_credits, 'submitted', reg_id)
            )
            # Replace courses
            Database.execute_update('DELETE FROM registered_courses WHERE registration_id = %s', (reg_id,))
        else:
            reg_id = Database.execute_update(
                '''INSERT INTO course_registrations (student_id, session, semester, status, total_credits, submitted_at)
                   VALUES (%s, %s, %s, %s, %s, NOW()) RETURNING id''',
                (student_id, current_session, semester, 'submitted', total_credits),
                return_id=True
            )
            
        # Insert selected
        for cid in selected_valid:
             Database.execute_update(
                 'INSERT INTO registered_courses (registration_id, course_id) VALUES (%s, %s)',
                 (reg_id, cid)
             )
             
        return jsonify({'message': 'Courses registered successfully'}), 200
        
    except Exception as e:
        return jsonify({'message': f'Error saving registration: {e}'}), 500
