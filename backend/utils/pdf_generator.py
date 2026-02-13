import io
import re
from xhtml2pdf import pisa
from typing import Optional

class PDFGenerator:
    """Handles PDF generation from HTML templates using xhtml2pdf"""

    @staticmethod
    def generate_admission_letter_pdf(
        header_text: str,
        body_html: str,
        footer_text: str,
        applicant_name: str,
        program: str,
        admission_date: str,
        acceptance_fee: Optional[str] = None,
        tuition_fee: Optional[str] = None,
        **kwargs
    ) -> bytes:
        """
        Generate PDF from admission letter HTML template with placeholders replaced.

        Returns PDF as bytes.
        """
        # Replace placeholders (support both [PLACEHOLDER] and {{placeholder}} formats)
        replacements = {
            'APPLICANT_NAME': applicant_name,
            'PROGRAM': program,
            'ADMISSION_DATE': admission_date,
        }
        if acceptance_fee:
            replacements['ACCEPTANCE_FEE'] = acceptance_fee
        if tuition_fee:
            replacements['TUITION_FEE'] = tuition_fee

        # First replace bracket style [KEY]
        for k, v in replacements.items():
            body_html = body_html.replace(f'[{k}]', str(v))

        # Replace common double-curly placeholders explicitly (case-sensitive keys as in template)
        curly_common = {
            'applicant_name': applicant_name,
            'program': program,
            'admission_date': admission_date,
        }
        if acceptance_fee:
            curly_common['acceptance_fee'] = acceptance_fee
        if tuition_fee:
            curly_common['tuition_fee'] = tuition_fee

        for k, v in curly_common.items():
            # match {{key}} or {{ key }} with optional whitespace
            body_html = re.sub(r'\{\{\s*' + re.escape(k) + r'\s*\}\}', str(v), body_html)

        # Replace additional placeholders provided via kwargs.
        # Support: [KEY], {{key}}, and {{ key }}
        for key, value in kwargs.items():
            if value is None:
                continue
            # bracket form uses uppercase
            body_html = body_html.replace(f'[{key.upper()}]', str(value))
            # double-curly form (allow spaces)
            body_html = re.sub(r'\{\{\s*' + re.escape(key) + r'\s*\}\}', str(value), body_html)
            # also try uppercase curly if template used uppercase
            body_html = re.sub(r'\{\{\s*' + re.escape(key.upper()) + r'\s*\}\}', str(value), body_html)

        # If the template already contains a full HTML document, use it as-is to avoid nested html tags.
        if re.search(r"<\s*!doctype|<\s*html", body_html, re.IGNORECASE):
            html_content = body_html
        else:
            # Create complete HTML document wrapper
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Admission Letter</title>
            </head>
            <body>
                {body_html}
            </body>
            </html>
            """

        # Generate PDF
        buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=buffer)
        
        if pisa_status.err:
            raise Exception("PDF generation failed")

        pdf_bytes = buffer.getvalue()
        buffer.close()

        return pdf_bytes