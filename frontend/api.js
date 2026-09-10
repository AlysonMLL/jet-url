/* O que há aqui:
- Função encurtarLink para criar URLs encurtadas com apelido opcional
- Envio opcional de datas de início e expiração do link
- Envio das configurações do QR Code: cor, fundo e ícone personalizado
- Função buscarEstatisticas para consultar métricas de um link pelo código
- Codificação segura dos parâmetros enviados nas URLs das requisições
- Tratamento das respostas HTTP e das mensagens de erro retornadas pela API

Função do arquivo: Isolar todas as chamadas HTTP (fetch) entre o frontend e o backend
FastAPI, mantendo a comunicação da aplicação centralizada neste módulo e garantindo
separação de responsabilidades (Separation of Concerns). Ele monta os endpoints,
envia as requisições para criação e consulta de links e devolve os dados em JSON
para que o controlador Vue cuide da interface e das ações do usuário.
*/

export async function encurtarLink(urlOriginal, apelido = '', startsAt = '', expiresAt = '', qrFill = '', qrBack = '', icon = '') {
    let endpoint = `/shorten?original_url=${encodeURIComponent(urlOriginal)}`;
    if (apelido) endpoint += `&custom_alias=${encodeURIComponent(apelido)}`;
    if (startsAt) endpoint += `&starts_at=${encodeURIComponent(startsAt)}`;
    if (expiresAt) endpoint += `&expires_at=${encodeURIComponent(expiresAt)}`;

    endpoint += `&qr_fill=${encodeURIComponent(qrFill)}`;
    endpoint += `&qr_back=${encodeURIComponent(qrBack)}`;
    endpoint += `&icon=${encodeURIComponent(icon)}`; // <--- Anexando o ícone

    const res = await fetch(endpoint, { method: 'POST' });
    
    if (!res.ok) {
        const erroData = await res.json().catch(() => ({}));
        throw new Error(erroData.detail || 'Erro ao encurtar o link. Tente novamente.');
    }
    return await res.json();
}

export async function buscarEstatisticas(codigo) {
    const res = await fetch(`/stats/${codigo}`);
    if (!res.ok) {
        throw new Error('Erro ao buscar as estatísticas.');
    }
    return await res.json();
}