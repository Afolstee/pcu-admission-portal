from database import Database

def create_master_results():
    sql = """
    CREATE TABLE IF NOT EXISTS master_results (
        uid SERIAL PRIMARY KEY,
        matric_no VARCHAR(50) NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        course_unit INT DEFAULT 3,
        session VARCHAR(50),
        semester VARCHAR(50),
        level VARCHAR(50),
        ca DECIMAL(5,2) DEFAULT 0.00,
        exam DECIMAL(5,2) DEFAULT 0.00,
        total DECIMAL(5,2) DEFAULT 0.00,
        grade VARCHAR(2),
        grade_point DECIMAL(5,2),
        status CHAR(1), -- 'P' for Pass, 'F' for Fail
        program_id INT, -- Will reference programs table if possible
        lecturer_id INT, -- Will reference users table
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    try:
        Database.execute_update(sql)
        print("Table master_results created successfully.")
    except Exception as e:
        print(f"Error creating table: {e}")

if __name__ == "__main__":
    create_master_results()
