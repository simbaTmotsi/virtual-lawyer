import psycopg2

def create_db(username, password, database_name, host, port):
    # Connect just to PostgreSQL with the user loaded from the .ini file
    conn = psycopg2.connect(database='postgres', user=username, password=password, host=host, port=port)
    cur = conn.cursor()

    # "CREATE DATABASE" requires automatic commits
    conn.autocommit = True
    
    try:
        cur.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{database_name}'")
        exists = cur.fetchone()
        if not exists:
            cur.execute(f'CREATE DATABASE {database_name}')
    except Exception as e:
        print(f"Query: {cur.query}")
        cur.close()
        return f"{type(e).__name__}: {e}"
    else:
        # Revert autocommit settings
        conn.autocommit = False
        return f"Successfully created {database_name}."
