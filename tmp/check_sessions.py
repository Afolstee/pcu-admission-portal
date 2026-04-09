from database import Database

def check_sessions():
    rows = Database.execute_query("SELECT id, session_name FROM academic_sessions")
    if rows:
        print("Academic Sessions in DB:")
        for row in rows:
            print(f"  ID {row['id']}: {row['session_name']}")
    else:
        print("No academic sessions found in DB.")

if __name__ == "__main__":
    check_sessions()
