"""
O que há aqui:
- Carregamento das variáveis de ambiente a partir do arquivo .env
- get_connection(): abre uma conexão com o PostgreSQL usando DATABASE_URL
- Validação da existência da configuração obrigatória do banco de dados
- init_db(): inicializa o esquema mínimo da aplicação durante a inicialização do servidor
- Criação da tabela urls para armazenar URLs originais e códigos curtos únicos
- Criação da tabela clicks para registrar dispositivo, sistema operacional e navegador
- Confirmação das alterações e encerramento da conexão após a criação das tabelas

Função do arquivo: Centralizar a configuração e o acesso inicial ao banco de dados
da aplicação. Ele fornece conexões PostgreSQL para as camadas que executam operações
de persistência e garante que as tabelas necessárias para links e métricas existam
quando o servidor iniciar. As consultas e regras de manipulação dos registros ficam
delegadas ao módulo crud.py, enquanto este arquivo cuida da conexão, configuração
do ambiente e preparação do esquema.
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