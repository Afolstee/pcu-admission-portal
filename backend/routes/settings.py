"""routes/settings.py — System wide settings management (Admin only)."""
from flask import Blueprint, request, jsonify
from database import Database
from utils.auth import AuthHandler

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/all', methods=['GET'])
@AuthHandler.token_required
@AuthHandler.admin_required
def get_all_settings(payload):
    settings = Database.execute_query('SELECT key, value, description, updated_at FROM system_settings')
    return jsonify({'settings': settings or []}), 200

@settings_bp.route('/<string:key>', methods=['GET'])
def get_setting(key):
    # Publicly accessible for some keys (like registration_locked)
    setting = Database.execute_query('SELECT value FROM system_settings WHERE key = %s', (key,))
    if not setting:
        return jsonify({'message': 'Setting not found'}), 404
    return jsonify({'key': key, 'value': setting[0]['value']}), 200

@settings_bp.route('/update', methods=['POST'])
@AuthHandler.token_required
@AuthHandler.admin_required
def update_setting(payload):
    data = request.get_json()
    if not data or 'key' not in data or 'value' not in data:
        return jsonify({'message': 'key and value required'}), 400
    
    key = data['key']
    value = str(data['value']).lower() # Normalize for boolean-like strings
    
    success = Database.execute_update(
        'UPDATE system_settings SET value = %s, updated_at = NOW() WHERE key = %s',
        (value, key)
    )
    
    if not success:
        return jsonify({'message': 'Failed to update setting'}), 500
        
    return jsonify({'message': f'Setting {key} updated successfully', 'value': value}), 200
