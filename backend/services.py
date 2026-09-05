"""
O que há aqui:
- process_shorten_url(original_url, base_url)
- process_redirect(short_code, user_agent_string)
- get_url_stats(short_code)
- generate_csv_export()

Função do arquivo: Lógica de Negócios e Micro-ETL. Faz a ponte entre 
as rotas do FastAPI (main.py) e o banco de dados (crud.py).
"""
import io
import csv
from datetime import datetime, timezone
from user_agents import parse
from fastapi.responses import StreamingResponse
from backend import crud
from backend import utils
from fastapi import HTTPException

def process_shorten_url(original_url: str, base_url: str, custom_alias: str = None, starts_at: datetime = None, expires_at: datetime = None):
    """Gera o link curto com suporte a apelido e tempo de validade."""
    
    if custom_alias:
        if crud.check_code_exists(custom_alias):
            raise HTTPException(status_code=400, detail="Este apelido já está em uso. Tente outro.")
        short_code = custom_alias
        crud.create_url(original_url, short_code, starts_at, expires_at)
        
    else:
        # Se o usuário definir datas customizadas, forçamos a criação de um link NOVO.
        # Caso contrário, tentamos reaproveitar um link antigo.
        if starts_at or expires_at:
            short_code = None
        else:
            short_code = crud.get_url_by_original(original_url)
            
        if not short_code:
            short_code = utils.generate_short_code()
            crud.create_url(original_url, short_code, starts_at, expires_at)
            
    short_url = f"{base_url}{short_code}"
    return {
        "short_url": short_url,
        "qr_code": utils.generate_qr_base64(short_url)
    }

def process_redirect(short_code: str, user_agent_string: str):
    """Valida o Tempo antes de redirecionar e registrar o clique."""
    url_data = crud.get_url_by_code(short_code)
    if not url_data:
        return None
        
    # --- VALIDAÇÃO DE TEMPO ---
    now = datetime.now(timezone.utc)
    
    if url_data["starts_at"] and now < url_data["starts_at"]:
        raise HTTPException(status_code=403, detail="Este link ainda não está ativo. Volte mais tarde.")
        
    if url_data["expires_at"] and now > url_data["expires_at"]:
        raise HTTPException(status_code=410, detail="Este link expirou e não está mais disponível.")
    # --------------------------
        
    user_agent = parse(user_agent_string)
    
    if user_agent.is_mobile: device_type = "Mobile"
    elif user_agent.is_tablet: device_type = "Tablet"
    else: device_type = "Desktop"
        
    crud.register_click(short_code, device_type, user_agent.os.family, user_agent.browser.family)
    
    return url_data["original_url"]

def get_url_stats(short_code: str):
    stats = crud.get_clicks_stats(short_code)
    if not stats:
        return {"mensagem": "Nenhum clique ainda ou link inexistente."}
    return stats

def generate_csv_export():
    """Gera um arquivo CSV na memória RAM para download."""
    dados = crud.get_all_export_data()
    
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')
    writer.writerow(["ID_Clique", "Codigo_Curto", "URL_Original", "Dispositivo"])
    writer.writerows(dados)
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=metricas_jeturl.csv"}
    )