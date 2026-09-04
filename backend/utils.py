"""
O que há aqui:
- generate_short_code(length)
- generate_qr_base64(url)

Função do arquivo: Funções auxiliares (Helpers) para geração de strings 
aleatórias e manipulação de imagens (QR Code em memória RAM).
"""
import random
import string
import qrcode
import io
import base64

def generate_short_code(length=6):
    """Gera um código alfanumérico aleatório."""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def generate_qr_base64(url: str) -> str:
    """Gera um QR Code em memória RAM e devolve a string em Base64."""
    qr = qrcode.make(url)
    buf = io.BytesIO()
    qr.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{qr_base64}"