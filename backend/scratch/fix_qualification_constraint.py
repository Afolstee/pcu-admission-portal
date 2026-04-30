from database import Database

def fix_constraint():
    try:
        # Drop the existing constraint (we need to find its name, usually it's table_column_check)
        # Or we can just try to drop it by the name Postgres usually gives it
        # Based on the error message it's 'app_personal_info_qualification_type_check'
        
        print("Updating qualification_type check constraint...")
        
        query = """
        ALTER TABLE app_personal_info 
        DROP CONSTRAINT IF EXISTS app_personal_info_qualification_type_check;
        
        ALTER TABLE app_personal_info 
        ADD CONSTRAINT app_personal_info_qualification_type_check 
        CHECK (qualification_type IN ('WAEC', 'NECO', 'GCE', 'NABTEB', 'BSc', 'BA', 'BEng', 'HND', 'OND', 'Other'));
        """
        
        Database.execute_update(query)
        print("Successfully updated constraint.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_constraint()
