import os
import re
import io
import base64
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors

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
                                rightMargin=0.75*inch, leftMargin=0.75*inch,
                                topMargin=0.75*inch, bottomMargin=0.75*inch)
        
        # Build story
        story = []
        styles = getSampleStyleSheet()
        
        # Create custom styles for admission letter
        title_style = ParagraphStyle(
            'LetterTitle',
            parent=styles['Heading1'],
            fontSize=16,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'LetterHeading',
            parent=styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=10,
            alignment=TA_LEFT,
            fontName='Helvetica-Bold'
        )
        
        body_style = ParagraphStyle(
            'LetterBody',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            spaceAfter=8,
            alignment=TA_LEFT,
            fontName='Helvetica'
        )
        
        # Header
        story.append(Paragraph("OFFICIAL ADMISSION LETTER", title_style))
        story.append(Spacer(1, 0.3*inch))
        
        # Strip HTML tags and convert to plain text
        plain_text = re.sub(r'<[^>]+>', '\n', body_html)
        plain_text = plain_text.replace('&nbsp;', ' ').replace('&#160;', ' ')
        
        # Add content as paragraphs
        for paragraph in plain_text.split('\n'):
            if paragraph.strip():
                story.append(Paragraph(paragraph.strip(), body_style))
        
        # Footer with generation date
        story.append(Spacer(1, 0.5*inch))
        footer_text = f"Generated on {datetime.now().strftime('%d %B %Y')}"
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#64748b'),
            alignment=TA_CENTER
        )
        story.append(Paragraph(footer_text, footer_style))
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
