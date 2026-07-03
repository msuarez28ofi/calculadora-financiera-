// =========================================================================
// CONFIGURACIÓN GLOBAL Y TASAS EN VIVO
// =========================================================================
let TASA_USD_VES = parseFloat(localStorage.getItem('LAST_TASA_USD')) || 40.00; 
let TASA_EUR_VES = parseFloat(localStorage.getItem('LAST_TASA_EUR')) || 43.50; 

async function obtenerTasasActuales() {
    const displayUSD = document.getElementById('tasa-usd');
    const displayEUR = document.getElementById('tasa-eur');
    const apis = [
        "https://open.er-api.com/v6/latest/USD", 
        "https://api.exchangerate-api.com/v4/latest/USD"
    ];

    try {
        const resultadoRapido = await Promise.any(apis.map(async url => {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Error en API");
            const data = await res.json();
            return { usd: data.rates.VES, eur: data.rates.EUR };
        }));
        
        if (resultadoRapido && resultadoRapido.usd) {
            TASA_USD_VES = resultadoRapido.usd;
            TASA_EUR_VES = TASA_USD_VES / (resultadoRapido.eur || 0.92);
            localStorage.setItem('LAST_TASA_USD', TASA_USD_VES);
            localStorage.setItem('LAST_TASA_EUR', TASA_EUR_VES);
        }
    } catch (e) { 
        console.warn("Modo offline o error de red activo. Usando tasas guardadas."); 
    }

    if (displayUSD) displayUSD.textContent = TASA_USD_VES.toFixed(2) + " VES";
    if (displayEUR) displayEUR.textContent = TASA_EUR_VES.toFixed(2) + " VES";
}

// =========================================================================
// NAVEGACIÓN Y CONFIGURACIONES GENERALES (CORREGIDO)
// =========================================================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

function changeView(viewName) {
    const vistas = ['inicio', 'simple', 'compound', 'single', 'uniform'];
    
    vistas.forEach(v => {
        const sección = document.getElementById(`section-${v}`);
        const botónNav = document.getElementById(`nav-${v}`);
        
        if (sección) sección.classList.add('hidden');
        if (botónNav) botónNav.classList.remove('active');
    });
    
    const secciónActiva = document.getElementById(`section-${viewName}`);
    const botónActivo = document.getElementById(`nav-${viewName}`);
    
    if (secciónActiva) secciónActiva.classList.remove('hidden');
    if (botónActivo) botónActivo.classList.add('active');
}

function inicializarTema() {
    const temaGuardado = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', temaGuardado);
    actualizarIconosTema(temaGuardado);
}

