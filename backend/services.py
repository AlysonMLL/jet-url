"""
O que há aqui:
- process_shorten_url: cria links curtos, valida apelidos e aplica período de validade
- Geração de QR Code personalizado com cores e ícone definidos na requisição
- Reutilização de links existentes quando não há alias ou datas customizadas
- process_redirect: valida a disponibilidade do link antes do redirecionamento
- Classificação do dispositivo, sistema operacional e navegador pelo User-Agent
- Registro de cada clique e retorno da URL original para o redirecionamento
- get_url_stats: consulta as métricas de acesso de um código curto
- generate_csv_export: monta um CSV em memória e devolve uma resposta para download

Função do arquivo: Centralizar a lógica de negócios e o processamento dos dados da
aplicação. Ele faz a ponte entre as rotas do FastAPI (main.py), o acesso ao banco de
dados (crud.py) e os utilitários de QR Code (utils.py). Também concentra as regras de
criação e reutilização de links, validação de início e expiração, análise de acessos,
tratamento de erros HTTP e preparação da exportação das métricas.
"""


import io
import csv
from datetime import datetime, timezone
from user_agents import parse
from fastapi.responses import StreamingResponse
from backend import crud
from backend import utils
from fastapi import HTTPException

def process_shorten_url(original_url: str, base_url: str, custom_alias: str = None, starts_at: datetime = None, expires_at: datetime = None, qr_fill: str = "#000000", qr_back: str = "#FFFFFF", icon: str = ""):  
    """Gera o link curto com suporte a apelido e tempo de validade."""
    
    if custom_alias:
        if crud.check_code_exists(custom_alias):
            raise HTTPException(status_code=400, detail="Este apelido já está em uso. Tente outro.")
        short_code = custom_alias
        crud.create_url(original_url, short_code, starts_at, expires_at)
        
    else:
        # Se o usuário definir datas customizadas, forçamos a criação de um link NOVO.
        # Caso contrário, tenta reaproveitar um link antigo.
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
        # Repassando o icon para o gerador no momento de retornar o objeto final:
        "qr_code": utils.generate_qr_base64(short_url, fill_color=qr_fill, back_color=qr_back, icon_name=icon)
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