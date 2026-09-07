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

        const personalizarQR = ref(false); // Controla se o painel aparece
        const qrFill = ref('#000000');     // Cor do código
        const qrBack = ref('#ffffff');     // Cor do fundo
        const paletaAtiva = ref('Clássico');
        const conteudoQR = ref('https://example.com'); // Input do QRCode

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

        // Converte código HEX (#FFFFFF) para RGB (rgb(255, 255, 255))
        const hexToRgb = (hex) => {
            let h = hex.replace('#', '');
            if (h.length === 3) h = h.split('').map(c => c+c).join('');
            const r = parseInt(h.substring(0,2), 16) || 0;
            const g = parseInt(h.substring(2,4), 16) || 0;
            const b = parseInt(h.substring(4,6), 16) || 0;
            return `rgb(${r}, ${g}, ${b})`;
        };

        // Propriedades computadas para mostrar o texto na tela em tempo real
        const rgbFill = computed(() => hexToRgb(qrFill.value));
        const rgbBack = computed(() => hexToRgb(qrBack.value));

        let timeoutQR;
        let requisicaoQR = 0;
        const atualizarQR = () => {
            clearTimeout(timeoutQR);
            const conteudo = conteudoQR.value;
            const fill = qrFill.value;
            const back = qrBack.value;
            const idRequisicao = ++requisicaoQR;

            timeoutQR = setTimeout(async () => {
                if (!conteudo) return;
                try {
                    // Chama a nova rota do FastAPI
                    const res = await fetch(`/api/qr?url=${encodeURIComponent(conteudo)}&fill=${encodeURIComponent(fill)}&back=${encodeURIComponent(back)}`);
                    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
                    const data = await res.json();
                    if (idRequisicao === requisicaoQR) {
                        qrCodeUrl.value = data.qr_code;
                    }
                } catch (error) {
                    console.error("Erro ao gerar QR Code dinâmico", error);
                }
            }, 500); // Espera meio segundo após a última tecla/clique
        };

        const selecionarPaleta = (paleta) => {
            paletaAtiva.value = paleta;
            if (paleta === 'Ouro') {
                qrFill.value = '#C9A84C'; qrBack.value = '#0D0D0D';
            } else if (paleta === 'Invertido') {
                qrFill.value = '#FFFFFF'; qrBack.value = '#000000';
            } else { 
                qrFill.value = '#000000'; qrBack.value = '#FFFFFF';
            }
            atualizarQR(); //
        };

        const limparPaleta = () => {
            // Se o usuário clicar no seletor de cor manualmente, desmarcamos o preset
            paletaAtiva.value = ''; 
        };

        const baixarQRCode = () => {
            if (!qrCodeUrl.value) return;
            const link = document.createElement('a');
            link.href = qrCodeUrl.value;
            link.download = `qrcode_jeturl_${shortUrl.value.split('/').pop()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
            let startIso = ''; let expIso = '';
            if (estipularData.value) {
                if (dataInicio.value) startIso = new Date(dataInicio.value).toISOString();
                if (dataFim.value) expIso = new Date(dataFim.value).toISOString();
                if (startIso && expIso && new Date(dataInicio.value) >= new Date(dataFim.value)) {
                    erroEncurtar.value = "A data de término deve ser posterior à data de início.";
                    carregando.value = false;
                    return;
                }
            }

            try {
                // Passa as datas para a API
                // Passa também as cores do QR Code
                const dados = await encurtarLink(
                    urlInput.value, apelidoInput.value, startIso, expIso, 
                    qrFill.value, qrBack.value
                );
                
                shortUrl.value = dados.short_url;
                qrCodeUrl.value = dados.qr_code;
                conteudoQR.value = dados.short_url;
                
                urlInput.value = ''; apelidoInput.value = ''; 
                // Opcional: resetar as datas após sucesso
            } catch (error) {
                erroEncurtar.value = error.message;
            } finally {
                carregando.value = false;
            }
        };

        // const processarEncurtamento = async () => {
        //     if (!urlInput.value) {
        //         erroEncurtar.value = "Por favor, digite uma URL válida.";
        //         return;
        //     }
        //     erroEncurtar.value = '';
        //     carregando.value = true;
        //     shortUrl.value = '';

        //     // Conversão de Data Local para Padrão ISO (UTC) do Banco de Dados
        //     let startIso = '';
        //     let expIso = '';
        //     if (estipularData.value) {
        //         if (dataInicio.value) startIso = new Date(dataInicio.value).toISOString();
        //         if (dataFim.value) expIso = new Date(dataFim.value).toISOString();
                
        //         // Validação amigável
        //         if (startIso && expIso && new Date(dataInicio.value) >= new Date(dataFim.value)) {
        //             erroEncurtar.value = "A data de término deve ser posterior à data de início.";
        //             carregando.value = false;
        //             return;
        //         }
        //     }

        //     try {
        //         // Passa as datas para a API!
        //         const dados = await encurtarLink(urlInput.value, apelidoInput.value, startIso, expIso);
        //         shortUrl.value = dados.short_url;
        //         qrCodeUrl.value = dados.qr_code;
                
        //         urlInput.value = ''; apelidoInput.value = ''; 
        //         // Opcional: resetar as datas após sucesso
        //         // estipularData.value = false; 
        //     } catch (error) {
        //         erroEncurtar.value = error.message;
        //     } finally {
        //         carregando.value = false;
        //     }
        // };

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

        // --- FUNÇÃO DE COLAR TEXTO ---
        const colarTexto = async (campo) => {
            try {
                // Acessa a área de transferência nativa do sistema operacional
                const texto = await navigator.clipboard.readText();
                
                if (campo === 'url') {
                    urlInput.value = texto;
                } else if (campo === 'qr') {
                    conteudoQR.value = texto;
                    atualizarQR(); // Atualiza a imagem na mesma hora
                }
            } catch (err) {
                console.error("Erro ao ler área de transferência", err);
                alert('Não foi possível acessar a área de transferência. Verifique as permissões do navegador.');
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
            selecionarPreset, limparPreset,
            personalizarQR, qrFill, qrBack, paletaAtiva, rgbFill, rgbBack,
            selecionarPaleta, limparPaleta, baixarQRCode,
            conteudoQR, atualizarQR,
            colarTexto
        };
    }
});

// A aplicação Vue assume o controle da div com id "app"
app.mount('#app');