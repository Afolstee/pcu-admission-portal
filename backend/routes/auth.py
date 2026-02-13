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
    if not data or not all(k in data for k in ['name', 'email', 'password', 'phone_number']):
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
        'INSERT INTO users (name, email, password_hash, phone_number, role) VALUES (%s, %s, %s, %s, %s)',
        (data['name'], data['email'], password_hash, data['phone_number'], 'applicant')
    )
    
    if not user_id:
        return jsonify({'message': 'Failed to create account'}), 500
    
    # Create applicant record WITHOUT a selected program.
    # The applicant MUST explicitly choose a program in the portal.
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
            'name': data['name'],
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
    
    # Query user by email
    users = Database.execute_query(
        'SELECT id, name, email, password_hash, role, status FROM users WHERE email = %s',
        (data['email'],)
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
    
    # Get applicant status if user is applicant
    applicant_data = None
    if user['role'] == 'applicant':
        applicants = Database.execute_query(
            'SELECT id, program_id, application_status, admission_status FROM applicants WHERE user_id = %s',
            (user['id'],)
        )
        if applicants:
            applicant_data = applicants[0]
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'role': user['role']
        },
        'applicant': applicant_data
    }), 200

@auth_bp.route('/verify-token', methods=['GET'])
@AuthHandler.token_required
def verify_token(payload):
    """Verify JWT token validity"""
    return jsonify({
        'message': 'Token is valid',
        'user_id': payload['user_id'],
        'role': payload['role']
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout endpoint (token is invalidated on client side)"""
    return jsonify({'message': 'Logged out successfully'}), 200
