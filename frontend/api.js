/* O que há aqui:
- encurtarLink(url)
- buscarEstatisticas(codigo)

Função do arquivo: Isolar todas as chamadas HTTP (fetch) para o backend do FastAPI,
garantindo separação de responsabilidades (Separation of Concerns).
*/

export async function encurtarLink(urlOriginal) {
    const res = await fetch(`/shorten?original_url=${encodeURIComponent(urlOriginal)}`, { method: 'POST' });
    if (!res.ok) {
        throw new Error('Erro ao encurtar o link. Tente novamente.');
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