import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors


class PaymentReceiptGenerator:
    """Generate payment receipts as PDFs using ReportLab."""

    @staticmethod
    def generate_payment_receipt_pdf(
        receipt_id: str,
        applicant_name: str,
        program_name: str,
        payment_type: str,
        amount: float,
        payment_date: str,
        reference_number: str = "",
        payment_method: str = "Online",
        currency: str = "NGN"
    ) -> bytes:
        """
        Generate a payment receipt PDF.
        
        Args:
            receipt_id: Unique receipt identifier
            applicant_name: Name of the applicant
            program_name: Name of the program
            payment_type: Type of payment (acceptance_fee, tuition)
            amount: Amount paid
            payment_date: Date of payment (string format)
            reference_number: Reference/transaction ID
            payment_method: Method of payment
            currency: Currency code (default: NGN)
        
        Returns:
            bytes: PDF content as bytes
        """
        
        # Create PDF in memory
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=letter,
            rightMargin=0.75 * inch,
            leftMargin=0.75 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch
        )
        
        story = []
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            textColor=colors.HexColor('#1e3a8a'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        header_style = ParagraphStyle(
            'CustomHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=8,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        label_style = ParagraphStyle(
            'Label',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#334155'),
            fontName='Helvetica-Bold',
            spaceAfter=2
        )
        
        value_style = ParagraphStyle(
            'Value',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=8,
            fontName='Helvetica'
        )
        
        # Header
        story.append(Paragraph("PAYMENT RECEIPT", title_style))
        story.append(Spacer(1, 0.2 * inch))
        
        # Receipt info section
        receipt_info_data = [
            ['Receipt ID:', receipt_id],
            ['Date:', payment_date],
            ['Status:', 'COMPLETED']
        ]
        
        receipt_table = Table(receipt_info_data, colWidths=[1.5 * inch, 2.5 * inch])
        receipt_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 9),
            ('FONT', (1, 0), (1, -1), 'Helvetica', 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#334155')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(receipt_table)
        story.append(Spacer(1, 0.15 * inch))
        
        # Divider line
        story.append(Paragraph("_" * 70, label_style))
        story.append(Spacer(1, 0.15 * inch))
        
        # Applicant information
        story.append(Paragraph("APPLICANT INFORMATION", header_style))
        story.append(Spacer(1, 0.1 * inch))
        
        applicant_data = [
            ['Full Name:', applicant_name],
            ['Program:', program_name],
        ]
        
        applicant_table = Table(applicant_data, colWidths=[1.5 * inch, 3.5 * inch])
        applicant_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 9),
            ('FONT', (1, 0), (1, -1), 'Helvetica', 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#334155')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(applicant_table)
        story.append(Spacer(1, 0.15 * inch))
        
        # Payment details
        story.append(Paragraph("PAYMENT DETAILS", header_style))
        story.append(Spacer(1, 0.1 * inch))
        
        # Format payment type
        payment_type_display = payment_type.replace('_', ' ').title()
        currency_symbol = '₦' if currency == 'NGN' else currency
        
        payment_data = [
            ['Payment Type:', payment_type_display],
            ['Amount Paid:', f'{currency_symbol}{amount:,.2f}'],
            ['Currency:', currency],
            ['Payment Method:', payment_method],
            ['Reference Number:', reference_number or 'N/A'],
        ]
        
        payment_table = Table(payment_data, colWidths=[1.5 * inch, 3.5 * inch])
        payment_table.setStyle(TableStyle([
            ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 9),
            ('FONT', (1, 0), (1, -1), 'Helvetica', 9),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#334155')),
            ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#1e293b')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        
        story.append(payment_table)
        story.append(Spacer(1, 0.2 * inch))
        
        # Divider line
        story.append(Paragraph("_" * 70, label_style))
        story.append(Spacer(1, 0.15 * inch))
        
        # Footer message
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#64748b'),
            alignment=TA_CENTER,
            spaceAfter=2
        )
        
        story.append(Paragraph(
            "This is an official payment receipt. Please keep this for your records.",
            footer_style
        ))
        story.append(Spacer(1, 0.05 * inch))
        story.append(Paragraph(
            f"Generated on {datetime.now().strftime('%d %B %Y at %H:%M:%S')}",
            footer_style
        ))
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
