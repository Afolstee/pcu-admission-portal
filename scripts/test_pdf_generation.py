#!/usr/bin/env python3
"""
Test script to verify ReportLab PDF generation setup.
This tests both admission letter and payment receipt PDF generation.
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from backend.utils.pdf_generator import PDFGenerator
from backend.utils.payment_receipt_generator import PaymentReceiptGenerator
from datetime import datetime

def test_admission_letter_pdf():
    """Test admission letter PDF generation"""
    print("[TEST] Generating Admission Letter PDF...")
    try:
        pdf_bytes = PDFGenerator.generate_admission_letter_pdf(
            applicant_name="John Doe",
            program="Computer Science",
            level="100 Level",
            department="Computer Science",
            faculty="Faculty of Science",
            session="2025/2026",
            mode="Full-Time",
            admission_date=datetime.now().strftime('%d %B, %Y'),
            acceptance_fee="₦20,000.00",
            tuition_fee="₦177,000.00",
            other_fees="₦123,000.00",
            resumption_date="September 15, 2025",
            reference="PCU/ADM/2025/0001",
            body_html=""
        )
        
        print(f"  ✓ PDF generated successfully")
        print(f"  ✓ PDF size: {len(pdf_bytes)} bytes")
        
        # Save to file for verification
        output_path = "/tmp/test_admission_letter.pdf"
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
        print(f"  ✓ Saved to: {output_path}")
        
        return True
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_payment_receipt_pdf():
    """Test payment receipt PDF generation"""
    print("[TEST] Generating Payment Receipt PDF...")
    try:
        pdf_bytes = PaymentReceiptGenerator.generate_payment_receipt_pdf(
            receipt_id="RCP-000001",
            applicant_name="Jane Smith",
            program_name="Mass Communication (Part-Time)",
            payment_type="acceptance_fee",
            amount=20000.00,
            payment_date=datetime.now().strftime('%d %B %Y'),
            reference_number="TXN-2025-001",
            payment_method="Remita",
            currency="NGN"
        )
        
        print(f"  ✓ PDF generated successfully")
        print(f"  ✓ PDF size: {len(pdf_bytes)} bytes")
        
        # Save to file for verification
        output_path = "/tmp/test_payment_receipt.pdf"
        with open(output_path, "wb") as f:
            f.write(pdf_bytes)
        print(f"  ✓ Saved to: {output_path}")
        
        return True
    except Exception as e:
        print(f"  ✗ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("\n" + "=" * 60)
    print("PDF GENERATION TEST SUITE")
    print("=" * 60 + "\n")
    
    results = []
    
    # Test 1: Admission Letter
    results.append(("Admission Letter PDF", test_admission_letter_pdf()))
    print()
    
    # Test 2: Payment Receipt
    results.append(("Payment Receipt PDF", test_payment_receipt_pdf()))
    print()
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  [{status}] {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n✓ All PDF generation tests passed!")
        print("✓ ReportLab is properly configured")
        return 0
    else:
        print("\n✗ Some tests failed. Check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
