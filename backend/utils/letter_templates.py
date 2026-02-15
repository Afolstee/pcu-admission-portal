"""
Letter template types and utilities
"""

AVAILABLE_TEMPLATES = {
    'fsms_part_time': {
        'id': 'fsms_part_time',
        'name': 'FSMS Part-Time Admission Letter',
        'description': 'Standard admission letter for part-time programs',
        'mode': 'Part-Time'
    },
    'default': {
        'id': 'default',
        'name': 'Default Admission Letter',
        'description': 'General admission letter for all programs',
        'mode': None
    }
}

def get_template_by_id(template_id):
    """Get template configuration by ID"""
    return AVAILABLE_TEMPLATES.get(template_id, AVAILABLE_TEMPLATES['default'])

def get_all_templates():
    """Get all available templates"""
    return list(AVAILABLE_TEMPLATES.values())
