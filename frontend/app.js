/* O que há aqui:
- Instância raiz do Vue 3
- Estado reativo (Variáveis como urlInput, dadosMetricas, isDark)
- Funções interligadas à interface (processarEncurtamento, carregarDados, copiarLink)

Função do arquivo: Atuar como o Controlador (ViewModel). Ele une a interface (HTML)
com as requisições da API e as funções utilitárias.
*/

import { encurtarLink, buscarEstatisticas } from './api.js';
import { renderizarGraficoDispositivos, renderizarGraficoOS, renderizarGraficoNavegadores } from './components.js';
import { toggleTheme } from './theme.js';

// Desestruturando as ferramentas nativas do Vue (importado via CDN no HTML)
const { createApp, ref, computed, onMounted } = Vue;

// Função para agrupar dados menores na categoria "Outros"
function formatarTopN(objDados, maxItens = 5) {
    if (!objDados) return { labels: [], data: [] };
    
    // Converte {Chrome: 10, Edge: 2} em array e ordena do maior pro menor
    const entradas = Object.entries(objDados).sort((a, b) => b[1] - a[1]);
    
    if (entradas.length <= maxItens) {
        return { labels: entradas.map(e => e[0]), data: entradas.map(e => e[1]) };
    }
    
    // Separa os Top N e soma o resto
    const top = entradas.slice(0, maxItens - 1);
    const somaOutros = entradas.slice(maxItens - 1).reduce((soma, item) => soma + item[1], 0);
    
    const labels = top.map(e => e[0]);
    const data = top.map(e => e[1]);
    
    labels.push('Outros');
    data.push(somaOutros);
    
    return { labels, data };
}

const app = createApp({
    setup() {
        // --- 1. ESTADO REATIVO (Variáveis que controlam a tela) ---
        const urlInput = ref('');
        const shortUrl = ref('');
        const qrCodeUrl = ref('');
        const carregando = ref(false);
        const erroEncurtar = ref('');

        const codigoInput = ref('');
        const dadosMetricas = ref(null);
        const labelsMetricas = ref([]);
        const valoresMetricas = ref([]);
        
        const isDarkTheme = ref(true); // O tailwind inicia com a classe .dark
        const placeholderAnimado = ref('cole sua URL aqui...');

        // --- 2. FUNÇÕES (Métodos atrelados aos botões) ---

        const alternarTema = () => {
            // Chamamos a função externa e ela nos diz se ficou dark ou não
            // Passamos nulo para o gráfico por enquanto, pois o Vue vai re-renderizar depois se precisar
            isDarkTheme.value = toggleTheme(null);
        };

        const processarEncurtamento = async () => {
            if (!urlInput.value) {
                erroEncurtar.value = "Por favor, digite uma URL válida.";
                return;
            }
            erroEncurtar.value = '';
            carregando.value = true;
            shortUrl.value = '';

            try {
                const dados = await encurtarLink(urlInput.value);
                shortUrl.value = dados.short_url;
                qrCodeUrl.value = dados.qr_code;
                urlInput.value = ''; // Limpa o input
            } catch (error) {
                erroEncurtar.value = error.message;
            } finally {
                carregando.value = false;
            }
        };

        const carregarMetricas = async () => {
            let codigo = codigoInput.value.trim();
            if (!codigo) return alert('Digite o código do link.');
            if (codigo.includes('/')) codigo = codigo.split('/').pop();
            
            try {
                const dados = await buscarEstatisticas(codigo);
                if (dados.mensagem) return alert(dados.mensagem);
                
                dadosMetricas.value = dados;
                
                const dadosDev = formatarTopN(dados.devices, 5);
                const dadosOS = formatarTopN(dados.os, 5);
                const dadosNav = formatarTopN(dados.browsers, 5);

                setTimeout(() => {
                    renderizarGraficoDispositivos('deviceChart', dadosDev.labels, dadosDev.data, isDarkTheme.value);
                    renderizarGraficoNavegadores('browserChart', dadosNav.labels, dadosNav.data, isDarkTheme.value);
                    renderizarGraficoOS('osChart', dadosOS.labels, dadosOS.data, isDarkTheme.value);
                }, 100);

            } catch (error) {
                alert('Erro ao buscar as métricas.');
            }
        };

        const copiarLink = async () => {
            try {
                await navigator.clipboard.writeText(shortUrl.value);
                alert('Link copiado com sucesso!');
            } catch (err) {
                alert('Falha ao copiar link.');
            }
        };

        // --- 3. EFEITO MÁQUINA DE ESCREVER ---
        const iniciarEfeitoDigitacao = () => {
            const textoLongo = 'cole sua URL aqui...';
            let index = 0;
            let mostrarCursor = true;

            setInterval(() => {
                mostrarCursor = !mostrarCursor;
                if (!urlInput.value) {
                    placeholderAnimado.value = textoLongo.slice(0, index) + (mostrarCursor ? '|' : '');
                }
            }, 500);

            const digitar = () => {
                if (urlInput.value) {
                    placeholderAnimado.value = textoLongo;
                    index = 0;
                    setTimeout(digitar, 300);
                    return;
                }
                index++;
                if (index > textoLongo.length) {
                    setTimeout(() => { index = 0; digitar(); }, 4000);
                    return;
                }
                setTimeout(digitar, 90);
            };
            digitar();
        };

        // Roda assim que a tela abre
        onMounted(() => {
            iniciarEfeitoDigitacao();
        });

        // --- 4. EXPOR TUDO PARA O HTML (TEMPLATE) ---
        return {
            urlInput, shortUrl, qrCodeUrl, carregando, erroEncurtar, placeholderAnimado,
            codigoInput, dadosMetricas, labelsMetricas, valoresMetricas,
            isDarkTheme,
            alternarTema, processarEncurtamento, carregarMetricas, copiarLink
        };
    }
});

// A aplicação Vue assume o controle da div com id "app"
app.mount('#app');