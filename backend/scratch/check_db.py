import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import Database

def check_schema():
    print("=== schema for documents ===")
    res1 = Database.execute_query("""
        SELECT column_name, data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'documents';
    """)
    for r in res1:
        print(r)
        
    print("\n=== schema for pg_document ===")
    res2 = Database.execute_query("""
        SELECT column_name, data_type, character_maximum_length, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'pg_document';
    """)
    for r in res2:
        print(r)

if __name__ == '__main__':
    check_schema()
