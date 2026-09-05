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
from user_agents import parse
from fastapi.responses import StreamingResponse
from backend import crud
from backend import utils
from fastapi import HTTPException

def process_shorten_url(original_url: str, base_url: str, custom_alias: str = None):
    """Gera o link curto, respeitando o apelido personalizado se fornecido."""
    
    if custom_alias:
        # REGRA 1: Usuário quer um apelido personalizado
        if crud.check_code_exists(custom_alias):
            raise HTTPException(status_code=400, detail="Este apelido já está em uso. Tente outro.")
        
        short_code = custom_alias
        crud.create_url(original_url, short_code)
        
    else:
        # REGRA 2: Usuário não mandou apelido (Fluxo Normal)
        short_code = crud.get_url_by_original(original_url)
        if not short_code:
            short_code = utils.generate_short_code()
            crud.create_url(original_url, short_code)
            
    short_url = f"{base_url}{short_code}"
    qr_data_uri = utils.generate_qr_base64(short_url)
    
    return {
        "short_url": short_url,
        "qr_code": qr_data_uri
    }

def process_redirect(short_code: str, user_agent_string: str):
    original_url = crud.get_url_by_code(short_code)
    if not original_url:
        return None
        
    user_agent = parse(user_agent_string)
    
    # 1. Detecta Dispositivo
    if user_agent.is_mobile:
        device_type = "Mobile"
    elif user_agent.is_tablet:
        device_type = "Tablet"
    else:
        device_type = "Desktop"
        
    # 2. Detecta OS e Navegador
    os_name = user_agent.os.family
    browser_name = user_agent.browser.family
        
    # 3. Salva no banco com os novos dados
    crud.register_click(short_code, device_type, os_name, browser_name)
    return original_url

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