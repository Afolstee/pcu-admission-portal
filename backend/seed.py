#!/usr/bin/env python

import mysql.connector
from mysql.connector import Error
from utils.auth import hash_password
from config import config
import os
from datetime import datetime

def get_db_connection():
    """Create a database connection"""
    try:
        connection = mysql.connector.connect(
            host=config['default'].MYSQL_HOST,
            user=config['default'].MYSQL_USER,
            password=config['default'].MYSQL_PASSWORD,
            database=config['default'].MYSQL_DB,
            port=config['default'].MYSQL_PORT
        )
        return connection
    except Error as e:
        print(f"Error connecting to database: {e}")
        return None

def seed_database():
    """Seed the database with test data"""
    connection = get_db_connection()
    
    if not connection:
        print("Failed to connect to database")
        return False
    
    cursor = connection.cursor()
    
    try:
        # Clear existing data (optional - comment out if you want to keep data)
        # cursor.execute("DELETE FROM documents")
        # cursor.execute("DELETE FROM applications")
        # cursor.execute("DELETE FROM users")
        
        print("Starting database seeding...")
        
        # Create test admin user
        admin_email = "admin@university.edu"
        admin_password = hash_password("admin123")
        
        cursor.execute(
            """
            INSERT IGNORE INTO users (name, email, password_hash, phone_number, role, created_at)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                "Admin Officer",
                admin_email,
                admin_password,
                "+1234567890",
                "admin",
                datetime.now()
            )
        )
        print(f"✓ Created admin user: {admin_email} (password: admin123)")
        
        # Create test applicant users
        applicants = [
            {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "phone": "+1111111111",
                "password": "password123"
            },
            {
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "phone": "+2222222222",
                "password": "password123"
            },
            {
                "name": "Michael Brown",
                "email": "michael.brown@example.com",
                "phone": "+3333333333",
                "password": "password123"
            }
        ]
        
        for applicant in applicants:
            hashed_pwd = hash_password(applicant["password"])
            cursor.execute(
                """
                INSERT IGNORE INTO users (name, email, password_hash, phone_number, role, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    applicant["name"],
                    applicant["email"],
                    hashed_pwd,
                    applicant["phone"],
                    "applicant",
                    datetime.now()
                )
            )
            print(f"✓ Created applicant: {applicant['email']} (password: {applicant['password']})")
        
        connection.commit()
        print("\n✓ Database seeding completed successfully!")
        print("\n📋 Test Credentials:")
        print("=" * 50)
        print("\nADMIN ACCESS:")
        print(f"  Email: {admin_email}")
        print(f"  Password: admin123")
        print(f"  URL: http://localhost:3000/auth/login")
        print("\nAPPLICANT ACCESS:")
        for applicant in applicants:
            print(f"  Email: {applicant['email']}")
            print(f"  Password: {applicant['password']}")
        print(f"  URL: http://localhost:3000/auth/login")
        print("=" * 50)
        
        return True
        
    except Error as e:
        print(f"Error seeding database: {e}")
        connection.rollback()
        return False
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    seed_database()
