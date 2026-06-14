// =========================================================================
// CONFIGURACIÓN GLOBAL Y ACTUALIZACIÓN DE TASAS EN VIVO (PERSISTENCIA OFFLINE)
// =========================================================================
// 1. Intentamos leer la última tasa guardada con éxito en el navegador. 
//    Si no existe (primera vez que abre la app sin internet), usa los valores base (40.00 y 43.50).
let TASA_USD_VES = parseFloat(localStorage.getItem('LAST_TASA_USD')) || 40.00; 
let TASA_EUR_VES = parseFloat(localStorage.getItem('LAST_TASA_EUR')) || 43.50; 

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
            // Establecemos un tiempo límite (timeout) corto para que no se quede colgado cargando sin internet
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 segundos máximo

            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) stroke(new Error("Error en red"));
            
            const data = await response.json();
            
            if (data && data.rates && data.rates.VES && data.rates.EUR) {
                TASA_USD_VES = parseFloat(data.rates.VES);
                TASA_EUR_VES = TASA_USD_VES / parseFloat(data.rates.EUR);
                exito = true;
                
                // ¡ESTA ES LA CLAVE! Guardamos con éxito la última actualización en el navegador
                localStorage.setItem('LAST_TASA_USD', TASA_USD_VES);
                localStorage.setItem('LAST_TASA_EUR', TASA_EUR_VES);

                console.log(`Tasas actualizadas desde ${url}: USD=${TASA_USD_VES} | EUR=${TASA_EUR_VES}`);
                break;
            }
        } catch (error) {
            console.warn(`No se pudo conectar con ${url} (Modo Offline o Error de Red)`);
        }
    }

    if (!exito) {
        console.warn("Aplicación Offline. Se mantendrán intactas las tasas de la última sesión exitosa.");
    }

    // Al final, pinte lo que se haya rescatado (la nueva de internet o la última guardada en el localStorage)
    if (displayUSD) displayUSD.textContent = TASA_USD_VES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (displayEUR) displayEUR.textContent = TASA_EUR_VES.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// =========================================================================
// CONTROL DEL MENÚ LATERAL (SIDEBAR) Y VISTAS (CORREGIDO PARA CSS NATIVO)
// =========================================================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    // Control de clases nativas CSS
    sidebar.classList.toggle('open');
    overlay.classList.toggle('active');
}

function selectInterestFromSidebar(viewName) {
    changeView(viewName);
    toggleSidebar(); 
}

// Gestión interna de Vistas - Asegura la limpieza total de pantallas
function changeView(viewName) {
    // 1. Ocultar absolutamente todas las secciones principales
    const views = ['view-home', 'view-simple', 'view-compound', 'view-single-payment', 'view-uniform-series'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });

    // 2. Quitar estilos activos de todos los botones del Sidebar usando la clase nativa
    const sideButtons = ['side-home', 'side-simple', 'side-compound', 'side-single', 'side-uniform'];
    sideButtons.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.remove('active');
    });

    // 3. Mostrar sección solicitada quitando el 'hidden'
    const activeView = document.getElementById('view-' + viewName);
    if (activeView) activeView.classList.remove('hidden');
    
    // 4. Activar botón correspondiente en el Sidebar mapeando su alias corto
    let sideId = 'side-' + viewName;
    if (viewName === 'single-payment') sideId = 'side-single';
    if (viewName === 'uniform-series') sideId = 'side-uniform';

    const activeBtn = document.getElementById(sideId);
    if (activeBtn) activeBtn.classList.add('active');
}

// Formateadores de moneda e indicadores
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
}

function calcCompound(event) {
    event.preventDefault();
    const target = document.getElementById('cmp-target').value;

    let p = parseFloat(document.getElementById('cmp-p').value);
    let f = parseFloat(document.getElementById('cmp-f').value);
    let r = parseFloat(document.getElementById('cmp-r').value) / 100;
    let t = parseFloat(document.getElementById('cmp-t').value);
    let m = parseFloat(document.getElementById('cmp-m') ? document.getElementById('cmp-m').value : 1); 

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
        if(document.getElementById('res-cmp-multi-currency')) {
            document.getElementById('res-cmp-multi-currency').classList.remove('hidden');
        }
    } else {
        document.getElementById('res-cmp-value').textContent = (target === 'i') ? formatPercent(resultValue) : resultValue.toFixed(2) + ' Períodos';
        if(document.getElementById('res-cmp-multi-currency')) {
            document.getElementById('res-cmp-multi-currency').classList.add('hidden');
        }
    }
    document.getElementById('res-compound-container').classList.remove('hidden');
}

