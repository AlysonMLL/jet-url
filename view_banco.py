import sqlite3

conn = sqlite3.connect("encurtador.db")
cursor = conn.cursor()

print("--- URLs CADASTRADAS ---")
cursor.execute("SELECT * FROM urls")
for linha in cursor.fetchall():
    print(linha)

print("\n--- CLIQUES REGISTRADOS ---")
cursor.execute("SELECT * FROM clicks")
for linha in cursor.fetchall():
    print(linha)

conn.close()