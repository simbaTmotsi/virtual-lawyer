import sqlite3
import argparse
from pathlib import Path
import sys

def main():
    parser = argparse.ArgumentParser(description="Write an encrypted API key to the SQLite database.")
    parser.add_argument("key_name", type=str, help="The name of the API key.")
    parser.add_argument("encrypted_key_value", type=str, help="The encrypted value of the API key.")
    args = parser.parse_args()

    key_name = args.key_name
    encrypted_key_value = args.encrypted_key_value

    try:
        # Determine the database path relative to this script
        # api/write_sqlite_key.py -> script_dir is api/
        # parent is the root project directory
        # then construct path to backend/db.sqlite3
        script_path = Path(__file__).resolve()
        db_path = script_path.parent.parent / "backend" / "db.sqlite3"

        if not db_path.exists():
            print(f"Error: Database file not found at {db_path}")
            sys.exit(1)

        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()

        # Check if the key already exists
        cursor.execute("SELECT id FROM admin_portal_apikeystorage WHERE key_name = ?", (key_name,))
        row = cursor.fetchone()

        if row:
            # Key exists, UPDATE it
            cursor.execute(
                "UPDATE admin_portal_apikeystorage SET encrypted_key = ?, is_active = 1 WHERE key_name = ?",
                (encrypted_key_value, key_name)
            )
            conn.commit()
            print(f"Successfully updated API key: {key_name}")
        else:
            # Key does not exist, INSERT it
            cursor.execute(
                "INSERT INTO admin_portal_apikeystorage (key_name, encrypted_key, is_active, created_at, updated_at) VALUES (?, ?, 1, datetime('now'), datetime('now'))",
                (key_name, encrypted_key_value)
            )
            conn.commit()
            print(f"Successfully inserted API key: {key_name}")

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        sys.exit(1)
    finally:
        if 'conn' in locals() and conn:
            conn.close()

if __name__ == "__main__":
    main()
