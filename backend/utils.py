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

def generate_qr_base64(url: str, fill_color: str = "black", back_color: str = "white") -> str:
    """Gera um QR Code customizado em memória RAM e devolve em Base64."""
    
    # Cria o objeto QRCode com nível de correção Alto (High) 
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    # Gerando a imagem aplicando as cores recebidas (Hexadecimal ou nome)
    img = qr.make_image(fill_color=fill_color, back_color=back_color)
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    
    return f"data:image/png;base64,{qr_base64}"