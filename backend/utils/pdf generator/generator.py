from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib import colors
import os
import pandas as pd
from jinja2 import Environment, FileSystemLoader
from xhtml2pdf import pisa
from datetime import datetime
import traceback
import base64
import re
def convert_html_to_pdf(source_html, output_filename):
    with open(output_filename, "w+b") as result_file:
        pisa_status = pisa.CreatePDF(source_html, dest=result_file)
    return pisa_status.err

def extract_candidates_from_pdf(pdf_path):
    print(f"📄 Extracting candidates from PDF: {pdf_path}")
    import fitz  # PyMuPDF
    
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text("text") + "\n"
        
    candidates = []
    # Match lines starting with a number, a dot, space, and then names
    pattern = re.compile(r'^\s*\d+\.\s+(.+)$', re.MULTILINE)
    
    for match in pattern.finditer(text):
        full_name_str = match.group(1).strip()
        parts = full_name_str.split()
        if not parts:
            continue
            
        lastname = parts[0]
        firstname = parts[1] if len(parts) > 1 else ""
        middlename = " ".join(parts[2:]) if len(parts) > 2 else ""
        
        candidates.append({
            'lastname': lastname,
            'firstname': firstname,
            'middlename': middlename
        })
        
    df = pd.DataFrame(candidates)
    return df

def generate_letters(input_path, output_dir="output"):

    if not os.path.exists(input_path):
        print(f"❌ Error: Could not find '{input_path}' in the directory!")
        return
        
    os.makedirs(output_dir, exist_ok=True)
        
    # Read the data
    try:
        if input_path.lower().endswith('.csv'):
            df = pd.read_csv(input_path)
        elif input_path.lower().endswith('.xlsx') or input_path.lower().endswith('.xls'):
            df = pd.read_excel(input_path)
        elif input_path.lower().endswith('.pdf'):
            df = extract_candidates_from_pdf(input_path)
        else:
            print("❌ Unsupported file format.")
            return
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return
        
    if df is None or df.empty:
        print("❌ No candidates found in the file!")
        return
        
    print(f"📊 Found {len(df)} candidates. Preparing to generate PDFs...")

    # Load Jinja template
    try:
        env = Environment(loader=FileSystemLoader('.'))
        template = env.get_template('template.html')
    except Exception as e:
        print(f"❌ Error loading template.html: {e}")
        return
        
    date_str = "3 February, 2026"
    success_count = 0
    error_count = 0

    # Load the signature image as base64 string
    base64_sig = ""
    try:
        with open("signature.png", "rb") as sig_file:
            base64_sig = base64.b64encode(sig_file.read()).decode('utf-8')
    except Exception as e:
        print(f"⚠️ Could not load signature image: {e}")

    # Load the logo image as base64 string
    base64_logo = ""
    try:
        with open("logo.png", "rb") as logo_file:
            base64_logo = base64.b64encode(logo_file.read()).decode('utf-8')
    except Exception as e:
        print(f"⚠️ Could not load logo image: {e}")

    # Helper function to find column names safely (case insensitive)
    def get_col(candidates, possible_names):
        for col in candidates.columns:
            if str(col).strip().lower().replace(" ", "").replace("_", "") in possible_names:
                return col
        return None

    first_col = get_col(df, ['firstname', 'first', 'givenname'])
    middle_col = get_col(df, ['middlename', 'middle'])
    last_col = get_col(df, ['lastname', 'last', 'surname'])

    # Loop through the list of candidates
    for index, row in df.iterrows():
        try:
            # Build full name dynamically based on available columns
            name_parts = []
            if last_col and pd.notna(row[last_col]): name_parts.append(str(row[last_col]).strip().upper())
            if first_col and pd.notna(row[first_col]): name_parts.append(str(row[first_col]).strip().title())
            if middle_col and pd.notna(row[middle_col]): name_parts.append(str(row[middle_col]).strip().title())
            
            # Fallback to 'Name' if strict extraction fails
            if not name_parts:
                name_col = get_col(df, ['name', 'fullname', 'candidatename'])
                name = row[name_col] if name_col else f"Candidate_{index+1}"
            else:
                # Format exactly like original: "LASTNAME, Firstname Middlename"
                name = name_parts[0]
                if len(name_parts) > 1:
                    name += ", " + " ".join(name_parts[i] for i in range(1, len(name_parts)))

            ref_no = row.get('RefNo', "PCU/ADM/2025")
            email = row.get('Email', '')
            
            # Render the HTML for this candidate
            rendered_html = template.render(
                candidate_name=name,
                ref_number=ref_no,
                date=date_str,
                sig_image=base64_sig,
                logo_image=base64_logo
            )
            
            # Create a clean safe filename
            safe_name = str(name).replace(",", "").replace(" ", "_").strip()
            pdf_filename = f"{safe_name}_AdmissionLetter.pdf"
            pdf_path = os.path.join(output_dir, pdf_filename)
            
            # Convert rendered HTML directly to PDF
            err = convert_html_to_pdf(rendered_html, pdf_path)
            
            if err:
                print(f"⚠️ Error generating PDF for {name}")
                error_count += 1
            else:
                print(f"✅ Generated: {pdf_filename}")
                success_count += 1
                
        except Exception as e:
            print(f"⚠️ Exception processing {name}: {e}")
            traceback.print_exc()
            error_count += 1

    print("-" * 40)
    print(f"🎉 Process completed: {success_count} generated, {error_count} failed.")

if __name__ == "__main__":
    import sys
    print("🚀 Starting PDF Generator Automation...")
    
    # Check if user provided a file argument, e.g., `python generator.py candidates.csv`
    if len(sys.argv) > 1:
        target_file = sys.argv[1]
    else:
        # Prompt the user for the input file
        target_file = input("📄 Please enter the name of the file to process (e.g., candidates_list_7.pdf or candidates.csv): ").strip()
        
    if target_file:
        print(f"👉 Target file selected: {target_file}")
        generate_letters(target_file)
    else:
        print("❌ No filename provided. Exiting.")