// =========================================================================
// FACTORES DE PAGOS ÚNICOS
// =========================================================================
function toggleSinglePaymentFields() {
    const type = document.getElementById('single-factor-type').value;
    document.getElementById('box-single-P').classList.toggle('hidden', type === 'P/F');
    document.getElementById('box-single-F').classList.toggle('hidden', type === 'F/P');
    
    document.getElementById('single-p').required = (type === 'F/P');
    document.getElementById('single-f').required = (type === 'P/F');
    document.getElementById('res-single-container').classList.add('hidden');
}

function calcSinglePayment(event) {
    event.preventDefault();
    const type = document.getElementById('single-factor-type').value;
    
    let i = parseFloat(document.getElementById('single-i').value) / 100;
    let n = parseFloat(document.getElementById('single-n').value);
    
    let resultValue = 0;
    let factorCalculado = 0;
    let labelText = "";

    if (type === 'F/P') {
        let p = parseFloat(document.getElementById('single-p').value);
        factorCalculado = Math.pow(1 + i, n);
        resultValue = p * factorCalculado;
        labelText = "Valor Futuro Calculado (F):";
    } else {
        let f = parseFloat(document.getElementById('single-f').value);
        factorCalculado = Math.pow(1 + i, -n);
        resultValue = f * factorCalculado;
        labelText = "Valor Presente Calculado (P):";
    }

    document.getElementById('res-single-factor-text').textContent = `(${type}, ${(i*100).toFixed(2)}%, ${n}) = ${factorCalculado.toFixed(5)}`;
    document.getElementById('res-single-label').textContent = labelText;
    document.getElementById('res-single-value').textContent = formatUSD(resultValue);
    
    document.getElementById('res-single-container').classList.remove('hidden');
}

// =========================================================================
// SERIES UNIFORMES (ANUALIDADES)
// =========================================================================
function toggleUniformFields() {
    const type = document.getElementById('uniform-factor-type').value;
    
    document.getElementById('box-uniform-A').classList.toggle('hidden', type === 'A/P' || type === 'A/F');
    document.getElementById('box-uniform-P').classList.toggle('hidden', type === 'P/A' || type === 'F/A' || type === 'A/F');
    document.getElementById('box-uniform-F').classList.toggle('hidden', type === 'P/A' || type === 'A/P' || type === 'F/A');
    
    document.getElementById('uniform-a').required = (type === 'P/A' || type === 'F/A');
    document.getElementById('uniform-p').required = (type === 'A/P');
    document.getElementById('uniform-f').required = (type === 'A/F');
    document.getElementById('res-uniform-container').classList.add('hidden');
}

function calcUniformSeries(event) {
    event.preventDefault();
    const type = document.getElementById('uniform-factor-type').value;
    
    let i = parseFloat(document.getElementById('uniform-i').value) / 100;
    let n = parseFloat(document.getElementById('uniform-n').value);
    
    let resultValue = 0;
    let factorCalculado = 0;
    let labelText = "";

    if (i === 0) { alert("La tasa de interés debe ser mayor a 0%"); return; }

    switch (type) {
        case 'P/A':
            let a_pa = parseFloat(document.getElementById('uniform-a').value);
            factorCalculado = (Math.pow(1 + i, n) - 1) / (i * Math.pow(1 + i, n));
            resultValue = a_pa * factorCalculado;
            labelText = "Valor Presente Equivalente (P):";
            break;
        case 'A/P':
            let p_ap = parseFloat(document.getElementById('uniform-p').value);
            factorCalculado = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
            resultValue = p_ap * factorCalculado;
            labelText = "Anualidad / Pago Uniforme (A):";
            break;
        case 'F/A':
            let a_fa = parseFloat(document.getElementById('uniform-a').value);
            factorCalculado = (Math.pow(1 + i, n) - 1) / i;
            resultValue = a_fa * factorCalculado;
            labelText = "Valor Futuro Acumulado (F):";
            break;
        case 'A/F':
            let f_af = parseFloat(document.getElementById('uniform-f').value);
            factorCalculado = i / (Math.pow(1 + i, n) - 1);
            resultValue = f_af * factorCalculado;
            labelText = "Depósito Uniforme / Fondo (A):";
            break;
    }

    document.getElementById('res-uniform-factor-text').textContent = `(${type}, ${(i*100).toFixed(2)}%, ${n}) = ${factorCalculado.toFixed(5)}`;
    document.getElementById('res-uniform-label').textContent = labelText;
    document.getElementById('res-uniform-value').textContent = formatUSD(resultValue);
    
    document.getElementById('res-uniform-container').classList.remove('hidden');
}

// =========================================================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =========================================================================
obtenerTasasActuales();
toggleSimpleFields();
toggleCompoundFields();
toggleSinglePaymentFields();
toggleUniformFields();