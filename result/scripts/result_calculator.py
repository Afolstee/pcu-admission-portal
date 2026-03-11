from fpdf import FPDF
from datetime import datetime


def score_to_point(score):
    if 0 <= score <= 39:
        return 0
    elif 40 <= score <= 44:
        return 1
    elif 45 <= score <= 49:
        return 2
    elif 50 <= score <= 59:
        return 3
    elif 60 <= score <= 69:
        return 4
    elif 70 <= score <= 100:
        return 5
    else:
        return None


def get_student_info():
    """Collect student information"""
    print("\n" + "="*60)
    print("PRECIOUS CORNERSTONE UNIVERSITY")
    print("Result Calculator System")
    print("="*60 + "\n")
    
    name = input("Enter candidate's name: ").strip()
    return name


def get_courses():
    courses = []
    print("\n" + "-"*60)
    print("COURSE ENTRY")
    print("-"*60)
    print("Enter course details (leave course code empty to finish)")
    
    while True:
        print(f"\n--- Course {len(courses) + 1} ---")
        course_code = input("Course Code (e.g., CYB101): ").strip().upper()
        
        if not course_code:
            if len(courses) == 0:
                print("Please enter at least one course!")
                continue
            break
        
        # Get unit
        while True:
            try:
                unit = int(input("Course Unit (1, 2, 3, etc.): "))
                if unit <= 0:
                    print("Unit must be positive!")
                    continue
                break
            except ValueError:
                print("Please enter a valid number!")
        
        # Get score
        while True:
            try:
                score = float(input("Score (0-100): "))
                if score < 0 or score > 100:
                    print("Score must be between 0 and 100!")
                    continue
                break
            except ValueError:
                print("Please enter a valid number!")
        
        # Convert to grade point
        grade_point = score_to_point(score)
        
        courses.append({
            'code': course_code,
            'unit': unit,
            'score': score,
            'grade_point': grade_point
        })
        
        print(f"✓ Added: {course_code} | {unit} unit(s) | Score: {score} | Grade Point: {grade_point}")
    
    return courses


def calculate_results(courses):
    total_units = 0
    total_wgp = 0
    
    for course in courses:
        wgp = course['unit'] * course['grade_point']
        course['wgp'] = wgp
        total_units += course['unit']
        total_wgp += wgp
    
    cgpa = total_wgp / total_units if total_units > 0 else 0
    
    return {
        'tur': total_units,
        'total_wgp': total_wgp,
        'cgpa': cgpa
    }


def display_results(name, courses, results):
    print("\n" + "="*60)
    print("RESULT SUMMARY")
    print("="*60)
    print(f"Institution: Precious Cornerstone University")
    print(f"Candidate: {name}")
    print("-"*60)
    print(f"{'Course Code':<12} {'Unit':<6} {'Score':<8} {'Grade Point':<12} {'WGP':<6}")
    print("-"*60)
    
    for course in courses:
        print(f"{course['code']:<12} {course['unit']:<6} {course['score']:<8.1f} {course['grade_point']:<12} {course['wgp']:<6}")
    
    print("-"*60)
    print(f"Total Units Registered: {results['tur']}")
    print(f"Total Weighted Grade Points: {results['total_wgp']}")
    print(f"\n*** CGPA: {results['cgpa']:.2f} ***")
    print("="*60)


def generate_pdf(name, courses, results, filename):
    pdf = FPDF()
    pdf.add_page()
    
    # Header
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'PRECIOUS CORNERSTONE UNIVERSITY', 0, 1, 'C')
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 8, 'Student Result Report', 0, 1, 'C')
    pdf.ln(5)
    
    # Student Info
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(40, 8, 'Candidate:', 0, 0)
    pdf.set_font('Arial', '', 11)
    pdf.cell(0, 8, name, 0, 1)
    pdf.ln(5)
    
    # Table Header
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(40, 8, 'Course Code', 1, 0, 'C')
    pdf.cell(20, 8, 'Unit', 1, 0, 'C')
    pdf.cell(25, 8, 'Score', 1, 0, 'C')
    pdf.cell(30, 8, 'Score Point', 1, 0, 'C')
    pdf.cell(25, 8, 'WGP', 1, 1, 'C')
    
    # Table Content
    pdf.set_font('Arial', '', 10)
    for course in courses:
        pdf.cell(40, 8, course['code'], 1, 0, 'C')
        pdf.cell(20, 8, str(course['unit']), 1, 0, 'C')
        pdf.cell(25, 8, f"{course['score']:.1f}", 1, 0, 'C')
        pdf.cell(30, 8, str(course['grade_point']), 1, 0, 'C')
        pdf.cell(25, 8, str(course['wgp']), 1, 1, 'C')
    
    pdf.ln(5)
    
    # Summary
    pdf.set_font('Arial', 'B', 11)
    pdf.cell(0, 8, f"Total Units Registered: {results['tur']}", 0, 1)
    pdf.cell(0, 8, f"Total Weighted Grade Points: {results['total_wgp']}", 0, 1)
    pdf.ln(2)
    
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, f"CGPA: {results['cgpa']:.2f}", 0, 1)
    pdf.ln(5)
    
    # For Grading Scale
    pdf.set_font('Arial', 'B', 10)
    pdf.cell(0, 8, 'Grading Scale:', 0, 1)
    pdf.set_font('Arial', '', 9)
    pdf.cell(0, 6, '0-39 = 0 point', 0, 1)
    pdf.cell(0, 6, '40-44 = 1 point', 0, 1)
    pdf.cell(0, 6, '45-49 = 2 points', 0, 1)
    pdf.cell(0, 6, '50-59 = 3 points', 0, 1)
    pdf.cell(0, 6, '60-69 = 4 points', 0, 1)
    pdf.cell(0, 6, '70-100 = 5 points', 0, 1)
    
    # Save PDF
    pdf.output(filename)
    print(f"\n✓ PDF generated successfully: {filename}")


def main():
    
    name = get_student_info()

    courses = get_courses()

    results = calculate_results(courses)

    display_results(name, courses, results)
    

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"result_{name.replace(' ', '_')}_{timestamp}.pdf"
    generate_pdf(name, courses, results, filename)
    
    print("\nThank you for using Precious Cornerstone University Result Calculator!")


if __name__ == "__main__":
    main()
