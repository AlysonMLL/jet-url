"""
O que há aqui:
- get_connection()
- init_db()

Função do arquivo: Gerenciar a conexão com o banco de dados e garantir 
a criação das tabelas no momento em que a aplicação iniciar.
"""
import sqlite3
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
load_dotenv()

def get_connection():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL não encontrada no arquivo .env")
    return psycopg2.connect(db_url)

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # PostgreSQL -> SERIAL é igual ao AUTOINCREMENT do SQLite
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS urls (
            id SERIAL PRIMARY KEY,
            original_url TEXT NOT NULL,
            short_code TEXT NOT NULL UNIQUE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clicks (
            id SERIAL PRIMARY KEY,
            short_code TEXT NOT NULL,
            device_type TEXT NOT NULL,
            os_name TEXT,
            browser_name TEXT,
            FOREIGN KEY(short_code) REFERENCES urls(short_code)
        )
    """)
    conn.commit()
    conn.close()