import io
import os
import re
import base64
import pdfkit
from typing import Optional

class PDFGenerator:
    """Handles PDF generation from HTML templates using pdfkit/wkhtmltopdf"""
    
    # Configure pdfkit with wkhtmltopdf path - make it flexible for different environments
    @staticmethod
    def _get_wkhtmltopdf_path():
        """Get the wkhtmltopdf path based on environment"""
        # Check environment variable first
        env_path = os.getenv('WKHTMLTOPDF_PATH')
        if env_path:
            return env_path
        
        # Windows path
        if os.name == 'nt':
            windows_path = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"
            if os.path.exists(windows_path):
                return windows_path
        
        # Linux/Unix - just use the command name (assumes it's in PATH)
        return 'wkhtmltopdf'
    
    _config = None
    
    @classmethod
    def _get_config(cls):
        """Lazy-load pdfkit configuration"""
        if cls._config is None:
            try:
                cls._config = pdfkit.configuration(
                    wkhtmltopdf=cls._get_wkhtmltopdf_path()
                )
            except Exception as e:
                print(f"Warning: pdfkit configuration failed: {e}")
                cls._config = None
        return cls._config
    
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
    
    @staticmethod
    def _convert_image_to_base64(html_content: str) -> str:
        """Convert image src paths to base64 data URLs"""
        # Pattern to find img src attributes
        pattern = r'src=["\']([^"\']+)["\']'
        
        def replace_img_src(match):
            src_path = match.group(1)
            
            # Skip if already a data URL
            if src_path.startswith('data:'):
                return match.group(0)
            
            # Try to resolve the image path
            try:
                # Get the backend directory (where app.py is)
                backend_dir = os.path.dirname(os.path.dirname(__file__))
                
                # Handle relative paths from template location
                if src_path.startswith('..'):
                    # Resolve relative to backend directory
                    # ../public/images/logo new.png should resolve to workspace_root/public/images/logo new.png
                    # From backend/utils -> go to backend -> go to workspace root -> go to public
                    workspace_root = os.path.dirname(backend_dir)
                    resolved_path = os.path.normpath(
                        os.path.join(workspace_root, src_path.replace('../', '', 1))
                    )
                else:
                    resolved_path = os.path.normpath(
                        os.path.join(backend_dir, src_path)
                    )
                
                # If file exists, convert to base64
                if os.path.exists(resolved_path):
                    with open(resolved_path, 'rb') as img_file:
                        img_data = base64.b64encode(img_file.read()).decode()
                        # Determine image type from extension
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
        """
        Generate PDF from admission letter HTML template with placeholders replaced.
        
        Replaces placeholders in the format: {{placeholder_name}} (case-insensitive)
        If body_html is empty, loads the default template.
        
        Returns PDF as bytes.
        """
        
        # If no body_html provided, load the default template
        if not body_html or body_html.strip() == "":
            body_html = PDFGenerator._load_template()
        
        # Build a comprehensive replacement dictionary with all possible variations
        replacements = {
            'applicant_name': applicant_name,
            'candidateName': applicant_name,
            'candidate_name': applicant_name,
            'APPLICANT_NAME': applicant_name,
            'programme': program,
            'program': program,
            'PROGRAM': program,
            'level': level,
            'LEVEL': level,
            'department': department,
            'DEPARTMENT': department,
            'faculty': faculty,
            'FACULTY': faculty,
            'session': session,
            'SESSION': session,
            'mode': mode,
            'MODE': mode,
            'date': admission_date,
            'DATE': admission_date,
            'admission_date': admission_date,
            'ADMISSION_DATE': admission_date,
            'acceptanceFee': acceptance_fee,
            'acceptance_fee': acceptance_fee,
            'ACCEPTANCE_FEE': acceptance_fee,
            'tuition': tuition_fee,
            'tuition_fee': tuition_fee,
            'TUITION_FEE': tuition_fee,
            'tuitionFee': tuition_fee,
            'other_fees': other_fees,
            'otherFees': other_fees,
            'OTHER_FEES': other_fees,
            'resumption_date': resumption_date,
            'resumptionDate': resumption_date,
            'RESUMPTION_DATE': resumption_date,
            'reference': reference,
            'ref_no': reference,
            'ref': reference,
            'REF': reference,
            'REFERENCE': reference,
        }
        
        # Add any additional kwargs
        replacements.update(kwargs)
        
        # Remove None and empty-string duplication by normalizing
        normalized = {}
        for k, v in replacements.items():
            if v is None:
                v = ""
            normalized[k] = str(v)
        
        # Replace all placeholders - handle both {{placeholder}} and {{ placeholder }} formats
        # Use a function to handle replacement case-insensitively
        replaced_html = body_html
        
        for key, value in normalized.items():
            # Match {{key}} or {{ key }} with optional whitespace (case-insensitive)
            pattern = r'\{\{\s*' + re.escape(key) + r'\s*\}\}'
            replaced_html = re.sub(pattern, value, replaced_html, flags=re.IGNORECASE)

        # If the template already contains a full HTML document, use it as-is
        if re.search(r"<\s*html", replaced_html, re.IGNORECASE):
            html_content = replaced_html
        else:
            # Create complete HTML document wrapper
            html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Admission Letter</title>
    <style>
        body {{
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            line-height: 1.6;
            margin: 0;
            padding: 0;
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

        # Generate PDF using pdfkit/wkhtmltopdf
        try:
            # Convert image paths to base64 data URLs for wkhtmltopdf compatibility
            html_with_embedded_images = PDFGenerator._convert_image_to_base64(html_content)
            pdf_bytes = pdfkit.from_string(html_with_embedded_images, False, configuration=PDFGenerator._get_config())
            return pdf_bytes
        except Exception as e:
            raise Exception(f"PDF generation failed: {str(e)}")

