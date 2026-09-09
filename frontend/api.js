

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