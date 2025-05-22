"""
Create a simple APIKeyStorage table in the SQLite database
"""
import os
import sqlite3
import sys
from pathlib import Path

def create_apikey_storage_table():
    # Define the database path
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    db_path = project_root / "backend" / "db.sqlite3"
    
    print(f"Connecting to database at: {db_path}")
    print(f"Database exists: {db_path.exists()}")
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Create the APIKeyStorage table if it doesn't exist
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS admin_portal_apikeystorage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_name VARCHAR(100) UNIQUE NOT NULL,
            encrypted_key TEXT NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT 1,
            last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        ''')
        
        # Check if the gemini_api_key entry exists
        cursor.execute("SELECT * FROM admin_portal_apikeystorage WHERE key_name = 'gemini_api_key'")
        if not cursor.fetchone():
            # Just insert a placeholder
            print("Adding placeholder for Gemini API key. You'll need to update this with a real key.")
            cursor.execute('''
            INSERT INTO admin_portal_apikeystorage (key_name, encrypted_key, is_active)
            VALUES ('gemini_api_key', 'placeholder_encrypted_key', 1)
            ''')
        
        # Commit the changes and close the connection
        conn.commit()
        conn.close()
        
        print("APIKeyStorage table created successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_apikey_storage_table()