function actualizarIconosTema(tema) {
    const sunIcon = document.getElementById('theme-icon-sun');
    const moonIcon = document.getElementById('theme-icon-moon');
    
    if (sunIcon && moonIcon) {
        if (tema === 'dark') {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }
}

// Formateadores de moneda
const formatVES = (v) => (v || 0).toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' VES';
const formatUSD = (v) => '$' + (v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD';
const formatEUR = (v) => '€' + (v || 0).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' EUR';

// =========================================================================
// CONTROLADORES DE CAMPOS EN TIEMPO REAL (OCULTAR / MOSTRAR INPUTS)
// =========================================================================
function toggleSimpleFields() {
    const target = document.getElementById('simple-target')?.value;
    if (!target) return;
    
    document.getElementById('group-simple-c')?.classList.toggle('hidden', target === 'C');
    document.getElementById('group-simple-i')?.classList.toggle('hidden', target === 'i');
    document.getElementById('group-simple-t')?.classList.toggle('hidden', target === 't');
    document.getElementById('group-simple-vf')?.classList.toggle('hidden', target === 'I' || target === 'Vf');
    document.getElementById('group-simple-int-earned')?.classList.toggle('hidden', target !== 'C' && target !== 'i' && target !== 't');
    document.getElementById('results-simple')?.classList.add('hidden');
}

function toggleCompoundFields() {
    const target = document.getElementById('compound-target')?.value;
    if (!target) return;

    document.getElementById('group-compound-c')?.classList.toggle('hidden', target === 'C');
    document.getElementById('group-compound-i')?.classList.toggle('hidden', target === 'i');
    document.getElementById('group-compound-t')?.classList.toggle('hidden', target === 't');
    document.getElementById('group-compound-vf')?.classList.toggle('hidden', target === 'Vf');
    document.getElementById('results-compound')?.classList.add('hidden');
}

function toggleSingleFields() {
    const target = document.getElementById('single-target')?.value;
    if (!target) return;

    document.getElementById('group-single-p')?.classList.toggle('hidden', target === 'P');
    document.getElementById('group-single-f')?.classList.toggle('hidden', target === 'F');
    document.getElementById('group-single-i')?.classList.toggle('hidden', target === 'i');
    document.getElementById('group-single-n')?.classList.toggle('hidden', target === 'n');
    document.getElementById('results-single')?.classList.add('hidden');
}

function toggleUniformFields() {
    const target = document.getElementById('uniform-target')?.value;
    if (!target) return;

    document.getElementById('group-uniform-a')?.classList.toggle('hidden', target === 'A_P' || target === 'A_F');
    document.getElementById('group-uniform-p')?.classList.toggle('hidden', target !== 'A_P' && target !== 'n');
    document.getElementById('group-uniform-f')?.classList.toggle('hidden', target !== 'A_F');
    document.getElementById('results-uniform')?.classList.add('hidden');
}

// =========================================================================
// EJECUCIÓN MATEMÁTICA DE LOS DESPEJES
// =========================================================================
function calcularSimple() {
    const target = document.getElementById('simple-target').value;
    let c = parseFloat(document.getElementById('simple-c').value) || 0;
    let i = (parseFloat(document.getElementById('simple-i').value) || 0) / 100;
    let t = parseFloat(document.getElementById('simple-t').value) || 0;
    let tType = document.getElementById('simple-t-type').value;
    let I = parseFloat(document.getElementById('simple-int-earned').value) || 0;

    let factorTiempo = 1;
    if (tType === 'months') factorTiempo = 1 / 12;
    if (tType === 'days') factorTiempo = 1 / 365;

    let res = 0, label = "", mostrarDivisas = true;

    if (target === 'Vf') { res = c * (1 + i * t * factorTiempo); label = "Monto Final (Vf):"; }
    else if (target === 'I') { res = c * i * t * factorTiempo; label = "Interés Neto Ganado (I):"; }
    else if (target === 'C') { res = I / (i * t * factorTiempo); label = "Capital Inicial (C):"; }
    else if (target === 'i') { res = (I / (c * t * factorTiempo)) * 100; label = "Tasa de Interés Anual Despejada (%):"; mostrarDivisas = false; }
    else if (target === 't') { res = I / (c * i); label = `Tiempo Calculado (${tType}):`; mostrarDivisas = false; }

    document.getElementById('res-simple-label').textContent = label;
    document.getElementById('res-simple-val').textContent = mostrarDivisas ? formatVES(res) : res.toFixed(4);
    document.getElementById('res-simple-conversion').classList.toggle('hidden', !mostrarDivisas);
    
    if (mostrarDivisas) {
        document.getElementById('res-simple-usd').textContent = formatUSD(res / TASA_USD_VES);
        document.getElementById('res-simple-eur').textContent = formatEUR(res / TASA_EUR_VES);
    }
    document.getElementById('results-simple').classList.remove('hidden');
}

function calcularCompuesto() {
    const target = document.getElementById('compound-target').value;
    let c = parseFloat(document.getElementById('compound-c').value) || 0;
    let i = (parseFloat(document.getElementById('compound-i').value) || 0) / 100;
    let t = parseFloat(document.getElementById('compound-t').value) || 0;
    let tType = document.getElementById('compound-t-type').value;
    let k = parseFloat(document.getElementById('compound-k').value) || 1;
    let vf = parseFloat(document.getElementById('compound-vf').value) || 0;

    let n = (tType === 'months') ? (t / 12) * k : t * k;
    let res = 0, label = "", mostrarDivisas = true;

    if (target === 'Vf') { res = c * Math.pow(1 + (i / k), n); label = "Monto Final Compuesto (Vf):"; }
    else if (target === 'C') { res = vf / Math.pow(1 + (i / k), n); label = "Capital Requerido (C):"; }
    else if (target === 'i') { res = k * (Math.pow(vf / c, 1 / n) - 1) * 100; label = "Tasa Nominal Anual Despejada (%):"; mostrarDivisas = false; }
    else if (target === 't') { res = (Math.log(vf / c) / Math.log(1 + (i / k))) / k; if (tType === 'months') res *= 12; label = `Tiempo Necesario (${tType}):`; mostrarDivisas = false; }

    document.getElementById('res-compound-label').textContent = label;
    document.getElementById('res-compound-val').textContent = mostrarDivisas ? formatVES(res) : res.toFixed(4);
    document.getElementById('res-compound-conversion').classList.toggle('hidden', !mostrarDivisas);
    
    if (mostrarDivisas) {
        document.getElementById('res-compound-usd').textContent = formatUSD(res / TASA_USD_VES);
        document.getElementById('res-compound-eur').textContent = formatEUR(res / TASA_EUR_VES);
    }
    document.getElementById('results-compound').classList.remove('hidden');
}

function calcularSingle() {
    const target = document.getElementById('single-target').value;
    let p = parseFloat(document.getElementById('single-p').value) || 0;
    let f = parseFloat(document.getElementById('single-f').value) || 0;
    let i = (parseFloat(document.getElementById('single-i').value) || 0) / 100;
    let n = parseFloat(document.getElementById('single-n').value) || 0;

    let res = 0, label = "";
    if (target === 'F') { res = p * Math.pow(1 + i, n); label = "Valor Futuro Equivalente (F): " + formatVES(res); }
    else if (target === 'P') { res = f / Math.pow(1 + i, n); label = "Valor Presente Equivalente (P): " + formatVES(res); }
    else if (target === 'i') { res = (Math.pow(f / p, 1 / n) - 1) * 100; label = "Tasa de Interés Despejada: " + res.toFixed(2) + "%"; }
    else if (target === 'n') { res = Math.log(f / p) / Math.log(1 + i); label = "Número de Períodos (n): " + res.toFixed(2); }

    document.getElementById('res-single-label').textContent = label;
    document.getElementById('res-single-val').textContent = ""; 
    document.getElementById('results-single').classList.remove('hidden');
}

function calcularUniform() {
    const target = document.getElementById('uniform-target').value;
    let a = parseFloat(document.getElementById('uniform-a').value) || 0;
    let p = parseFloat(document.getElementById('uniform-p').value) || 0;
    let f = parseFloat(document.getElementById('uniform-f').value) || 0;
    let i = (parseFloat(document.getElementById('uniform-i').value) || 0) / 100;
    let n = parseFloat(document.getElementById('uniform-n').value) || 0;

    let res = 0, label = "";
    if (i <= 0) { alert("La tasa de interés debe ser mayor a 0%"); return; }

    if (target === 'P') { res = a * ((Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n))); label = "Valor Presente (P): " + formatVES(res); }
    else if (target === 'F') { res = a * ((Math.pow(1 + i, n) - 1) / i); label = "Valor Futuro (F): " + formatVES(res); }
    else if (target === 'A_P') { res = p * ((i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1)); label = "Cuota Uniforme (A dado P): " + formatVES(res); }
    else if (target === 'A_F') { res = f * (i / (Math.pow(1 + i, n) - 1)); label = "Cuota de Ahorro (A dado F): " + formatVES(res); }
    else if (target === 'n') { res = Math.log(1 / (1 - (p * i / a))) / Math.log(1 + i); label = "Períodos Requeridos (n): " + res.toFixed(2); }

    document.getElementById('res-uniform-label').textContent = label;
    document.getElementById('res-uniform-val').textContent = "";
    document.getElementById('results-uniform').classList.remove('hidden');
}

// =========================================================================
// LISTENERS ASIGNADOS DE FORMA SEGURA AL CARGAR LA PÁGINA
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar configuraciones de la app
    inicializarTema();
    obtenerTasasActuales();

    // Eventos del Menú de navegación / Sidebar
    document.getElementById("menu-btn")?.addEventListener("click", toggleSidebar);
    document.getElementById("close-sidebar-btn")?.addEventListener("click", toggleSidebar);
    document.getElementById("sidebar-overlay")?.addEventListener("click", toggleSidebar);

    // Evento del botón de cambio de tema
    document.getElementById("theme-toggle-btn")?.addEventListener("click", () => {
        const actualTema = document.documentElement.getAttribute('data-theme');
        const nuevoTema = actualTema === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', nuevoTema);
        localStorage.setItem('theme', nuevoTema);
        actualizarIconosTema(nuevoTema);
    });

    // Enrutamiento de las secciones desde el menú
    document.getElementById("nav-inicio")?.addEventListener("click", () => { changeView('inicio'); toggleSidebar(); });
    document.getElementById("logo-inicio")?.addEventListener("click", () => changeView('inicio'));
    document.getElementById("nav-simple")?.addEventListener("click", () => { changeView('simple'); toggleSidebar(); });
    document.getElementById("nav-compound")?.addEventListener("click", () => { changeView('compound'); toggleSidebar(); });
    document.getElementById("nav-single")?.addEventListener("click", () => { changeView('single'); toggleSidebar(); });
    document.getElementById("nav-uniform")?.addEventListener("click", () => { changeView('uniform'); toggleSidebar(); });

    // Detectores de cambios en los selectores de variables (Target)
    document.getElementById("simple-target")?.addEventListener("change", toggleSimpleFields);
    document.getElementById("compound-target")?.addEventListener("change", toggleCompoundFields);
    document.getElementById("single-target")?.addEventListener("change", toggleSingleFields);
    document.getElementById("uniform-target")?.addEventListener("change", toggleUniformFields);

    // Activadores de los botones de cálculo matemático
    document.getElementById("btn-calc-simple")?.addEventListener("click", calcularSimple);
    document.getElementById("btn-calc-compound")?.addEventListener("click", calcularCompuesto);
    document.getElementById("btn-calc-single")?.addEventListener("click", calcularSingle);
    document.getElementById("btn-calc-uniform")?.addEventListener("click", calcularUniform);

    // Renderizar inputs iniciales según la opción por defecto
    toggleSimpleFields();
    toggleCompoundFields();
    toggleSingleFields();
    toggleUniformFields();
});