/* O que há aqui:
- encurtarLink(urlOriginal, apelido)
- buscarEstatisticas(codigo)

Função do arquivo: Isolar todas as chamadas HTTP (fetch) para o backend do FastAPI,
garantindo separação de responsabilidades (Separation of Concerns).
*/

export async function encurtarLink(urlOriginal, apelido = '') {
    // Monta a URL da API incluindo o apelido (se existir)
    let endpoint = `/shorten?original_url=${encodeURIComponent(urlOriginal)}`;
    if (apelido) {
        endpoint += `&custom_alias=${encodeURIComponent(apelido)}`;
    }

    const res = await fetch(endpoint, { method: 'POST' });
    
    if (!res.ok) {
        // Captura a mensagem de erro exata que o backend mandar (ex: "Apelido já existe")
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