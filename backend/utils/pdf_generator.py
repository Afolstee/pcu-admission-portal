import os
import re
import io
import base64
from datetime import datetime
from html.parser import HTMLParser
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors
from bs4 import BeautifulSoup

class HTMLToFlowablesParser:
    """Parse HTML with BeautifulSoup and convert to ReportLab Flowables"""
    
    def __init__(self):
        self.flowables = []
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
        
    def _setup_custom_styles(self):
        """Create custom paragraph styles for different elements"""
        # Header title
        self.styles.add(ParagraphStyle(
            name='HeaderTitle',
            parent=self.styles['Normal'],
            fontSize=18,
            fontName='Times-Bold',
            textColor=colors.black,
            spaceAfter=0,
            alignment=TA_CENTER
        ))
        
        # Header address
        self.styles.add(ParagraphStyle(
            name='HeaderAddress',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Roman',
            textColor=colors.black,
            spaceAfter=2,
            alignment=TA_CENTER,
            leading=12
        ))
        
        # Tertiary message
        self.styles.add(ParagraphStyle(
            name='HeaderTertiary',
            parent=self.styles['Normal'],
            fontSize=10,
            fontName='Times-Italic',
            textColor=colors.black,
            spaceAfter=10,
            alignment=TA_CENTER
        ))
        
        # Office info
        self.styles.add(ParagraphStyle(
            name='OfficeInfo',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Bold',
            textColor=colors.black,
            spaceAfter=4,
            alignment=TA_LEFT
        ))
        
        # Office details
        self.styles.add(ParagraphStyle(
            name='OfficeDetails',
            parent=self.styles['Normal'],
            fontSize=10,
            fontName='Times-Roman',
            textColor=colors.black,
            spaceAfter=2,
            alignment=TA_LEFT,
            leading=12
        ))
        
        # Salutation
        self.styles.add(ParagraphStyle(
            name='Salutation',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Roman',
            textColor=colors.black,
            spaceAfter=10,
            alignment=TA_LEFT
        ))
        
        # Subject
        self.styles.add(ParagraphStyle(
            name='Subject',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Bold',
            textColor=colors.black,
            spaceAfter=12,
            alignment=TA_CENTER,
            leading=13
        ))
        
        # Body
        self.styles.add(ParagraphStyle(
            name='Body',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Roman',
            textColor=colors.black,
            spaceAfter=10,
            alignment=TA_LEFT,
            leading=14
        ))
        
        # List heading
        self.styles.add(ParagraphStyle(
            name='ListHeading',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Bold',
            textColor=colors.black,
            spaceAfter=8,
            alignment=TA_LEFT
        ))
        
        # List item
        self.styles.add(ParagraphStyle(
            name='ListItem',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Roman',
            textColor=colors.black,
            spaceAfter=3,
            alignment=TA_LEFT,
            leftIndent=20,
            leading=13
        ))
        
        # Closing
        self.styles.add(ParagraphStyle(
            name='Closing',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Roman',
            textColor=colors.black,
            spaceAfter=8,
            alignment=TA_LEFT,
            leading=14
        ))
        
        # Signature
        self.styles.add(ParagraphStyle(
            name='Signature',
            parent=self.styles['Normal'],
            fontSize=11,
            fontName='Times-Bold',
            textColor=colors.black,
            spaceAfter=0,
            alignment=TA_LEFT
        ))
    
    def parse(self, html_content: str):
        """Parse HTML content and convert to flowables"""
        soup = BeautifulSoup(html_content, 'html.parser')
        body = soup.find('body')
        
        if body:
            self._parse_element(body)
    
    def _parse_element(self, element):
        """Recursively parse HTML elements"""
        # Handle text nodes
        if isinstance(element, str):
            text = element.strip()
            if text:
                return text
            return None
        
        # Get tag name
        tag_name = element.name if hasattr(element, 'name') else None
        
        if tag_name == 'div':
            class_name = element.get('class', [''])[0] if element.get('class') else ''
            
            if class_name == 'header':
                self._parse_header(element)
            elif class_name == 'office-info':
                text = self._get_element_text(element)
                if text:
                    self.flowables.append(Paragraph(text, self.styles['OfficeInfo']))
            elif class_name == 'office-details':
                self._parse_office_details(element)
            elif class_name == 'ref-date':
                self._parse_ref_date(element)
            elif class_name == 'salutation':
                text = self._get_element_text(element)
                if text:
                    self.flowables.append(Spacer(1, 0.15*inch))
                    self.flowables.append(Paragraph(text, self.styles['Salutation']))
            elif class_name == 'subject':
                text = self._get_element_text(element)
                if text:
                    self.flowables.append(Paragraph(text, self.styles['Subject']))
            elif class_name == 'body':
                self._parse_body_section(element)
            elif class_name == 'closing':
                self._parse_closing(element)
            else:
                # Generic div - might contain sections with headings
                self._parse_generic_div(element)
        
        elif tag_name == 'p':
            text = self._get_element_text(element)
            if text:
                parent_class = element.parent.get('class', [''])[0] if element.parent.get('class') else ''
                if parent_class == 'body':
                    self.flowables.append(Paragraph(text, self.styles['Body']))
                elif parent_class == 'closing':
                    if '<b>' in text or any(child.name == 'b' for child in element.find_all()):
                        self.flowables.append(Paragraph(text, self.styles['Signature']))
                    else:
                        self.flowables.append(Paragraph(text, self.styles['Closing']))
                else:
                    # Check if paragraph is styled as a heading
                    style_attr = element.get('style', '')
                    if 'font-weight: bold' in style_attr:
                        self.flowables.append(Paragraph(text, self.styles['ListHeading']))
                    else:
                        self.flowables.append(Paragraph(text, self.styles['Body']))
        
        elif tag_name == 'ol':
            self._parse_list(element)
        
        elif tag_name is None:
            # Text node - skip if whitespace only
            if str(element).strip():
                pass
        
        else:
            # Other tags - recurse
            if hasattr(element, 'children'):
                for child in element.children:
                    self._parse_element(child)
    
    def _parse_header(self, header_div):
        """Parse header section"""
        logo_div = header_div.find('div', class_='header-logo')
        content_div = header_div.find('div', class_='header-content')
        
        if content_div:
            title = content_div.find('div', class_='header-title')
            if title:
                text = self._get_element_text(title)
                if text:
                    self.flowables.append(Paragraph(text, self.styles['HeaderTitle']))
            
            address = content_div.find('div', class_='header-address')
            if address:
                text = self._get_element_text(address)
                if text:
                    self.flowables.append(Paragraph(text, self.styles['HeaderAddress']))
            
            tertiary = content_div.find('div', class_='header-tertiary')
            if tertiary:
                text = self._get_element_text(tertiary)
                if text:
                    self.flowables.append(Paragraph(text, self.styles['HeaderTertiary']))
    
    def _parse_office_details(self, details_div):
        """Parse office details"""
        for div in details_div.find_all('div', recursive=False):
            text = self._get_element_text(div)
            if text:
                self.flowables.append(Paragraph(text, self.styles['OfficeDetails']))
    
    def _parse_ref_date(self, ref_div):
        """Parse ref/date table"""
        table = ref_div.find('table')
        if table:
            rows = table.find_all('tr')
            for row in rows:
                cells = row.find_all('td')
                if len(cells) == 2:
                    ref_text = self._get_element_text(cells[0])
                    date_text = self._get_element_text(cells[1])
                    
                    ref_para = Paragraph(ref_text if ref_text else '', self.styles['Body'])
                    date_para = Paragraph(date_text if date_text else '', ParagraphStyle(
                        'RefDate',
                        parent=self.styles['Normal'],
                        fontSize=11,
                        fontName='Times-Roman',
                        alignment=TA_RIGHT
                    ))
                    
                    table_data = [[ref_para, date_para]]
                    tbl = Table(table_data, colWidths=[3*inch, 2.5*inch])
                    tbl.setStyle(TableStyle([
                        ('LEFTPADDING', (0, 0), (-1, -1), 0),
                        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
                        ('TOPPADDING', (0, 0), (-1, -1), 0),
                        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
                        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ]))
                    self.flowables.append(tbl)
                    self.flowables.append(Spacer(1, 0.15*inch))
    
    def _parse_generic_div(self, div_element):
        """Parse generic div that may contain mixed content"""
        for child in div_element.children:
            if isinstance(child, str):
                text = child.strip()
                if text:
                    self.flowables.append(Paragraph(text, self.styles['Body']))
            elif hasattr(child, 'name'):
                if child.name == 'p':
                    text = self._get_element_text(child)
                    if text:
                        style_attr = child.get('style', '')
                        if 'font-weight: bold' in style_attr:
                            self.flowables.append(Paragraph(text, self.styles['ListHeading']))
                        else:
                            self.flowables.append(Paragraph(text, self.styles['Body']))
                elif child.name == 'ol' or child.name == 'ul':
                    self._parse_list(child)
                elif child.name == 'div':
                    self._parse_generic_div(child)
    
    def _parse_body_section(self, body_div):
        """Parse body section with paragraphs"""
        for child in body_div.children:
            if hasattr(child, 'name') and child.name == 'p':
                text = self._get_element_text(child)
                if text:
                    self.flowables.append(Paragraph(text, self.styles['Body']))
    
    def _parse_list(self, ol_element):
        """Parse ordered/unordered list"""
        items = ol_element.find_all('li', recursive=False)
        
        for idx, li in enumerate(items, 1):
            text = self._get_element_text(li)
            if text:
                # Use bullet points or numbers
                list_item = f"{idx}. {text}"
                self.flowables.append(Paragraph(list_item, self.styles['ListItem']))
        
        self.flowables.append(Spacer(1, 0.1*inch))
    
    def _parse_closing(self, closing_div):
        """Parse closing section"""
        for p in closing_div.find_all('p', recursive=False):
            text = self._get_element_text(p)
            if text:
                if any(child.name == 'b' for child in p.find_all()):
                    self.flowables.append(Paragraph(text, self.styles['Signature']))
                    self.flowables.append(Spacer(1, 0.05*inch))
                else:
                    self.flowables.append(Paragraph(text, self.styles['Closing']))
    
    def _get_element_text(self, element) -> str:
        """Extract text from element preserving formatting tags"""
        if not element:
            return ""
        
        text_parts = []
        
        for child in element.children:
            if isinstance(child, str):
                text = child.strip()
                if text:
                    text_parts.append(text)
            elif hasattr(child, 'name'):
                if child.name == 'b' or child.name == 'strong':
                    child_text = self._get_element_text(child)
                    text_parts.append(f"<b>{child_text}</b>")
                elif child.name == 'i' or child.name == 'em':
                    child_text = self._get_element_text(child)
                    text_parts.append(f"<i>{child_text}</i>")
                elif child.name == 'br':
                    text_parts.append("<br/>")
                else:
                    child_text = self._get_element_text(child)
                    if child_text:
                        text_parts.append(child_text)
        
        return " ".join(text_parts).strip()

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
        
        # Parse HTML and build flowables
        parser = HTMLToFlowablesParser()
        
        try:
            parser.parse(body_html)
        except Exception as e:
            print(f"[PDF Generator] Error parsing HTML: {str(e)}")
            raise
        
        story = parser.flowables.copy()
        
        # Add footer with generation date
        story.append(Spacer(1, 0.3*inch))
        footer_text = f"Generated on {datetime.now().strftime('%d %B %Y')}"
        footer_style = ParagraphStyle(
            'Footer',
            parent=parser.styles['Normal'],
            fontSize=8,
            textColor=colors.HexColor('#64748b'),
            alignment=TA_CENTER
        )
        story.append(Paragraph(footer_text, footer_style))
        
        # Build PDF
        doc.build(story)
        pdf_buffer.seek(0)
        return pdf_buffer.getvalue()
