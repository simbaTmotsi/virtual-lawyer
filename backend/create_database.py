#!/usr/bin/env python
"""
Database initialization script for EasyLaw.
This script checks if the database exists, and creates it if it doesn't.
"""
import os
import sys
import psycopg2
from psycopg2 import sql
from dotenv import load_dotenv

def create_database():
    """Check if database exists and create it if it doesn't."""
    # Load environment variables
    load_dotenv()
    
    # Get database configuration from environment
    db_name = os.environ.get('DB_NAME', 'easylaw')
    db_user = os.environ.get('DB_USER', 'postgres')
    db_password = os.environ.get('DB_PASSWORD', 'root')
    db_host = os.environ.get('DB_HOST', '127.0.0.1')
    db_port = os.environ.get('DB_PORT', '5432')
    
    # Connect to default PostgreSQL database to check if our DB exists
    try:
        print(f"Connecting to PostgreSQL server at {db_host}:{db_port}...")
        conn = psycopg2.connect(
            dbname='postgres',
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
        )
        conn.autocommit = True  # Required for creating databases
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Database '{db_name}' does not exist. Creating now...")
            # Create the database
            cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(db_name)))
            print(f"Database '{db_name}' created successfully.")
        else:
            print(f"Database '{db_name}' already exists.")
        
        # Close connection
        cursor.close()
        conn.close()
        
        # Now connect to the actual database to create tables if needed
        print(f"Connecting to {db_name} database to check/create tables...")
        try:
            # This will be used in Django migrations, not here
            pass
        except Exception as e:
            print(f"Error connecting to {db_name} database: {e}")
            
    except Exception as e:
        print(f"Error connecting to PostgreSQL server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    create_database()
        
        return True
    except psycopg2.OperationalError as e:
        print(f"Error connecting to PostgreSQL server: {e}")
        return False
    except Exception as e:
        print(f"An error occurred: {e}")
        return False

if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)
