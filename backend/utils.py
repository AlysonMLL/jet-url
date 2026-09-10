"""
O que há aqui:
- generate_short_code(length): gera códigos alfanuméricos aleatórios para URLs curtas
- get_icon_url(icon_id): converte IDs de marcas, ícones genéricos e emojis em URLs de CDN
- generate_qr_base64(url, fill, back, icon): cria QR Codes personalizados em formato PNG
- Download e processamento de ícones externos para inserção central no QR Code
- Conversão da imagem gerada para uma string Base64 compatível com respostas HTTP

Função do arquivo: Reunir utilitários compartilhados pelo backend para geração de códigos
curtos e criação de QR Codes personalizados. O módulo resolve os ícones escolhidos pelo
frontend, busca suas imagens nas CDNs configuradas, redimensiona e posiciona o ícone no
centro do QR Code com uma área de proteção para preservar a leitura, e devolve a imagem
como um Data URI Base64 pronta para ser exibida ou enviada pela API. Também mantém o
tratamento de falhas de ícones isolado, permitindo que o QR Code continue sendo gerado
mesmo quando uma imagem externa não está disponível.
"""


import random
import string
import qrcode
import io
import base64
import urllib.request
from PIL import Image, ImageDraw

def generate_short_code(length=6):
    """Gera um código alfanumérico aleatório."""
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def get_icon_url(icon_id: str) -> str:
    """Mapeia o ID do frontend para CDNs de alta disponibilidade voltados para desenvolvedores."""
    
    # Repositório GitHub Raw (Não bloqueia requisições de backend) e Icons8
    brands = {
        "whatsapp": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/whatsapp.png",
        "telegram": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/telegram.png",
        "discord": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/discord.png",
        "instagram": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/instagram.png",
        "facebook": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/facebook.png",
        "x": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/x.png",
        "youtube": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/youtube.png",
        "twitch": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/twitch.png",
        "tiktok": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/tiktok.png",
        "reddit": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/reddit.png",
        "spotify": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/spotify.png",
        "github": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/github.png",
        "linkedin": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/linkedin.png",
        "googledrive": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/google-drive.png",
        "paypal": "https://raw.githubusercontent.com/WalkxCode/dashboard-icons/main/png/paypal.png",
        "pix": "https://img.icons8.com/color/512/pix.png",
        "mercadopago": "https://img.icons8.com/color/512/mercado-pago.png",

        # Genéricos:
        "wifi": "https://img.icons8.com/ios-filled/512/wifi.png",
        "localizacao": "https://img.icons8.com/ios-filled/512/marker.png"
    }
    
    if icon_id in brands:
        return brands[icon_id]
    
    # Fallback para emojis via Twemoji (Removendo caracteres ocultos que causam 404)
    try:
        emoji_hex = "-".join(f"{ord(c):x}" for c in icon_id if f"{ord(c):x}" != "fe0f")
        return f"https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/{emoji_hex}.png"
    except:
        return ""

def generate_qr_base64(url: str, fill_color: str = "black", back_color: str = "white", icon_name: str = "") -> str:
    """Gera o QR Code mesclando com o ícone no centro, com tratamento rigoroso de erros."""
    
    qr = qrcode.QRCode(
        version=4, 
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGBA")
    
    if icon_name:
        try:
            icon_url = get_icon_url(icon_name)
            if icon_url:
                # Criando um User-Agent profissional para evitar bloqueios de CDN
                req = urllib.request.Request(icon_url, headers={'User-Agent': 'JetURL-Backend/1.0 (Contact: admin@jet.url)'})
                
                with urllib.request.urlopen(req) as response:
                    icon_data = response.read()
                    logo = Image.open(io.BytesIO(icon_data)).convert("RGBA")
                    
                    # Garantia de compatibilidade para diferentes versões da biblioteca Pillow
                    resample_filter = getattr(Image, 'Resampling', Image).LANCZOS
                    
                    basewidth = int(img.size[0] * 0.25)
                    wpercent = (basewidth / float(logo.size[0]))
                    hsize = int((float(logo.size[1]) * float(wpercent)))
                    
                    logo = logo.resize((basewidth, hsize), resample_filter)
                    
                    # Posicionamento central
                    pos = ((img.size[0] - logo.size[0]) // 2, (img.size[1] - logo.size[1]) // 2)
                    
                    # Fundo de proteção (para a logo não se misturar nos pixels do QR Code)
                    draw = ImageDraw.Draw(img)
                    padding = 10
                    bg_box = [pos[0] - padding, pos[1] - padding, pos[0] + logo.size[0] + padding, pos[1] + logo.size[1] + padding]
                    draw.rectangle(bg_box, fill=back_color)
                    
                    # Colagem final usando o canal Alpha da logo como máscara
                    img.paste(logo, pos, mask=logo)
                    
        except Exception as e:
            print(f"⚠️ Erro ao inserir o ícone '{icon_name}': {e}")
            pass
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    qr_base64 = base64.b64encode(buf.getvalue()).decode("utf-8")
    
    return f"data:image/png;base64,{qr_base64}"