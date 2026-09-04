/* O que há aqui:
- toggleTheme(chartInstance)

Função do arquivo: Gerenciar o estado Dark/Light Mode na raiz do documento HTML 
e atualizar as cores do gráfico dinamicamente.
*/

export function toggleTheme(chartInstance) {
    const htmlEl = document.documentElement;
    const isDark = htmlEl.classList.toggle('dark');
    
    // Opcional: Salvar preferência no localStorage
    localStorage.setItem('jeturl_theme', isDark ? 'dark' : 'light');
    
    // Atualizar gráfico se existir
    if (chartInstance) {
        chartInstance.data.datasets[0].borderColor = isDark ? '#111111' : '#ffffff';
        chartInstance.options.plugins.legend.labels.color = isDark ? '#9ca3af' : '#475569';
        chartInstance.update();
    }
    
    return isDark;
}






