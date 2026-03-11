"""Migration: Update 'admin' role to 'admissions_officer' where applicable."""
import sys
from database import Database

def run(ict_director_email=None):
    if not ict_director_email:
        print("Please provide the ICT Director email as an argument to keep them as 'admin'.")
        print("Usage: python migrate_roles.py director@example.com")
        
        # If no email provided, just list current admins for reference
        admins = Database.execute_query("SELECT email, name FROM users WHERE role = 'admin'")
        print("\nCurrent 'admin' users:")
        for a in admins:
            print(f" - {a['email']} ({a['name']})")
        return

    # 1. Update all other admins to admissions_officer
    count = Database.execute_update(
        "UPDATE users SET role = 'admissions_officer' WHERE role = 'admin' AND email != %s",
        (ict_director_email,)
    )
    
    print(f"\nUpdated {count} user(s) to 'admissions_officer'.")
    print(f"User '{ict_director_email}' remains as 'admin'.")

if __name__ == "__main__":
    email = sys.argv[1] if len(sys.argv) > 1 else None
    run(email)
