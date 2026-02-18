import os
import re
import io
import base64
import pdfkit

class PDFGenerator:
    """Generate PDFs from HTML using pdfkit + wkhtmltopdf."""

    @staticmethod
    def _get_wkhtmltopdf_path():
        # Look for environment variable first
        env_path = os.getenv("WKHTMLTOPDF_PATH")
        if env_path and os.path.exists(env_path):
            return env_path

        # Common Windows path
        default_path = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
        if os.path.exists(default_path):
            return default_path

        # Fallback: assume it's in PATH (Linux/Render)
        return "wkhtmltopdf"

    _config = None

    @classmethod
    def _get_config(cls):
        if cls._config is None:
            cls._config = pdfkit.configuration(wkhtmltopdf=cls._get_wkhtmltopdf_path())
        return cls._config

    @staticmethod
    def _load_template():
        template_path = os.path.join(
            os.path.dirname(__file__),
            "admission_letter_template.html",
        )
        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as f:
                return f.read()
        return "<p>No template found</p>"

    @staticmethod
    def _convert_image_to_base64(html_content: str) -> str:
        pattern = r'src=["\']([^"\']+)["\']'

        def replace(match):
            src_path = match.group(1)
            if src_path.startswith("data:"):
                return match.group(0)

            resolved_path = os.path.join(os.path.dirname(__file__), src_path)
            if os.path.exists(resolved_path):
                with open(resolved_path, "rb") as img:
                    img_data = base64.b64encode(img.read()).decode()
                    ext = os.path.splitext(resolved_path)[1].lower()
                    mime = {
                        ".png": "image/png",
                        ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg",
                        ".gif": "image/gif",
                        ".svg": "image/svg+xml",
                    }.get(ext, "image/png")
                    return f'src="data:{mime};base64,{img_data}"'
            return match.group(0)

        return re.sub(pattern, replace, html_content)

    @staticmethod
    def generate_admission_letter_pdf(body_html: str = "", **kwargs) -> bytes:
        if not body_html.strip():
            body_html = PDFGenerator._load_template()

        # Replace placeholders
        for key, value in kwargs.items():
            pattern = r"\{\{\s*" + re.escape(key) + r"\s*\}\}"
            body_html = re.sub(pattern, str(value or ""), body_html, flags=re.IGNORECASE)

        # Wrap in minimal HTML if needed
        if not re.search(r"<\s*html", body_html, re.IGNORECASE):
            body_html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Admission Letter</title>
<style>
body {{ font-family: "Times New Roman", serif; font-size:14px; line-height:1.6; }}
p {{ margin: 10px 0; }}
</style>
</head>
<body>
{body_html}
</body>
</html>
"""

        # Convert images to base64
        html_with_images = PDFGenerator._convert_image_to_base64(body_html)

        # Generate PDF
        pdf_bytes = pdfkit.from_string(
            html_with_images, False, configuration=PDFGenerator._get_config()
        )
        return pdf_bytes