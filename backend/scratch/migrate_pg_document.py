import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import Database

def migrate():
    print("Migrating pg_document table schema...")
    
    # 1. Drop existing table
    print("Dropping existing pg_document table...")
    drop_ok = Database.execute_update("DROP TABLE IF EXISTS pg_document CASCADE;")
    print(f"Drop table status: {drop_ok}")
    
    # 2. Create table with new schema cloned from documents
    print("Creating new pg_document table...")
    create_sql = """
    CREATE TABLE pg_document (
        id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        pg_application_id   UUID REFERENCES pg_application(uuid) ON DELETE CASCADE,
        document_type       VARCHAR(100) NOT NULL,
        file_name           VARCHAR(255) NOT NULL,
        file_url            VARCHAR(500),
        file_size           INTEGER,
        file_type           VARCHAR(20),
        status              VARCHAR(20) DEFAULT 'pending',
        remark              TEXT,
        created_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at          TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    create_ok = Database.execute_update(create_sql)
    print(f"Create table status: {create_ok}")
    
    # 3. Create index
    print("Creating index for pg_application_id...")
    idx_ok = Database.execute_update("CREATE INDEX IF NOT EXISTS idx_pg_document_application ON pg_document(pg_application_id);")
    print(f"Index creation status: {idx_ok}")
    
    print("Migration finished!")

if __name__ == '__main__':
    migrate()
