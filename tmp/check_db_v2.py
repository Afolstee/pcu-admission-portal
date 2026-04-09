from database import Database
import json

def check_table(table_name):
    query = """
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = %s
    ORDER BY ordinal_position;
    """
    rows = Database.execute_query(query, (table_name,))
    if rows:
        print(f"Columns for {table_name}:")
        for row in rows:
            print(f"  - {row['column_name']} ({row['data_type']})")
    else:
        print(f"Table {table_name} does not exist.")

if __name__ == "__main__":
    for table in ["student_scores", "pending_results", "master_results", "raw_scores"]:
        check_table(table)
        print("-" * 20)
