// =========================================================================
// CONFIGURACIÓN GLOBAL Y ACTUALIZACIÓN DE TASAS EN VIVO (USD y EUR a VES)
// =========================================================================
// Tasas estables de respaldo en caso de desconexión
let TASA_USD_VES = 40.00; 
let TASA_EUR_VES = 43.50; 

async function obtenerTasasActuales() {
    const displayUSD = document.getElementById('display-tasa');
    const displayEUR = document.getElementById('display-tasa-eur');

    const apis = [
        "https://open.er-api.com/v6/latest/USD",
        "https://api.exchangerate-api.com/v4/latest/USD"
    ];

    let exito = false;

    for (let url of apis) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error en red");
            
            const data = await response.json();
            
            if (data && data.rates && data.rates.VES && data.rates.EUR) {
                // Tasa directa USD a Bolívares
                TASA_USD_VES = parseFloat(data.rates.VES);
                
                // Calculamos Euro a Bolívares usando el cruce de monedas de la API
                // Tasa EUR_VES = Tasa USD_VES / Tasa USD_EUR
                TASA_EUR_VES = TASA_USD_VES / parseFloat(data.rates.EUR);
                
                exito = true;
                console.log(`Tasas actualizadas desde ${url}: USD=${TASA_USD_VES} | EUR=${TASA_EUR_VES}`);
                break;
            }
        } catch (error) {
            console.warn(`No se pudo con ${url}, intentando respaldo...`);
        }
    }

    if (!exito) {
        console.error("Usando tasas de cambio predeterminadas fijas.");
    }

    // Renderizar en el menú superior
    displayUSD.textContent = TASA_USD_VES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    displayEUR.textContent = TASA_EUR_VES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Gestión de Vistas / Pestañas
function changeView(viewName) {
    document.getElementById('view-home').classList.add('hidden');
    document.getElementById('view-simple').classList.add('hidden');
    document.getElementById('view-compound').classList.add('hidden');

    const navButtons = ['nav-simple', 'nav-compound'];
    navButtons.forEach(id => document.getElementById(id).classList.remove('bg-blue-800'));

    document.getElementById('view-' + viewName).classList.remove('hidden');
    if(viewName !== 'home') {
        document.getElementById('nav-' + viewName).classList.add('bg-blue-800');
    }
}

