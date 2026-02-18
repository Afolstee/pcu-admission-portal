import os
import re
import io
import base64
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

class PDFGenerator:
    """Generate PDFs from HTML using ReportLab (cross-platform, no system dependencies)."""

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
    def generate_admission_letter_pdf(body_html: str = "", **kwargs) -> bytes:
        # Load template if no HTML provided
        if not body_html.strip():
            body_html = PDFGenerator._load_template()

        # Replace placeholders in the template
        for key, value in kwargs.items():
            pattern = r"\{\{\s*" + re.escape(key) + r"\s*\}\}"
            body_html = re.sub(pattern, str(value or ""), body_html, flags=re.IGNORECASE)

        # Create PDF document in memory
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                                rightMargin=72, leftMargin=72,
                                topMargin=72, bottomMargin=18)
        
        # Build story
        story = []
        styles = getSampleStyleSheet()
        
        # Strip HTML tags and convert to plain text for reportlab
        plain_text = re.sub(r'<[^>]+>', '\n', body_html)
        plain_text = plain_text.replace('&nbsp;', ' ').replace('&#160;', ' ')
        
        # Add content as paragraphs
        for paragraph in plain_text.split('\n'):
            if paragraph.strip():
                story.append(Paragraph(paragraph.strip(), styles['Normal']))
                story.append(Spacer(1, 0.2*inch))
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()