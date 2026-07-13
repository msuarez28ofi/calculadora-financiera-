// =========================================================================
// VARIABLES GLOBALES Y DIVISAS
// =========================================================================
let TASA_USD = 40.00;
let TASA_EUR = 43.20;

async function actualizarMonedas() {
    try {
        const r = await fetch("https://open.er-api.com/v6/latest/USD");
        if (r.ok) {
            const data = await r.json();
            TASA_USD = data.rates.VES || 40.00;
            TASA_EUR = TASA_USD / (data.rates.EUR || 0.92);
        }
    } catch(e) { console.warn("Modo local activo."); }
    document.getElementById('tasa-usd').textContent = TASA_USD.toFixed(2) + " VES";
    document.getElementById('tasa-eur').textContent = TASA_EUR.toFixed(2) + " VES";
}

const fVES = (v) => v.toLocaleString('es-VE', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' VES';
const fUSD = (v) => '$' + (v / TASA_USD).toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' USD';
const fEUR = (v) => '€' + (v / TASA_EUR).toLocaleString('de-DE', { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' EUR';

function pintarDivisas(idUsd, idEur, montoVES) {
    document.getElementById(idUsd).textContent = fUSD(montoVES);
    document.getElementById(idEur).textContent = fEUR(montoVES);
}

// NAVEGACIÓN
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

function irA(v) {
    ['inicio','simple','compound','single','uniform','rates','costs'].forEach(x => {
        if(document.getElementById(`section-${x}`)) document.getElementById(`section-${x}`).classList.add('hidden');
        if(document.getElementById(`nav-${x}`)) document.getElementById(`nav-${x}`).classList.remove('active');
    });
    if(document.getElementById(`section-${v}`)) document.getElementById(`section-${v}`).classList.remove('hidden');
    if(document.getElementById(`nav-${v}`)) document.getElementById(`nav-${v}`).classList.add('active');
}

// CONTROLADORES DINÁMICOS DE INPUTS
function checkSimple() {
    const val = document.getElementById('simple-target').value;
    document.getElementById('s-g-p').classList.toggle('hidden', val === 'P');
    document.getElementById('s-g-i').classList.toggle('hidden', val === 'i');
    document.getElementById('s-g-t').classList.toggle('hidden', val === 't');
    document.getElementById('s-g-int').classList.toggle('hidden', val !== 'P' && val !== 'i' && val !== 't' && val !== 'Vf');
    document.getElementById('s-g-vf').classList.toggle('hidden', val === 'Vf');
}

function checkCompound() {
    const val = document.getElementById('compound-target').value;
    document.getElementById('co-g-p').classList.toggle('hidden', val === 'P');
    document.getElementById('co-g-i').classList.toggle('hidden', val === 'i');
    document.getElementById('co-g-t').classList.toggle('hidden', val === 't');
    document.getElementById('co-g-vf').classList.toggle('hidden', val === 'Vf');
}

function checkSingle() {
    const val = document.getElementById('single-target').value;
    document.getElementById('si-g-p').classList.toggle('hidden', val === 'P');
    document.getElementById('si-g-f').classList.toggle('hidden', val === 'F');
    document.getElementById('si-g-i').classList.toggle('hidden', val === 'i');
    document.getElementById('si-g-n').classList.toggle('hidden', val === 'n');
}

function checkUniform() {
    const val = document.getElementById('uniform-target').value;
    document.getElementById('un-g-a').classList.toggle('hidden', val === 'A_P' || val === 'A_F');
    document.getElementById('un-g-p').classList.toggle('hidden', val !== 'A_P');
    document.getElementById('un-g-f').classList.toggle('hidden', val !== 'A_F');
}

// Mapeadores para los 5 períodos obligatorios
function obtenerEtiquetaPeriodo(unidad) {
    switch(unidad) {
        case 'mensual': return 'Meses';
        case 'bimensual': return 'Bimestres';
        case 'trimestral': return 'Trimestres';
        case 'semestral': return 'Semestres';
        case 'anual': return 'Años';
        default: return 'Períodos';
    }
}

function obtenerFactorAnual(unidad) {
    switch(unidad) {
        case 'mensual': return 12;
        case 'bimensual': return 6;
        case 'trimestral': return 4;
        case 'semestral': return 2;
        case 'anual': return 1;
        default: return 1;
    }
}

function checkRates() {
    const val = document.getElementById('rates-target').value;
    document.getElementById('rates-m2-container').classList.toggle('hidden', val !== 'nom_to_nom');
}

// =========================================================================
// OPERACIONES FINANCIERAS
// =========================================================================
function runSimple() {
    const target = document.getElementById('simple-target').value;
    let P = parseFloat(document.getElementById('simple-p').value) || 0;
    let i = (parseFloat(document.getElementById('simple-i').value) || 0) / 100;
    let t = parseFloat(document.getElementById('simple-t').value) || 0;
    let unit = document.getElementById('simple-t-unit').value;
    let Vf_in = parseFloat(document.getElementById('simple-vf').value) || 0;
    let I_in = parseFloat(document.getElementById('simple-int').value) || 0;

    let res = 0, lbl = "";
    let textoPeriodo = obtenerEtiquetaPeriodo(unit);

    if (target === 'I') { res = P * i * t; lbl = "Interés Neto Ganado (I):"; }
    else if (target === 'Vf') { res = P * (1 + i * t); lbl = "Valor Futuro Total (Vf):"; }
    else if (target === 'P') { 
        res = (Vf_in > 0) ? (Vf_in / (1 + i * t)) : (I_in / (i * t)); 
        lbl = "Valor Presente / Capital Requerido (P):"; 
    }
    else if (target === 'i') { 
        res = (Vf_in > 0) ? (((Vf_in / P) - 1) / t * 100) : ((I_in / (P * t)) * 100); 
        lbl = `Tasa Periódica Equivalente (${textoPeriodo} %):`; 
    }
    else if (target === 't') { 
        res = (Vf_in > 0) ? (((Vf_in / P) - 1) / i) : (I_in / (P * i)); 
        lbl = `Tiempo Total Encontrado (${textoPeriodo}):`; 
    }

    document.getElementById('res-simple-label').textContent = lbl;
    if(target === 'i' || target === 't') {
        document.getElementById('res-simple-val').textContent = res.toFixed(2) + (target === 'i' ? ' %':'');
        document.getElementById('divisas-simple').classList.add('hidden');
    } else {
        document.getElementById('res-simple-val').textContent = fVES(res);
        pintarDivisas('res-simple-usd', 'res-simple-eur', res);
        document.getElementById('divisas-simple').classList.remove('hidden');
    }
    document.getElementById('results-simple').classList.remove('hidden');
}

function runCompound() {
    const target = document.getElementById('compound-target').value;
    let P = parseFloat(document.getElementById('compound-p').value) || 0;
    let i = (parseFloat(document.getElementById('compound-i').value) || 0) / 100;
    let t = parseFloat(document.getElementById('compound-t').value) || 0;
    let unit = document.getElementById('compound-t-unit').value; 
    let m = parseFloat(document.getElementById('compound-m').value); 
    let Vf = parseFloat(document.getElementById('compound-vf').value) || 0;

    let factorOrigen = obtenerFactorAnual(unit);
    let tAnual = t / factorOrigen; 
    let n = tAnual * m; 
    
    let res = 0, lbl = "";

    if (target === 'Vf') { res = P * Math.pow(1 + i/m, n); lbl = "Valor Futuro Acumulado (Vf):"; }
    else if (target === 'P') { res = Vf / Math.pow(1 + i/m, n); lbl = "Valor Presente Requerido (P):"; }
    else if (target === 'i') { res = m * (Math.pow(Vf / P, 1 / n) - 1) * 100; lbl = "Tasa Anual Nominal (i %):"; }
    else if (target === 't') { 
        let calculoAnual = (Math.log(Vf / P) / Math.log(1 + i/m)) / m;
        res = calculoAnual * factorOrigen; 
        lbl = `Tiempo Total (${obtenerEtiquetaPeriodo(unit)}):`; 
    }

    document.getElementById('res-compound-label').textContent = lbl;
    if(target==='i' || target==='t') {
        document.getElementById('res-compound-val').textContent = res.toFixed(2) + (target==='i'?' %':'');
        document.getElementById('divisas-compound').classList.add('hidden');
    } else {
        document.getElementById('res-compound-val').textContent = fVES(res);
        pintarDivisas('res-compound-usd', 'res-compound-eur', res);
        document.getElementById('divisas-compound').classList.remove('hidden');
    }
    document.getElementById('results-compound').classList.remove('hidden');
}

function runSingle() {
    const target = document.getElementById('single-target').value;
    let P = parseFloat(document.getElementById('single-p').value) || 0;
    let F = parseFloat(document.getElementById('single-f').value) || 0;
    let i = (parseFloat(document.getElementById('single-i').value) || 0) / 100;
    let n = parseFloat(document.getElementById('single-n').value) || 0;
    let unit = document.getElementById('single-n-unit').value;
    let res = 0, lbl = "";

    let etiquetaUnitario = obtenerEtiquetaPeriodo(unit);

    if (target === 'F') { res = P * Math.pow(1 + i, n); lbl = "Valor Futuro Encontrado (F):"; }
    else if (target === 'P') { res = F / Math.pow(1 + i, n); lbl = "Valor Presente Equivalente (P):"; }
    else if (target === 'n') { res = Math.log(F / P) / Math.log(1 + i); lbl = `Número de Períodos (${etiquetaUnitario}):`; }
    else if (target === 'i') { res = (Math.pow(F / P, 1 / n) - 1) * 100; lbl = `Tasa Efectiva por Período (${etiquetaUnitario} %):`; }

    document.getElementById('res-single-label').textContent = lbl;
    if (target === 'n' || target === 'i') {
        document.getElementById('res-single-val').textContent = res.toFixed(2) + (target==='i'?' %':'');
        document.getElementById('divisas-single').classList.add('hidden');
    } else {
        document.getElementById('res-single-val').textContent = fVES(res);
        pintarDivisas('res-single-usd', 'res-single-eur', res);
        document.getElementById('divisas-single').classList.remove('hidden');
    }
    document.getElementById('results-single').classList.remove('hidden');
}

function runUniform() {
    const target = document.getElementById('uniform-target').value;
    const moment = document.getElementById('uniform-moment').value;
    let A = parseFloat(document.getElementById('uniform-a').value) || 0;
    let P = parseFloat(document.getElementById('uniform-p').value) || 0;
    let F = parseFloat(document.getElementById('uniform-f').value) || 0;
    let i = (parseFloat(document.getElementById('uniform-i').value) || 0) / 100;
    let n = parseFloat(document.getElementById('uniform-n').value) || 0;

    let res = 0, lbl = "";
    let fac = (moment === 'anticipada') ? (1 + i) : 1;

    if (target === 'P') { res = A * ((1 - Math.pow(1 + i, -n)) / i) * fac; lbl = "Valor Presente de Serie (P):"; }
    else if (target === 'F') { res = A * ((Math.pow(1 + i, n) - 1) / i) * fac; lbl = "Valor Futuro de Serie (F):"; }
    else if (target === 'A_P') { res = P / (((1 - Math.pow(1 + i, -n)) / i) * fac); lbl = "Cuota Periódica Fija (A):"; }
    else if (target === 'A_F') { res = F / (((Math.pow(1 + i, n) - 1) / i) * fac); lbl = "Cuota Periódica Fija (A):"; }

    document.getElementById('res-uniform-label').textContent = lbl;
    document.getElementById('res-uniform-val').textContent = fVES(res);
    pintarDivisas('res-uniform-usd', 'res-uniform-eur', res);
    document.getElementById('results-uniform').classList.remove('hidden');
}

function runRates() {
    const target = document.getElementById('rates-target').value;
    let valIn = parseFloat(document.getElementById('rates-in').value) || 0;
    let m1 = parseFloat(document.getElementById('rates-m1').value);
    let m2 = parseFloat(document.getElementById('rates-m2').value);
    let res = 0, lbl = "";

    if (target === 'nom_to_efec') { res = (Math.pow(1 + (valIn/100)/m1, m1) - 1) * 100; lbl = "TEA Efectiva Real Anual:"; }
    else if (target === 'efec_to_nom') { res = m1 * (Math.pow(1 + (valIn/100), 1/m1) - 1) * 100; lbl = "TNA Nominal Anual Calculada:"; }
    else if (target === 'nom_to_nom') {
        let tea = Math.pow(1 + (valIn/100)/m1, m1) - 1;
        res = m2 * (Math.pow(1 + tea, 1/m2) - 1) * 100;
        lbl = "Tasa Nominal Homóloga Destino:";
    }

    document.getElementById('res-rates-label').textContent = lbl;
    document.getElementById('res-rates-val').textContent = res.toFixed(4) + " %";
    document.getElementById('results-rates').classList.remove('hidden');
}

function runCosts() {
    let cf = parseFloat(document.getElementById('costs-cf').value) || 0;
    let cvu = parseFloat(document.getElementById('costs-cvu').value) || 0;
    let pvu = parseFloat(document.getElementById('costs-pvu').value) || 0;
    let q = parseFloat(document.getElementById('costs-q').value) || 0;

    let cvt = cvu * q;
    let ct = cf + cvt;
    let it = pvu * q;
    let u = it - ct;
    let pe = (pvu > cvu) ? cf / (pvu - cvu) : 0;

    document.getElementById('res-costs-cvt').textContent = fVES(cvt);
    document.getElementById('res-costs-ct').textContent = fVES(ct);
    document.getElementById('res-costs-it').textContent = fVES(it);
    
    let uEl = document.getElementById('res-costs-u');
    uEl.textContent = fVES(u);
    uEl.style.color = u < 0 ? '#ef4444' : '#10b981';

    document.getElementById('res-costs-pe').textContent = Math.ceil(pe) + " Unidades";
    pintarDivisas('res-costs-usd', 'res-costs-eur', u);
    document.getElementById('results-costs').classList.remove('hidden');
}

// INICIALIZADORES
document.addEventListener("DOMContentLoaded", () => {
    actualizarMonedas();
    document.getElementById("menu-btn").addEventListener("click", toggleMenu);
    document.getElementById("sidebar-overlay").addEventListener("click", toggleMenu);
    document.getElementById("logo-inicio").addEventListener("click", () => irA('inicio'));

    document.getElementById("theme-toggle-btn").addEventListener("click", () => {
        let current = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    });

    ['inicio','simple','compound','single','uniform','rates','costs'].forEach(v => {
        if(document.getElementById(`nav-${v}`)) {
            document.getElementById(`nav-${v}`).addEventListener("click", () => { irA(v); toggleMenu(); });
        }
    });

    document.getElementById('simple-target').addEventListener("change", checkSimple);
    document.getElementById('compound-target').addEventListener("change", checkCompound);
    document.getElementById('single-target').addEventListener("change", checkSingle);
    document.getElementById('uniform-target').addEventListener("change", checkUniform);
    document.getElementById('rates-target').addEventListener("change", checkRates);

    document.getElementById('btn-calc-simple').addEventListener("click", runSimple);
    document.getElementById('btn-calc-compound').addEventListener("click", runCompound);
    document.getElementById('btn-calc-single').addEventListener("click", runSingle);
    document.getElementById('btn-calc-uniform').addEventListener("click", runUniform);
    document.getElementById('btn-calc-rates').addEventListener("click", runRates);
    document.getElementById('btn-calc-costs').addEventListener("click", runCosts);
});