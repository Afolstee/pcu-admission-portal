import io
import os
import re
import base64
from typing import Optional
from weasyprint import HTML

class PDFGenerator:
    """Handles PDF generation from HTML templates using WeasyPrint"""

    @staticmethod
    def _load_template():
        """Load the admission letter HTML template"""
        template_path = os.path.join(
            os.path.dirname(__file__),
            'admission_letter_template.html'
        )
        if os.path.exists(template_path):
            with open(template_path, 'r', encoding='utf-8') as f:
                return f.read()
        return ""

    @staticmethod
    def _convert_image_to_base64(html_content: str) -> str:
        """Convert image src paths to base64 data URLs"""
        pattern = r'src=["\']([^"\']+)["\']'

        def replace_img_src(match):
            src_path = match.group(1)

            # Skip if already base64
            if src_path.startswith('data:'):
                return match.group(0)

            try:
                backend_dir = os.path.dirname(os.path.dirname(__file__))

                if src_path.startswith('..'):
                    workspace_root = os.path.dirname(backend_dir)
                    resolved_path = os.path.normpath(
                        os.path.join(workspace_root, src_path.replace('../', '', 1))
                    )
                else:
                    resolved_path = os.path.normpath(
                        os.path.join(backend_dir, src_path)
                    )

                if os.path.exists(resolved_path):
                    with open(resolved_path, 'rb') as img_file:
                        img_data = base64.b64encode(img_file.read()).decode()
                        ext = os.path.splitext(resolved_path)[1].lower()
                        mime_type = {
                            '.png': 'image/png',
                            '.jpg': 'image/jpeg',
                            '.jpeg': 'image/jpeg',
                            '.gif': 'image/gif',
                            '.svg': 'image/svg+xml',
                        }.get(ext, 'image/png')

                        return f'src="data:{mime_type};base64,{img_data}"'
                else:
                    print(f"Warning: Image file not found at {resolved_path}")
                    return match.group(0)

            except Exception as e:
                print(f"Warning: Could not convert image {src_path}: {e}")
                return match.group(0)

        return re.sub(pattern, replace_img_src, html_content)

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
        header_text: str = "",
        footer_text: str = "",
        **kwargs
    ) -> bytes:

        if not body_html or body_html.strip() == "":
            body_html = PDFGenerator._load_template()

        replacements = {
            'applicant_name': applicant_name,
            'candidateName': applicant_name,
            'candidate_name': applicant_name,
            'programme': program,
            'program': program,
            'level': level,
            'department': department,
            'faculty': faculty,
            'session': session,
            'mode': mode,
            'date': admission_date,
            'admission_date': admission_date,
            'acceptanceFee': acceptance_fee,
            'acceptance_fee': acceptance_fee,
            'tuition': tuition_fee,
            'tuition_fee': tuition_fee,
            'other_fees': other_fees,
            'resumption_date': resumption_date,
            'reference': reference,
            'ref_no': reference,
            'ref': reference,
        }

        replacements.update(kwargs)

        normalized = {}
        for k, v in replacements.items():
            normalized[k] = "" if v is None else str(v)

        replaced_html = body_html

        for key, value in normalized.items():
            pattern = r'\{\{\s*' + re.escape(key) + r'\s*\}\}'
            replaced_html = re.sub(pattern, value, replaced_html, flags=re.IGNORECASE)

        if re.search(r"<\s*html", replaced_html, re.IGNORECASE):
            html_content = replaced_html
        else:
            html_content = f"""
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
{replaced_html}
</body>
</html>
"""

        try:
            html_with_embedded_images = PDFGenerator._convert_image_to_base64(html_content)

            pdf_io = io.BytesIO()
            HTML(string=html_with_embedded_images).write_pdf(pdf_io)
            pdf_io.seek(0)

            return pdf_io.read()

        except Exception as e:
            raise Exception(f"PDF generation failed: {str(e)}")