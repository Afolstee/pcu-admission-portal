from flask import Blueprint, request, jsonify
from database import Database
from utils.auth import AuthHandler
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Create new user account"""
    data = request.get_json()
    
    # Validate input
    if not data or not all(k in data for k in ['first_name', 'last_name', 'email', 'password', 'phone_number']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Validate email format
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, data['email']):
        return jsonify({'message': 'Invalid email format'}), 400
    
    # Validate password length
    if len(data['password']) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400
    
    # Check if email already exists
    existing_user = Database.execute_query(
        'SELECT id FROM users WHERE email = %s',
        (data['email'],)
    )
    
    if existing_user:
        return jsonify({'message': 'Email already registered'}), 409
    
    # Hash password
    password_hash = AuthHandler.hash_password(data['password'])
    
    # Insert new user
    user_id = Database.execute_update(
        'INSERT INTO users (first_name, last_name, name, email, password_hash, phone_number, role) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id',
        (data['first_name'], data['last_name'], f"{data['first_name']} {data['last_name']}", data['email'], password_hash, data['phone_number'], 'applicant'),
        return_id=True
    )
    
    if not user_id:
        return jsonify({'message': 'Failed to create account'}), 500
 
    Database.execute_update(
        'INSERT INTO applicants (user_id, program_id) VALUES (%s, %s)',
        (user_id, None)
    )
    
    # Generate token
    token = AuthHandler.generate_token(user_id, 'applicant')
    
    return jsonify({
        'message': 'Account created successfully',
        'token': token,
        'user': {
            'id': user_id,
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'name': f"{data['first_name']} {data['last_name']}",
            'email': data['email'],
            'role': 'applicant'
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data or not all(k in data for k in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400
    
    # Query user by email or username
    users = Database.execute_query(
        'SELECT id, name, first_name, last_name, email, username, password_hash, role, status FROM users WHERE email = %s OR username = %s',
        (data['email'], data['email'])
    )
    
    if not users:
        return jsonify({'message': 'Invalid credentials'}), 401
    
    user = users[0]
    
    # Check if user is active
    if user['status'] != 'active':
        return jsonify({'message': 'Account is inactive or suspended'}), 403
    
    # Verify password
    if not AuthHandler.verify_password(data['password'], user['password_hash']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Generate token
    token = AuthHandler.generate_token(user['id'], user['role'])
    
    # Get applicant or student status
    extra_data = {}
    if user['role'] == 'applicant':
        applicants = Database.execute_query(
            'SELECT id, program_id, application_status, admission_status FROM applicants WHERE user_id = %s',
            (user['id'],)
        )
        if applicants:
            extra_data['applicant'] = applicants[0]
            
    elif user['role'] == 'student':
        students = Database.execute_query(
            '''SELECT s.id, s.matric_number, s.program_id, s.current_level, s.session, s.is_first_login, p.name as program_name 
               FROM students s 
               LEFT JOIN programs p ON s.program_id = p.id 
               WHERE s.user_id = %s''',
            (user['id'],)
        )
        if students:
            extra_data['student'] = students[0]
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'first_name': user.get('first_name'),
            'last_name': user.get('last_name'),
            'email': user['email'],
            'username': user.get('username'),
            'role': user['role']
        },
        **extra_data
    }), 200

@auth_bp.route('/verify-token', methods=['GET'])
@AuthHandler.token_required
def verify_token(payload):
    """Verify JWT token validity and return user info"""
    user_id = payload['user_id']
    
    user = Database.execute_query(
        'SELECT id, name, first_name, last_name, email, username, role FROM users WHERE id = %s',
        (user_id,)
    )
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    user_data = user[0]
    
    # Get applicant or student status
    extra_data = {}
    if user_data['role'] == 'applicant':
        applicants = Database.execute_query(
            'SELECT id, program_id, application_status, admission_status FROM applicants WHERE user_id = %s',
            (user_id,)
        )
        if applicants:
            extra_data['applicant'] = applicants[0]
            
    elif user_data['role'] == 'student':
        students = Database.execute_query(
            '''SELECT s.id, s.matric_number, s.program_id, s.current_level, s.session, s.is_first_login, p.name as program_name 
               FROM students s 
               LEFT JOIN programs p ON s.program_id = p.id 
               WHERE s.user_id = %s''',
            (user_id,)
        )
        if students:
            extra_data['student'] = students[0]
            
    return jsonify({
        'message': 'Token is valid',
        'user': {
            'id': user_data['id'],
            'name': user_data['name'],
            'first_name': user_data.get('first_name'),
            'last_name': user_data.get('last_name'),
            'email': user_data['email'],
            'username': user_data.get('username'),
            'role': user_data['role']
        },
        **extra_data
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout endpoint (token is invalidated on client side)"""
    return jsonify({'message': 'Logged out successfully'}), 200
