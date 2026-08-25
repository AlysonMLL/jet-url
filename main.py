import sqlite3
import random
import string
import qrcode
import io
import base64
from pydantic import HttpUrl
from fastapi.responses import StreamingResponse
import csv
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import RedirectResponse, FileResponse
from user_agents import parse



app = FastAPI()

from fastapi.staticfiles import StaticFiles

app.mount("/public", StaticFiles(directory="public"), name="public")

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
    return FileResponse("index.html")


### == Função para gerar um código curto único ==============

def generate_short_code(length=6):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

@app.post("/shorten")
async def shorten_url(original_url: HttpUrl, request: Request):
    url_str = str(original_url)
    
    conn = sqlite3.connect("encurtador.db")
    cursor = conn.cursor()
    
    # REGRA DE NEGÓCIO: Verifica se a URL já existe no banco
    cursor.execute("SELECT short_code FROM urls WHERE original_url = ?", (url_str,))
    resultado = cursor.fetchone()
    
    if resultado:
        # Se já existe, reaproveita o código curto salvo
        short_code = resultado[0]
    else:
        # Se não existe, gera um novo e salva
        short_code = generate_short_code()
        cursor.execute("INSERT INTO urls (original_url, short_code) VALUES (?, ?)", (url_str, short_code))
        conn.commit()
        
    conn.close()
    
    # 1. Captura o domínio real de forma dinâmica
    base_url = str(request.base_url)
    short_url = f"{base_url}{short_code}"
    
    # 2. Gera o QR Code em memória
    qr = qrcode.make(short_url)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    
    # 3. Converte a imagem para Base64
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    qr_data_uri = f"data:image/png;base64,{qr_base64}"
    
    return {
        "short_url": short_url,
        "qr_code": qr_data_uri
    }


### == Função para redirecionar e rastrear cliques ==============

@app.post("/shorten")
async def shorten_url(original_url: str, request: Request):
    short_code = generate_short_code()
    
    conn = sqlite3.connect("encurtador.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO urls (original_url, short_code) VALUES (?, ?)", (original_url, short_code))
    conn.commit()
    conn.close()
    
    
    short_url = f"{request.base_url}{short_code}"
    
    # Gera o QR Code em memória com a URL dinâmica
    qr = qrcode.make(short_url)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    qr_data_uri = f"data:image/png;base64,{qr_base64}"
    
    return {
        "short_url": short_url,
        "qr_code": qr_data_uri
    }
    
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

# uvicorn main:app --reload 

@app.get("/exportar-dados")
async def export_data():
    conn = sqlite3.connect("encurtador.db")
    cursor = conn.cursor()
    
    # Relaciona a tabela de cliques com a de URLs para termos o dado completo
    cursor.execute("""
        SELECT c.id, c.short_code, u.original_url, c.device_type 
        FROM clicks c
        JOIN urls u ON c.short_code = u.short_code
    """)
    dados = cursor.fetchall()
    conn.close()
    
    # Escreve o CSV diretamente na memória RAM (super rápido)
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["ID_Clique", "Codigo_Curto", "URL_Original", "Dispositivo"])
    writer.writerows(dados)
    
    # Volta o cursor da memória para o começo para o FastAPI conseguir ler
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=metricas_jeturl.csv"}
    )