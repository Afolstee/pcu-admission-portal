import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors

class MedicalFormGenerator:
    """Generate medical examination forms as PDFs."""

    @staticmethod
    def generate_medical_form_pdf(applicant_name: str, program_name: str, applicant_id: int) -> bytes:
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch
        )

        styles = getSampleStyleSheet()
        story = []

        # Title
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=16,
            alignment=TA_CENTER,
            spaceAfter=12
        )
        
        header_style = ParagraphStyle(
            'Header',
            parent=styles['Normal'],
            fontSize=12,
            alignment=TA_CENTER,
            spaceAfter=20
        )

        story.append(Paragraph("PRECIOUS CORNERSTONE UNIVERSITY", title_style))
        story.append(Paragraph("UNIVERSITY MEDICAL CENTRE", header_style))
        story.append(Paragraph("MEDICAL EXAMINATION FORM", title_style))
        story.append(Spacer(1, 0.2 * inch))

        # Student Details
        detail_style = ParagraphStyle(
            'Detail',
            parent=styles['Normal'],
            fontSize=10,
            leading=14
        )

        story.append(Paragraph(f"<b>Name:</b> {applicant_name}", detail_style))
        story.append(Paragraph(f"<b>Application ID:</b> PCU-APP-{applicant_id:04d}", detail_style))
        story.append(Paragraph(f"<b>Program:</b> {program_name}", detail_style))
        story.append(Spacer(1, 0.3 * inch))

        # Form content
        story.append(Paragraph("<b>PART A: CLINICAL EXAMINATION (To be completed by a Registered Medical Practitioner)</b>", detail_style))
        story.append(Spacer(1, 0.1 * inch))

        exam_items = [
            ["1. Height:", "________________", "2. Weight:", "________________"],
            ["3. Visual Acuity:", "________________", "4. Hearing:", "________________"],
            ["5. Blood Pressure:", "________________", "6. Pulse Rate:", "________________"],
            ["7. Cardiovascular System:", "________________", "8. Respiratory System:", "________________"],
            ["9. Abdomen:", "________________", "10. Nervous System:", "________________"]
        ]

        t = Table(exam_items, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        t.setStyle(TableStyle([
            ('FONT', (0,0), (-1,-1), 'Helvetica', 9),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.3 * inch))

        story.append(Paragraph("<b>PART B: LABORATORY INVESTIGATIONS</b>", detail_style))
        story.append(Spacer(1, 0.1 * inch))

        lab_items = [
            ["1. PCV / Hb:", "________________", "2. Blood Group:", "________________"],
            ["3. Genotype:", "________________", "4. Urinalysis:", "________________"],
            ["5. Chest X-Ray:", "________________", "6. HBsAg:", "________________"]
        ]

        t2 = Table(lab_items, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
        t2.setStyle(TableStyle([
            ('FONT', (0,0), (-1,-1), 'Helvetica', 9),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(t2)
        story.append(Spacer(1, 0.4 * inch))

        # Certification
        story.append(Paragraph("<b>MEDICAL OFFICER'S CERTIFICATION</b>", detail_style))
        story.append(Spacer(1, 0.1 * inch))
        story.append(Paragraph("I certify that I have examined the above candidate and found him/her fit / unfit for university admission.", detail_style))
        story.append(Spacer(1, 0.5 * inch))
        
        sig_table = [
            ["________________________", "________________________"],
            ["Signature & Stamp", "Date"]
        ]
        t3 = Table(sig_table, colWidths=[3*inch, 3*inch])
        t3.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONT', (0,0), (-1,-1), 'Helvetica', 8),
        ]))
        story.append(t3)

        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
