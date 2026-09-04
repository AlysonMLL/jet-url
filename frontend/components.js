/* O que há aqui:
- renderizarGraficoDispositivos(labels, data, isDark)
- renderizarGraficoNavegadores(labels, data, isDark)
- renderizarGraficoOS(labels, data, isDark)
*/

let chartDispositivos = null;
let chartNavegadores = null;
let chartOS = null;

// Paleta de cores variada, premium e acessível
const colorPalette = ['#f3bf43', '#06b6d4', '#8b5cf6', '#f43f5e', '#10b981', '#3b82f6'];

function getCommonOptions(isDark, showLegend = false) {
    const colorGrid = isDark ? '#222222' : '#e2e8f0';
    const colorText = isDark ? '#9ca3af' : '#475569';
    
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { 
                display: showLegend,
                position: 'bottom',
                labels: { color: colorText, font: { family: 'ui-monospace, monospace' } }
            }
        },
        scales: {
            x: { grid: { color: colorGrid, drawBorder: false }, ticks: { color: colorText } },
            y: { grid: { display: false }, ticks: { color: colorText } }
        }
    };
}

export function renderizarGraficoDispositivos(canvasId, labels, data, isDark) {
    if (chartDispositivos) chartDispositivos.destroy();
    
    const ctx = document.getElementById(canvasId).getContext('2d');
    const borderColor = isDark ? '#111111' : '#ffffff';
    
    chartDispositivos = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colorPalette,
                borderColor: borderColor,
                borderWidth: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: isDark ? '#9ca3af' : '#475569' } }
            }
        }
    });
}

export function renderizarGraficoNavegadores(canvasId, labels, data, isDark) {
    if (chartNavegadores) chartNavegadores.destroy();
    
    const ctx = document.getElementById(canvasId).getContext('2d');
    let options = getCommonOptions(isDark, false);
    options.indexAxis = 'y'; // Transforma em barras horizontais
    
    chartNavegadores = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ data: data, backgroundColor: colorPalette, borderRadius: 4 }]
        },
        options: options
    });
}

export function renderizarGraficoOS(canvasId, labels, data, isDark) {
    if (chartOS) chartOS.destroy();
    
    const ctx = document.getElementById(canvasId).getContext('2d');
    let options = getCommonOptions(isDark, false);
    // Inverte a grid para barras verticais
    options.scales.x.grid.display = false;
    options.scales.y.grid.display = true;
    
    chartOS = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{ data: data, backgroundColor: colorPalette, borderRadius: 4 }]
        },
        options: options
    });
}