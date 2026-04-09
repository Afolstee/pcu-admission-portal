from database import Database

def check_settings():
    rows = Database.execute_query("SELECT key, value FROM system_settings")
    if rows:
        print("System Settings:")
        for row in rows:
            print(f"  {row['key']}: {row['value']}")
    else:
        print("No system settings found.")

if __name__ == "__main__":
    check_settings()
