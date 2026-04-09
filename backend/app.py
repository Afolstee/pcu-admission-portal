from flask import Flask, request
from flask_cors import CORS
from config import config
import os

def create_app(config_name='development'):

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:3000",
            "https://pcu-admission-portal.vercel.app",
            "null"
        ]
    )

    @app.after_request
    def after_request(response):
        origin = request.headers.get("Origin")
        allowed_origins = [
            "http://localhost:3000",
            "https://pcu-admission-portal.vercel.app",
            "null"
        ]
        if origin in allowed_origins:
            response.headers["Access-Control-Allow-Origin"] = origin

        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            return "", 200

    if not os.path.exists(app.config['UPLOAD_FOLDER']):
        os.makedirs(app.config['UPLOAD_FOLDER'])

    from routes.auth import auth_bp
    from routes.applicant import applicant_bp
    from routes.admin import admin_bp
    from routes.student import student_bp
    from routes.scores import scores_bp
    from routes.staff import staff_bp
    from routes.hod import hod_bp
    from routes.dean import dean_bp
    from routes.registrar import registrar_bp
    from routes.settings import settings_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(applicant_bp, url_prefix='/api/applicant')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(scores_bp, url_prefix='/api/scores')
    app.register_blueprint(staff_bp, url_prefix='/api/staff')
    app.register_blueprint(hod_bp, url_prefix='/api/hod')
    app.register_blueprint(dean_bp, url_prefix='/api/dean')
    app.register_blueprint(registrar_bp, url_prefix='/api/registrar')
    app.register_blueprint(settings_bp, url_prefix='/api/settings')

    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok'}, 200

    @app.errorhandler(404)
    def handle_404(e):
        try:
            from database import Database
            Database.execute_update("INSERT INTO error_logs (error_type, message, path) VALUES (%s, %s, %s)", ('404', 'Page Not Found', request.path))
        except:
            pass
        return {'error': 'Not found'}, 404

    @app.errorhandler(500)
    def handle_500(e):
        try:
            from database import Database
            Database.execute_update("INSERT INTO error_logs (error_type, message, path) VALUES (%s, %s, %s)", ('500', str(e), request.path))
        except:
            pass
        return {'error': 'Internal server error'}, 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
