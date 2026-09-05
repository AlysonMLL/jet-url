"""
O que há aqui:
- Inicialização do FastAPI
- @app.get("/") -> Home
- @app.post("/shorten") -> Cria link curto
- @app.get("/{short_code}") -> Rota de Redirecionamento 
- @app.get("/stats/{short_code}") -> Métricas
- @app.get("/exportar-dados") -> Exportação ETL

Função do arquivo: Ponto de entrada (Entry Point) e roteador da API.
Não contém regras de negócio ou queries SQL.
"""

# uvicorn backend.main:app --reload

from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from pydantic import HttpUrl
from typing import Optional
from datetime import datetime


from backend.database import init_db
from backend import services

app = FastAPI()

# Montando pastas estáticas
app.mount("/public", StaticFiles(directory="public"), name="public")
app.mount("/assets", StaticFiles(directory="src/assets"), name="assets")
app.mount("/frontend", StaticFiles(directory="frontend"), name="frontend")

# Inicia o banco de dados
init_db()

@app.get("/")
async def root():
    return FileResponse("index.html")

@app.post("/shorten")
async def shorten_url(
    original_url: HttpUrl, 
    request: Request, 
    custom_alias: Optional[str] = None,
    starts_at: Optional[datetime] = None,
    expires_at: Optional[datetime] = None
):
    # Rota para CRIAR um link encurtado
    url_str = str(original_url)
    base_url = str(request.base_url)
    
    is_local = "localhost" in base_url or "127.0.0.1" in base_url or "192.168." in base_url
    if not is_local:
        base_url = base_url.replace("http://", "https://")
    
    # Datas para services
    resultado = services.process_shorten_url(url_str, base_url, custom_alias, starts_at, expires_at)
    return resultado

@app.get("/stats/{short_code}")
async def get_stats(short_code: str):
    """Rota para visualizar MÉTRICAS de um link"""
    return services.get_url_stats(short_code)

@app.get("/exportar-dados")
async def export_data():
    """Rota de ETL para exportar banco em CSV"""
    return services.generate_csv_export()

@app.get("/{short_code}")
async def redirect_url(short_code: str, request: Request):
    """Rota para REDIRECIONAR o usuário quando ele acessa o link curto"""
    user_agent = request.headers.get("user-agent", "")
    original_url = services.process_redirect(short_code, user_agent)
    
    if not original_url:
        raise HTTPException(status_code=404, detail="Link não encontrado")
        
    return RedirectResponse(original_url)