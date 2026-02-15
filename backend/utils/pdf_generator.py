import io
import os
import re
import base64
import platform

# Detect OS
IS_WINDOWS = platform.system() == "Windows"

# Conditional imports
if IS_WINDOWS:
    import pdfkit
else:
    from weasyprint import HTML


class PDFGenerator:
    """Handles PDF generation:
       - Windows → wkhtmltopdf
       - Linux/Render → WeasyPrint
    """

    # ----------------------------
    # Windows wkhtmltopdf config
    # ----------------------------
    @staticmethod
    def _get_wkhtmltopdf_path():
        env_path = os.getenv("WKHTMLTOPDF_PATH")
        if env_path:
            return env_path

        default_path = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
        if os.path.exists(default_path):
            return default_path

        return "wkhtmltopdf"

    _config = None

    @classmethod
    def _get_config(cls):
        if IS_WINDOWS and cls._config is None:
            try:
                cls._config = pdfkit.configuration(
                    wkhtmltopdf=cls._get_wkhtmltopdf_path()
                )
            except Exception as e:
                print(f"wkhtmltopdf config warning: {e}")
                cls._config = None
        return cls._config

    # ----------------------------
    # Template Loader
    # ----------------------------
    @staticmethod
    def _load_template():
        template_path = os.path.join(
            os.path.dirname(__file__),
            "admission_letter_template.html",
        )
        if os.path.exists(template_path):
            with open(template_path, "r", encoding="utf-8") as f:
                return f.read()
        return ""

    # ----------------------------
    # Image Embedding
    # ----------------------------
    @staticmethod
    def _convert_image_to_base64(html_content: str) -> str:
        pattern = r'src=["\']([^"\']+)["\']'

        def replace(match):
            src_path = match.group(1)

            if src_path.startswith("data:"):
                return match.group(0)

            try:
                backend_dir = os.path.dirname(os.path.dirname(__file__))

                if src_path.startswith(".."):
                    workspace_root = os.path.dirname(backend_dir)
                    resolved_path = os.path.normpath(
                        os.path.join(workspace_root, src_path.replace("../", "", 1))
                    )
                else:
                    resolved_path = os.path.normpath(
                        os.path.join(backend_dir, src_path)
                    )

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
                else:
                    print(f"Image not found: {resolved_path}")
                    return match.group(0)

            except Exception as e:
                print(f"Image conversion error: {e}")
                return match.group(0)

        return re.sub(pattern, replace, html_content)

    # ----------------------------
    # Main Generator
    # ----------------------------
    @staticmethod
    def generate_admission_letter_pdf(
        body_html: str = "",
        applicant_name: str = "",
        program: str = "",
        level: str = "100 Level",
        department: str = "N/A",
        faculty: str = "N/A",
        session: str = "2025/2026",
        mode: str = "Full-Time",
        admission_date: str = "",
        acceptance_fee: str = "",
        tuition_fee: str = "",
        other_fees: str = "",
        resumption_date: str = "",
        reference: str = "",
        **kwargs,
    ) -> bytes:

        if not body_html.strip():
            body_html = PDFGenerator._load_template()

        replacements = {
            "applicant_name": applicant_name,
            "candidateName": applicant_name,
            "candidate_name": applicant_name,
            "programme": program,
            "program": program,
            "level": level,
            "department": department,
            "faculty": faculty,
            "session": session,
            "mode": mode,
            "date": admission_date,
            "admission_date": admission_date,
            "acceptanceFee": acceptance_fee,
            "acceptance_fee": acceptance_fee,
            "tuition": tuition_fee,
            "tuition_fee": tuition_fee,
            "other_fees": other_fees,
            "resumption_date": resumption_date,
            "reference": reference,
            "ref_no": reference,
            "ref": reference,
        }

        replacements.update(kwargs)

        for key, value in replacements.items():
            pattern = r"\{\{\s*" + re.escape(key) + r"\s*\}\}"
            body_html = re.sub(
                pattern, str(value or ""), body_html, flags=re.IGNORECASE
            )

        if not re.search(r"<\s*html", body_html, re.IGNORECASE):
            body_html = f"""
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Admission Letter</title>
<style>
body {{
    font-family: "Times New Roman", serif;
    font-size: 14px;
    line-height: 1.6;
}}
p {{
    margin: 10px 0;
}}
</style>
</head>
<body>
{body_html}
</body>
</html>
"""

        html_with_images = PDFGenerator._convert_image_to_base64(body_html)

        try:
            if IS_WINDOWS:
                print("Using wkhtmltopdf (Windows)")
                return pdfkit.from_string(
                    html_with_images,
                    False,
                    configuration=PDFGenerator._get_config(),
                )
            else:
                print("Using WeasyPrint (Linux/Render)")
                pdf_io = io.BytesIO()
                HTML(string=html_with_images).write_pdf(pdf_io)
                pdf_io.seek(0)
                return pdf_io.read()

        except Exception as e:
            raise Exception(f"PDF generation failed: {str(e)}")