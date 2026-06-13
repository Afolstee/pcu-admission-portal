import os
import io
import base64
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm, inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.lib import colors

class PTApplicationPDFGenerator:
    """Generate professional PT Application forms as PDFs using ReportLab."""

    @staticmethod
    def generate_pdf(
        app_data: dict,
        form: dict,
        degree_name: str,
        degree_code: str,
        course_name: str,
        faculty_name: str,
        signature_b64: str = ""
    ) -> bytes:
        pdf_buffer = io.BytesIO()
        
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=A4,
            leftMargin=1.5 * cm,
            rightMargin=1.5 * cm,
            topMargin=1.2 * cm,
            bottomMargin=1.2 * cm
        )

        story = []
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle(
            'UnivTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            alignment=TA_CENTER,
            spaceAfter=2
        )
        
        address_style = ParagraphStyle(
            'UnivAddress',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=10,
            alignment=TA_CENTER,
            spaceAfter=8
        )
        
        form_title_style = ParagraphStyle(
            'FormTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=12,
            leading=14,
            alignment=TA_CENTER,
            spaceAfter=2
        )
        
        subtitle_style = ParagraphStyle(
            'FormSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9,
            leading=11,
            alignment=TA_CENTER,
            spaceAfter=15
        )
        
        section_heading_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10.5,
            leading=13,
            textColor=colors.HexColor('#000000'),
            spaceBefore=12,
            spaceAfter=6
        )
        
        label_style = ParagraphStyle(
            'LabelStyle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9.5,
            leading=12,
            textColor=colors.HexColor('#111111')
        )
        
        value_style = ParagraphStyle(
            'ValueStyle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=9.5,
            leading=12,
            textColor=colors.HexColor('#0f172a')
        )

        # Header (Logo & Univ Address)
        logo_path = os.path.join(os.path.dirname(__file__), 'logo.png')
        logo_img = None
        if os.path.exists(logo_path):
            try:
                logo_img = Image(logo_path, width=1.6 * cm, height=1.6 * cm)
            except Exception as e:
                print(f"Error loading header logo: {e}")

        title_text = "PRECIOUS CORNERSTONE UNIVERSITY"
        address_text = (
            "Garden of Victory, Olaogun Street, Old Ife Road,<br/>"
            "P.M.B. 60, Agodi Post Office, Ibadan, Oyo State.<br/>"
            "A Tertiary Institution of The Sword of The Spirit Ministries"
        )
        
        title_para = Paragraph(title_text, title_style)
        address_para = Paragraph(address_text, address_style)
        
        usable_w = A4[0] - 3.0 * cm
        if logo_img:
            logo_w = 1.8 * cm
            text_w = usable_w - logo_w
            header_table = Table([[logo_img, [title_para, address_para]]], colWidths=[logo_w, text_w])
            header_table.setStyle(TableStyle([
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 0),
                ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                ('TOPPADDING', (0, 0), (-1, -1), 0),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(header_table)
        else:
            story.append(title_para)
            story.append(address_para)
            
        story.append(Spacer(1, 0.1 * cm))
        
        # Form Title
        story.append(Paragraph("PART-TIME APPLICATION FORM", form_title_style))
        
        form_no = app_data.get('form_no', 'N/A') or 'N/A'
        session = app_data.get('session', '') or 'N/A'
        story.append(Paragraph(f"Form No: {form_no}  |  Session: {session}", subtitle_style))
        
        # Background Section
        story.append(Paragraph("<b>PERSONAL DETAILS</b>", section_heading_style))
        
        full_name = form.get('full_name', '') or ' '.join(filter(None, [form.get('first_name', ''), form.get('middle_name', ''), form.get('surname', '').upper()]))
        dob_str = form.get('date_of_birth', 'N/A') or 'N/A'
        gender = form.get('gender', 'N/A') or 'N/A'
        address = form.get('address', 'N/A') or 'N/A'
        phone = form.get('phone_number', 'N/A') or 'N/A'
        email = form.get('email', 'N/A') or 'N/A'
        marital = form.get('marital_status', 'N/A') or 'N/A'
        state = form.get('state_of_origin', form.get('state', 'N/A')) or 'N/A'

        personal_data = [
            ("Full Name", full_name),
            ("Date of Birth", dob_str),
            ("Gender", gender.capitalize() if gender else 'N/A'),
            ("Marital Status", marital.capitalize() if marital else 'N/A'),
            ("State of Origin", state),
            ("Address", address),
            ("Phone Number", phone),
            ("Email Address", email)
        ]
        
        personal_rows = []
        for label, val in personal_data:
            lbl_p = Paragraph(label, label_style)
            val_p = Paragraph(val, value_style)
            personal_rows.append([lbl_p, val_p])
            
        personal_table = Table(personal_rows, colWidths=[6.0 * cm, usable_w - 6.0 * cm])
        personal_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(personal_table)
        story.append(Spacer(1, 0.3 * cm))
        
        # Proposed Programme
        story.append(Paragraph("<b>PROPOSED PROGRAMME OF STUDY</b>", section_heading_style))
        degree_view = f"{degree_name} ({degree_code})" if degree_code else degree_name
        prog_data = [
            ("Faculty", faculty_name or 'N/A'),
            ("Degree in View", degree_view or 'N/A'),
            ("Proposed Course", course_name or 'N/A'),
            ("Mode of Study", form.get('mode_of_study', 'Part-Time') or 'Part-Time')
        ]
        prog_rows = []
        for label, val in prog_data:
            lbl_p = Paragraph(label, label_style)
            val_p = Paragraph(val, value_style)
            prog_rows.append([lbl_p, val_p])
            
        prog_table = Table(prog_rows, colWidths=[6.0 * cm, usable_w - 6.0 * cm])
        prog_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(prog_table)
        story.append(Spacer(1, 0.3 * cm))
        
        # Academic & Sponsor details
        story.append(Paragraph("<b>ACADEMIC BACKGROUND & SPONSOR</b>", section_heading_style))
        prev_inst = form.get('previous_institution', 'N/A') or 'N/A'
        prev_course = form.get('previous_course', 'N/A') or 'N/A'
        entry_mode = form.get('entry_mode', form.get('mode_of_entry', 'N/A')) or 'N/A'
        sponsor_name = form.get('sponsor_name', 'N/A') or 'N/A'
        sponsor_addr = form.get('sponsor_address', 'N/A') or 'N/A'
        nok_name = form.get('next_of_kin_name', 'N/A') or 'N/A'
        nok_addr = form.get('next_of_kin_address', 'N/A') or 'N/A'
        nok_phone = form.get('next_of_kin_phone_number', 'N/A') or 'N/A'

        academic_sponsor_data = [
            ("Previous Institution", prev_inst),
            ("Course of Study", prev_course),
            ("Entry Mode", entry_mode),
            ("Sponsor Name", sponsor_name),
            ("Sponsor Address", sponsor_addr),
            ("Next of Kin Name", nok_name),
            ("Next of Kin Address", nok_addr),
            ("Next of Kin Phone Number", nok_phone)
        ]
        
        acad_rows = []
        for label, val in academic_sponsor_data:
            lbl_p = Paragraph(label, label_style)
            val_p = Paragraph(val, value_style)
            acad_rows.append([lbl_p, val_p])
            
        acad_table = Table(acad_rows, colWidths=[6.0 * cm, usable_w - 6.0 * cm])
        acad_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(acad_table)
        story.append(Spacer(1, 0.4 * cm))

        # Signatures
        sig_flowable = None
        if signature_b64:
            try:
                if ',' in signature_b64:
                    signature_b64 = signature_b64.split(',')[1]
                img_bytes = base64.b64decode(signature_b64)
                sig_buf = io.BytesIO(img_bytes)
                sig_flowable = Image(sig_buf, width=2.5 * cm, height=0.8 * cm)
                sig_flowable.hAlign = 'LEFT'
            except Exception as e:
                print(f"Error decoding signature image: {e}")
                
        if not sig_flowable:
            sig_flowable = Paragraph("___________________________", value_style)
            
        current_date_str = datetime.now().strftime('%d %B, %Y')
        
        sig_table_data = [
            [
                Paragraph("Student's Signature:", label_style),
                sig_flowable,
                Paragraph(f"Date: <b>{current_date_str}</b>", label_style)
            ]
        ]
        
        sig_table = Table(sig_table_data, colWidths=[4.5 * cm, 6.0 * cm, usable_w - 10.5 * cm])
        sig_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(sig_table)

        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
