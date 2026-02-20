from flask import Flask, request
from flask_cors import CORS
from config import config
import os

def create_app(config_name='development'):

    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # ✅ Proper CORS config (clean + controlled)
    CORS(
        app,
        supports_credentials=True,
        origins=[
            "http://localhost:3000",
            "https://pcu-admission-portal.vercel.app"
        ]
    )

    # ✅ Ensure headers always present
    @app.after_request
    def after_request(response):
        origin = request.headers.get("Origin")
        if origin in [
            "http://localhost:3000",
            "https://pcu-admission-portal.vercel.app"
        ]:
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

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(applicant_bp, url_prefix='/api/applicant')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    @app.route('/api/health', methods=['GET'])
    def health():
        return {'status': 'ok'}, 200

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)