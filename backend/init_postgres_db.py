import psycopg

password = "Snehanshu@2002"

try:
    conn = psycopg.connect(f"host=localhost port=5432 user=postgres password={password} dbname=postgres", autocommit=True)
    print("SUCCESS: Connected to PostgreSQL successfully!")
    with conn.cursor() as cur:
        cur.execute("SELECT version();")
        print("Version:", cur.fetchone()[0])
        cur.execute("SELECT 1 FROM pg_database WHERE datname='krishi_agritech'")
        if not cur.fetchone():
            cur.execute("CREATE DATABASE krishi_agritech;")
            print("Created database 'krishi_agritech' successfully!")
        else:
            print("Database 'krishi_agritech' already exists.")
    conn.close()
except Exception as e:
    print(f"Connection error: {e}")
