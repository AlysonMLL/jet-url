import sqlite3
import random
import string
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse
from user_agents import parse

app = FastAPI()

def init_db():
    conn = sqlite3.connect("encurtador.db")
    cursor = conn.cursor()
    # Tabela de URLs
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS urls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            original_url TEXT NOT NULL,
            short_code TEXT NOT NULL UNIQUE
        )
    """)
    # Tabela de Cliques (Rastreamento)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            short_code TEXT NOT NULL,
            device_type TEXT NOT NULL,
            FOREIGN KEY(short_code) REFERENCES urls(short_code)
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.get("/")
async def root():
    return {"mensagem": "Bem-vindo ao Encurtador de URLs Premium! Acesse /docs para testar a API."}


### == Função para gerar um código curto único ==============

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@app.post("/shorten")
async def shorten_url(original_url: str):
    short_code = generate_short_code()
    
    conn = sqlite3.connect("encurtador.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO urls (original_url, short_code) VALUES (?, ?)", (original_url, short_code))
    conn.commit()
    conn.close()
    
    # Em produção, você trocaria localhost pelo seu domínio
    return {"short_url": f"http://localhost:8000/{short_code}"}


### == Função para redirecionar e rastrear cliques ==============

@app.get("/{short_code}")
async def redirect(short_code: str, request: Request):
    conn = sqlite3.connect("encurtador.db")
    cursor = conn.cursor()
    
    # 1. Busca a URL original
    cursor.execute("SELECT original_url FROM urls WHERE short_code = ?", (short_code,))
    result = cursor.fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="URL não encontrada")
    
    original_url = result[0]
    
    # 2. Analisa o dispositivo de quem clicou
    user_agent_string = request.headers.get("user-agent", "")
    user_agent = parse(user_agent_string)
    
    if user_agent.is_mobile:
        device_type = "Mobile"
    elif user_agent.is_tablet:
        device_type = "Tablet"
    else:
        device_type = "Desktop"
        
    # 3. Salva o clique e o dispositivo
    cursor.execute("INSERT INTO clicks (short_code, device_type) VALUES (?, ?)", (short_code, device_type))
    conn.commit()
    conn.close()
    
    # 4. Redireciona o usuário
    return RedirectResponse(original_url)

#### == Função para obter estatísticas de cliques ==============

@app.get("/stats/{short_code}")
async def get_stats(short_code: str):
    conn = sqlite3.connect("encurtador.db")
    cursor = conn.cursor()
    
    # Conta total de cliques e agrupa por dispositivo
    cursor.execute("""
        SELECT device_type, COUNT(*) as count 
        FROM clicks 
        WHERE short_code = ? 
        GROUP BY device_type
    """, (short_code,))
    
    stats = cursor.fetchall()
    conn.close()
    
    if not stats:
        return {"mensagem": "Nenhum clique ainda ou link inexistente."}
        
    # Formata a resposta
    resultado = {row[0]: row[1] for row in stats}
    resultado["total_clicks"] = sum(row[1] for row in stats)
    
    return resultado