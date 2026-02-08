import MySQLdb
from MySQLdb import cursors
from config import Config
from contextlib import contextmanager

class Database:
    """Handles MySQL database connections"""
    
    @staticmethod
    def get_connection():
        """Create and return a database connection"""
        try:
            connection = MySQLdb.connect(
                host=Config.MYSQL_HOST,
                user=Config.MYSQL_USER,
                passwd=Config.MYSQL_PASSWORD,
                db=Config.MYSQL_DB,
                port=Config.MYSQL_PORT,
                charset='utf8mb4',
                cursorclass=cursors.DictCursor
            )
            return connection
        except MySQLdb.Error as e:
            print(f"Database connection error: {e}")
            return None
    
    @staticmethod
    @contextmanager
    def get_cursor():
        """Context manager for database cursor"""
        connection = Database.get_connection()
        if not connection:
            raise Exception("Failed to connect to database")
        
        cursor = connection.cursor()
        try:
            yield cursor
            connection.commit()
        except Exception as e:
            connection.rollback()
            raise e
        finally:
            cursor.close()
            connection.close()
    
    @staticmethod
    def execute_query(query, params=None):
        """Execute a SELECT query and return results"""
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.fetchall()
        except MySQLdb.Error as e:
            print(f"Query execution error: {e}")
            return None
    
    @staticmethod
    def execute_update(query, params=None):
        """Execute INSERT, UPDATE, or DELETE query"""
        try:
            with Database.get_cursor() as cursor:
                cursor.execute(query, params or ())
                return cursor.lastrowid if cursor.lastrowid else True
        except MySQLdb.Error as e:
            print(f"Update execution error: {e}")
            return False
