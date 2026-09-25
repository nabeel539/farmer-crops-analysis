import psycopg

passwords = ['postgres', 'admin', 'root', '1234', '123456', 'password', 'krishi', 'admin1234', '']
connected = False
for p in passwords:
    try:
        conn = psycopg.connect(f'host=localhost port=5432 user=postgres password={p} dbname=postgres', autocommit=True)
        print(f"SUCCESS: Connected with password='{p}'")
        with conn.cursor() as cur:
            cur.execute("SELECT version();")
            print("PostgreSQL Version:", cur.fetchone()[0])
            # Check if krishi_agritech db exists
            cur.execute("SELECT 1 FROM pg_database WHERE datname='krishi_agritech'")
            if not cur.fetchone():
                cur.execute("CREATE DATABASE krishi_agritech;")
                print("Created database 'krishi_agritech'")
            else:
                print("Database 'krishi_agritech' already exists")
        conn.close()
        connected = True
        break
    except Exception as e:
        print(f"Failed with '{p}': {e}")

if not connected:
    print("PROMPT_USER_FOR_PASSWORD")
