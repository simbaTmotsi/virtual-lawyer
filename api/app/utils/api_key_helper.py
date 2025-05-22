"""
Helper module for direct API key storage access
This works as a fallback when Django models can't be imported
"""
import sqlite3
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class APIKeyHelper:
    """Class that emulates APIKeyStorage methods but directly uses SQLite"""
    
    @classmethod
    def get_db_path(cls):
        """Get the path to the SQLite database"""
        project_root = Path(__file__).resolve().parent.parent.parent.parent
        return project_root / "backend" / "db.sqlite3"

    @classmethod
    def get_api_key(cls, key_name):
        """
        Get an API key directly from the SQLite database
        """
        db_path = cls.get_db_path()
        
        if not db_path.exists():
            logger.error(f"Database file not found at {db_path}")
            return None
            
        try:
            # Connect to the SQLite database
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Get the API key
            cursor.execute(
                "SELECT encrypted_key FROM admin_portal_apikeystorage WHERE key_name = ? AND is_active = 1", 
                (key_name,)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                # For simplicity, we're directly returning the "encrypted" key
                # In a real system, you would decrypt this value
                return result[0]
            else:
                logger.warning(f"API key '{key_name}' not found in database")
                return None
                
        except Exception as e:
            logger.error(f"Error retrieving API key '{key_name}': {e}")
            return None

    @classmethod
    def store_api_key(cls, key_name, api_key):
        """
        Store an API key directly in the SQLite database
        """
        db_path = cls.get_db_path()
        
        if not api_key:
            return None
        
        try:
            # Connect to the SQLite database
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Check if the key already exists
            cursor.execute("SELECT id FROM admin_portal_apikeystorage WHERE key_name = ?", (key_name,))
            result = cursor.fetchone()
            
            if result:
                # Update the existing key
                cursor.execute(
                    "UPDATE admin_portal_apikeystorage SET encrypted_key = ?, is_active = 1 WHERE key_name = ?",
                    (api_key, key_name)
                )
            else:
                # Insert a new key
                cursor.execute(
                    "INSERT INTO admin_portal_apikeystorage (key_name, encrypted_key, is_active) VALUES (?, ?, 1)",
                    (key_name, api_key)
                )
            
            conn.commit()
            conn.close()
            
            return True
                
        except Exception as e:
            logger.error(f"Error storing API key '{key_name}': {e}")
            return None
