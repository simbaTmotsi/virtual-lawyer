"""
Update the Gemini API key with a proper value
"""
import os
import sqlite3
import sys
from pathlib import Path
from dotenv import load_dotenv

def update_gemini_api_key():
    # Load environment variables from .env file
    load_dotenv()
    
    # Get the API key from environment variable
    api_key = os.environ.get('GEMINI_API_KEY')
    
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables.")
        print("Please set this in your .env file or environment.")
        return
    
    # Define the database path
    project_root = Path(__file__).resolve().parent.parent.parent.parent
    db_path = project_root / "backend" / "db.sqlite3"
    
    print(f"Connecting to database at: {db_path}")
    
    try:
        # Connect to the SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Update the gemini_api_key entry with the real key
        # Note: Normally we would encrypt it, but for now we'll store directly
        print("Updating Gemini API key in database...")
        cursor.execute('''
        UPDATE admin_portal_apikeystorage 
        SET encrypted_key = ? 
        WHERE key_name = 'gemini_api_key'
        ''', (api_key,))
        
        # Commit the changes and close the connection
        conn.commit()
        conn.close()
        
        print("Gemini API key updated successfully.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_gemini_api_key()
