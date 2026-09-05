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
        // --- 0. ESTADO REATIVO (Variáveis que controlam a tela) ---
        const urlInput = ref('');
        const shortUrl = ref('');
        const qrCodeUrl = ref('');
        const carregando = ref(false);
        const erroEncurtar = ref('');

        const apelidoInput = ref('');
        const codigoInput = ref('');
        const dadosMetricas = ref(null);
        const labelsMetricas = ref([]);
        const valoresMetricas = ref([]);
        
        const isDarkTheme = ref(true); // O tailwind inicia com a classe .dark
        const placeholderAnimado = ref('cole sua URL aqui...');

        const estipularData = ref(false); // Controla se o painel de datas aparece
        const presetAtivo = ref('');
        const dataInicio = ref('');
        const dataFim = ref('');

        // 1. Computa o preview em tempo real (limpando espaços e caracteres especiais)
        const urlPreview = computed(() => {
            if (!apelidoInput.value) return '';
            
            // Remove acentos, espaços e deixa minúsculo
            let aliasLimpo = apelidoInput.value
                .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-');
                
            // Pega o domínio dinamicamente (ex: localhost:8000 ou jet.url)
            const host = window.location.host; 
            return `${host}/${aliasLimpo}`;
        });

        // --- 2. FUNÇÕES (Métodos atrelados aos botões) ---

        const alternarTema = () => {
            // É chamada a função externa e ela nos diz se ficou dark ou não
            // Nulo para o gráfico por enquanto, pois o Vue vai re-renderizar depois se precisar
            isDarkTheme.value = toggleTheme(null);
        };

        const presetsTempo = [
            { label: '15min', horas: 0.25 }, { label: '30min', horas: 0.5 },
            { label: '1h', horas: 1 }, { label: '3h', horas: 3 },
            { label: '12h', horas: 12 }, { label: '24h', horas: 24 },
            { label: '48h', horas: 48 }, { label: '72h', horas: 72 },
            { label: '7 dias (168h)', horas: 168 }, { label: '30 dias (720h)', horas: 720 },
        ];

        // --- LÓGICA DE DATAS ---
        const formatarParaInputLocal = (date) => {
            // Ajusta o fuso para o input type="datetime-local" entender perfeitamente
            const tzoffset = (new Date()).getTimezoneOffset() * 60000; 
            return (new Date(date - tzoffset)).toISOString().slice(0, 16);
        };

        const selecionarPreset = (label, horas) => {
            presetAtivo.value = label;
            const agora = new Date();
            const fim = new Date(agora.getTime() + horas * 60 * 60 * 1000);
            
            dataInicio.value = formatarParaInputLocal(agora);
            dataFim.value = formatarParaInputLocal(fim);
        };

        const limparPreset = () => {
            // Acionado quando o usuário digita manualmente no calendário
            presetAtivo.value = ''; 
        };

        const processarEncurtamento = async () => {
            if (!urlInput.value) {
                erroEncurtar.value = "Por favor, digite uma URL válida.";
                return;
            }
            erroEncurtar.value = '';
            carregando.value = true;
            shortUrl.value = '';

            // Conversão de Data Local para Padrão ISO (UTC) do Banco de Dados
            let startIso = '';
            let expIso = '';
            if (estipularData.value) {
                if (dataInicio.value) startIso = new Date(dataInicio.value).toISOString();
                if (dataFim.value) expIso = new Date(dataFim.value).toISOString();
                
                // Validação amigável
                if (startIso && expIso && new Date(dataInicio.value) >= new Date(dataFim.value)) {
                    erroEncurtar.value = "A data de término deve ser posterior à data de início.";
                    carregando.value = false;
                    return;
                }
            }

            try {
                // Passa as datas para a API!
                const dados = await encurtarLink(urlInput.value, apelidoInput.value, startIso, expIso);
                shortUrl.value = dados.short_url;
                qrCodeUrl.value = dados.qr_code;
                
                urlInput.value = ''; apelidoInput.value = ''; 
                // Opcional: resetar as datas após sucesso
                // estipularData.value = false; 
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
            alternarTema, processarEncurtamento, carregarMetricas, copiarLink, 
            apelidoInput, urlPreview, estipularData, presetAtivo, dataInicio, dataFim, presetsTempo,
            selecionarPreset, limparPreset
        };
    }
});

// A aplicação Vue assume o controle da div com id "app"
app.mount('#app');