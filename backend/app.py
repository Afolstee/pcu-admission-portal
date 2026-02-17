from flask import Flask
from flask_cors import CORS
from config import config
import os

def create_app(config_name='development'):

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(app,
     resources={r"/api/*": {"origins": [
         "http://localhost:3000", 
         "https://admission-portal-pcu.onrender.com"
         "https://pcu-admission-portal.vercel.app"
     ]}},
     supports_credentials=True)

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    from routes.auth import auth_bp
    from routes.applicant import applicant_bp
    from routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(applicant_bp, url_prefix='/api/applicant')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok'}, 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)  # only for local dev