// Formateadores de moneda
function formatUSD(val) { return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatBS(val) { return 'Bs ' + val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatEUR(val) { return '€' + val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatPercent(val) { return (val * 100).toLocaleString('en-US', { maximumFractionDigits: 4 }) + '%'; }

function formatCustomTime(val, modeId) {
    const select = document.getElementById(modeId);
    const text = select.options[select.selectedIndex].text.split(' ')[0]; 
    return val.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' ' + text;
}

function updateSimpleLabels() {
    const select = document.getElementById('sim-m');
    const text = select.options[select.selectedIndex].text;
    document.getElementById('label-sim-t').textContent = `Tiempo (n) (${text})`;
}

function updateCompoundLabels() {
    const select = document.getElementById('cmp-m');
    let text = select.options[select.selectedIndex].text.split(' ')[0];
    document.getElementById('label-cmp-t').textContent = `Tiempo total (n) (${text})`;
}

// =========================================================================
// LÓGICA DE INTERÉS SIMPLE
// =========================================================================
function toggleSimpleFields() {
    const target = document.getElementById('sim-target').value;
    
    document.getElementById('box-sim-P').classList.toggle('hidden', target === 'P');
    document.getElementById('box-sim-F').classList.toggle('hidden', target !== 'i' && target !== 'n' && target !== 'P');
    document.getElementById('box-sim-I').classList.toggle('hidden', target !== 'F' && target !== 'i' && target !== 'n' && target !== 'P');
    document.getElementById('box-sim-i').classList.toggle('hidden', target === 'i');
    document.getElementById('box-sim-n').classList.toggle('hidden', target === 'n');
    
    document.getElementById('sim-p').required = (target !== 'P');
    document.getElementById('sim-f').required = (target === 'i' || target === 'n');
    document.getElementById('sim-r').required = (target !== 'i');
    document.getElementById('sim-t').required = (target !== 'n');

    document.getElementById('res-simple-container').classList.add('hidden');
    updateSimpleLabels();
}

function calcSimple(event) {
    event.preventDefault();
    const target = document.getElementById('sim-target').value;
    
    let p = parseFloat(document.getElementById('sim-p').value);
    let f = parseFloat(document.getElementById('sim-f').value);
    let iMoney = parseFloat(document.getElementById('sim-i-money').value);
    let r = parseFloat(document.getElementById('sim-r').value) / 100; 
    let t = parseFloat(document.getElementById('sim-t').value);
    let m = parseFloat(document.getElementById('sim-m').value); 

    let resultValue = 0;
    let isMonetary = true;
    let labelText = "";

    switch(target) {
        case 'F': 
            resultValue = p * (1 + (r * (t / m)));
            labelText = "Valor Futuro (F):";
            break;
        case 'I': 
            resultValue = p * r * (t / m);
            labelText = "Interés Generado (I):";
            break;
        case 'P': 
            if (!isNaN(f) && f > 0) {
                resultValue = f / (1 + (r * (t / m))); 
            } else if (!isNaN(iMoney) && iMoney > 0) {
                resultValue = iMoney / (r * (t / m)); 
            } else {
                alert("Rellena el campo Valor Futuro (F) o Interés ganado (I) para despejar P.");
                return;
            }
            labelText = "Capital Inicial (P):";
            break;
        case 'i': 
            if (!isNaN(f) && f > 0) {
                resultValue = ((f / p) - 1) / (t / m);
            } else if (!isNaN(iMoney) && iMoney > 0) {
                resultValue = iMoney / (p * (t / m));
            } else {
                alert("Ingresa F o I para resolver el despeje de la Tasa.");
                return;
            }
            isMonetary = false;
            labelText = "Tasa de Interés Anual (i):";
            break;
        case 'n': 
            if (!isNaN(f) && f > 0) {
                let tAnual = ((f / p) - 1) / r;
                resultValue = tAnual * m; 
            } else if (!isNaN(iMoney) && iMoney > 0) {
                let tAnual = iMoney / (p * r);
                resultValue = tAnual * m;
            } else {
                alert("Ingresa F o I para resolver el despeje del Tiempo.");
                return;
            }
            isMonetary = false;
            labelText = "Tiempo Estimado (n):";
            break;
    }

    document.getElementById('res-sim-label').textContent = labelText;
    if (isMonetary) {
        let valorEnBs = resultValue * TASA_USD_VES;
        let valorEnEur = valorEnBs / TASA_EUR_VES;

        document.getElementById('res-sim-value').textContent = formatUSD(resultValue);
        document.getElementById('res-sim-bs').textContent = formatBS(valorEnBs);
        document.getElementById('res-sim-eur').textContent = formatEUR(valorEnEur);
        document.getElementById('res-sim-multi-currency').classList.remove('hidden');
    } else {
        document.getElementById('res-sim-value').textContent = (target === 'i') ? formatPercent(resultValue) : formatCustomTime(resultValue, 'sim-m');
        document.getElementById('res-sim-multi-currency').classList.add('hidden');
    }
    document.getElementById('res-simple-container').classList.remove('hidden');
}

// =========================================================================
// LÓGICA DE INTERÉS COMPUESTO
// =========================================================================
function toggleCompoundFields() {
    const target = document.getElementById('cmp-target').value;

    document.getElementById('box-cmp-P').classList.toggle('hidden', target === 'P');
    document.getElementById('box-cmp-F').classList.toggle('hidden', target !== 'P' && target !== 'i' && target !== 'n');
    document.getElementById('box-cmp-i').classList.toggle('hidden', target === 'i');
    document.getElementById('box-cmp-n').classList.toggle('hidden', target === 'n');

    document.getElementById('cmp-p').required = (target !== 'P');
    document.getElementById('cmp-f').required = (target !== 'F');
    document.getElementById('cmp-r').required = (target !== 'i');
    document.getElementById('cmp-t').required = (target !== 'n');

    document.getElementById('res-compound-container').classList.add('hidden');
    updateCompoundLabels();
}

function calcCompound(event) {
    event.preventDefault();
    const target = document.getElementById('cmp-target').value;

    let p = parseFloat(document.getElementById('cmp-p').value);
    let f = parseFloat(document.getElementById('cmp-f').value);
    let r = parseFloat(document.getElementById('cmp-r').value) / 100;
    let t = parseFloat(document.getElementById('cmp-t').value);
    let m = parseFloat(document.getElementById('cmp-m').value); 

    let resultValue = 0;
    let isMonetary = true;
    let labelText = "";

    switch(target) {
        case 'F': 
            resultValue = p * Math.pow((1 + (r / m)), t);
            labelText = "Monto Acumulado / Futuro (F):";
            break;
        case 'P': 
            resultValue = f / Math.pow((1 + (r / m)), t);
            labelText = "Capital Inicial / Presente (P):";
            break;
        case 'i': 
            let exponenteI = 1 / t;
            let tasaPeriodo = Math.pow((f / p), exponenteI) - 1;
            resultValue = tasaPeriodo * m; 
            isMonetary = false;
            labelText = "Tasa Nominal Anual (i):";
            break;
        case 'n': 
            let numerador = Math.log(f / p);
            let denominador = Math.log(1 + (r / m));
            resultValue = numerador / denominador; 
            isMonetary = false;
            labelText = "Tiempo Necesario (n):";
            break;
    }

    document.getElementById('res-cmp-label').textContent = labelText;
    if (isMonetary) {
        let valorEnBs = resultValue * TASA_USD_VES;
        let valorEnEur = valorEnBs / TASA_EUR_VES;

        document.getElementById('res-cmp-value').textContent = formatUSD(resultValue);
        document.getElementById('res-cmp-bs').textContent = formatBS(valorEnBs);
        document.getElementById('res-cmp-eur').textContent = formatEUR(valorEnEur);
        document.getElementById('res-cmp-multi-currency').classList.remove('hidden');
    } else {
        document.getElementById('res-cmp-value').textContent = (target === 'i') ? formatPercent(resultValue) : formatCustomTime(resultValue, 'cmp-m');
        document.getElementById('res-cmp-multi-currency').classList.add('hidden');
    }
    document.getElementById('res-compound-container').classList.remove('hidden');
}

// Inicialización de la App
obtenerTasasActuales();
toggleSimpleFields();
toggleCompoundFields();