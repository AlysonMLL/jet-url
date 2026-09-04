"""
O que há aqui:
- get_url_by_original(original_url)
- get_url_by_code(short_code)
- create_url(original_url, short_code)
- register_click(short_code, device_type)
- get_clicks_stats(short_code)
- get_all_export_data()

Função do arquivo: Camada de persistência (Data Access Object). 
Isola todas as queries SQL (SELECT, INSERT) do resto da aplicação.
"""
from backend.database import get_connection

def get_url_by_original(original_url: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT short_code FROM urls WHERE original_url = %s", (original_url,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def get_url_by_code(short_code: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT original_url FROM urls WHERE short_code = %s", (short_code,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def create_url(original_url: str, short_code: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO urls (original_url, short_code) VALUES (%s, %s)", (original_url, short_code))
    conn.commit()
    conn.close()

def register_click(short_code: str, device_type: str, os_name: str, browser_name: str):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO clicks (short_code, device_type, os_name, browser_name) 
        VALUES (%s, %s, %s, %s)
    """, (short_code, device_type, os_name, browser_name))
    conn.commit()
    conn.close()

def get_clicks_stats(short_code: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Agrupa por Dispositivo
    cursor.execute("SELECT device_type, COUNT(*) FROM clicks WHERE short_code = %s GROUP BY device_type", (short_code,))
    devices = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Agrupa por Sistema Operacional
    cursor.execute("SELECT os_name, COUNT(*) FROM clicks WHERE short_code = %s GROUP BY os_name", (short_code,))
    os_stats = {row[0]: row[1] for row in cursor.fetchall()}
    
    # Agrupa por Navegador
    cursor.execute("SELECT browser_name, COUNT(*) FROM clicks WHERE short_code = %s GROUP BY browser_name", (short_code,))
    browsers = {row[0]: row[1] for row in cursor.fetchall()}
    
    conn.close()
    
    # Se não houver cliques, devices estará vazio
    if not devices:
        return None
        
    return {
        "total_clicks": sum(devices.values()),
        "devices": devices,
        "os": os_stats,
        "browsers": browsers
    }

def get_all_export_data():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT c.id, c.short_code, u.original_url, c.device_type 
        FROM clicks c
        JOIN urls u ON c.short_code = u.short_code
    """)
    dados = cursor.fetchall()
    conn.close()
    return dados