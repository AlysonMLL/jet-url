/* O que há aqui:
- encurtarLink(urlOriginal, apelido)
- buscarEstatisticas(codigo)

Função do arquivo: Isolar todas as chamadas HTTP (fetch) para o backend do FastAPI,
garantindo separação de responsabilidades (Separation of Concerns).
*/

export async function encurtarLink(urlOriginal, apelido = '', startsAt = '', expiresAt = '') {
    // Monta a URL base
    let endpoint = `/shorten?original_url=${encodeURIComponent(urlOriginal)}`;
    
    // Anexa os parâmetros apenas se eles existirem
    if (apelido) endpoint += `&custom_alias=${encodeURIComponent(apelido)}`;
    if (startsAt) endpoint += `&starts_at=${encodeURIComponent(startsAt)}`;
    if (expiresAt) endpoint += `&expires_at=${encodeURIComponent(expiresAt)}`;

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