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
    ['inicio','simple','compound','single','uniform','rates','costs','evaluacion','alternativas'].forEach(x => {
        if(document.getElementById(`section-${x}`)) document.getElementById(`section-${x}`).classList.add('hidden');
        if(document.getElementById(`nav-${x}`)) document.getElementById(`nav-${x}`).classList.remove('active');
    });
    if(document.getElementById(`section-${v}`)) document.getElementById(`section-${v}`).classList.remove('hidden');
    if(document.getElementById(`nav-${v}`)) document.getElementById(`nav-${v}`).classList.add('active');
}

// =========================================================================
// DESGLOSE DINÁMICO DE CONCEPTOS EN EL INICIO (GLOSARIO)
// =========================================================================
const GLOSARIO_TEMAS = {
    simple: {
        titulo: "Concepto de Interés Simple",
        color: "var(--color-simple)",
        cuerpo: `
            <p>El <strong>Interés Simple</strong> es un método financiero donde los rendimientos generados durante un tiempo determinado se calculan <strong>únicamente sobre el capital inicial (P)</strong>. Esto significa que los intereses ganados no se acumulan para generar nuevos intereses en el siguiente período.</p>
            <h4 style="margin-top:1rem; font-weight:700;">Fórmula Base de Valor Futuro:</h4>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:1.1rem; text-align:center;">
                Vf = P * (1 + i * t)
            </div>
            <p style="margin-top:1rem;"><strong>Características Principales:</strong></p>
            <ul style="margin-left:1.5rem; margin-top:0.5rem;">
                <li>La tasa de interés (i) y el tiempo (t) deben estar expresados en la misma unidad de tiempo.</li>
                <li>Los intereses cobrados o pagados son constantes en cada período.</li>
                <li>Es el método más común para préstamos a corto plazo, depósitos temporales o compras financiadas sencillas.</li>
            </ul>
        `
    },
    compound: {
        titulo: "Concepto de Interés Compuesto",
        color: "var(--color-compound)",
        cuerpo: `
            <p>El <strong>Interés Compuesto</strong> representa la acumulación sistemática de rendimientos. Aquí, los intereses devengados al final de cada período de capitalización <strong>se suman al capital original</strong>, pasando a formar un nuevo capital sobre el cual se calcularán los intereses del período siguiente (anatocismo o interés sobre interés).</p>
            <h4 style="margin-top:1rem; font-weight:700;">Fórmula Base:</h4>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:1.1rem; text-align:center;">
                Vf = P * (1 + i/m)<sup>n</sup>
            </div>
            <p style="margin-top:1rem;"><strong>Características Principales:</strong></p>
            <ul style="margin-left:1.5rem; margin-top:0.5rem;">
                <li>El capital base cambia constantemente al finalizar cada período de capitalización.</li>
                <li>Muestra un crecimiento exponencial en el tiempo, a diferencia del crecimiento lineal del interés simple.</li>
                <li>Es el estándar del sistema bancario moderno, cuentas de ahorro a largo plazo, fondos mutuos e inversiones de capital.</li>
            </ul>
        `
    },
    single: {
        titulo: "Concepto de Pagos Únicos",
        color: "var(--color-single)",
        cuerpo: `
            <p>Los <strong>Pagos Únicos</strong> analizan el comportamiento y el valor del dinero a través del tiempo considerando un único flujo de efectivo en el presente (P) y otro único en el futuro (F). Se enfoca en resolver "cuánto vale hoy un dinero del futuro" o "cuánto valdrá en el futuro lo que invierto hoy".</p>
            <h4 style="margin-top:1rem; font-weight:700;">Factores de Desplazamiento:</h4>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:1rem; display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem; text-align:center;">
                <div>Factor F/P: F = P*(1+i)<sup>n</sup></div>
                <div>Factor P/F: P = F / (1+i)<sup>n</sup></div>
            </div>
            <p style="margin-top:1rem;"><strong>Características Principales:</strong></p>
            <ul style="margin-left:1.5rem; margin-top:0.5rem;">
                <li>Permite calcular equivalencias directas entre dos puntos discretos en el tiempo.</li>
                <li>Se utiliza como el cimiento conceptual para comprender el Valor Actual Neto (VAN) y la evaluación de proyectos de inversión.</li>
            </ul>
        `
    },
    uniform: {
        titulo: "Concepto de Series Uniformes",
        color: "var(--color-uniform)",
        cuerpo: `
            <p>Las <strong>Series Uniformes</strong> (también llamadas <em>Anualidades</em>) consisten en una serie de flujos de efectivo o pagos que poseen exactamente el **mismo monto de dinero (A)** y ocurren a intervalos de tiempo constantes y regulares (mensual, bimestral, trimestral, semestral o anual).</p>
            <h4 style="margin-top:1rem; font-weight:700;">Tipos de Serie:</h4>
            <ul style="margin-left:1.5rem; margin-top:0.5rem; margin-bottom:1rem;">
                <li><strong>Vencida:</strong> Los pagos se efectúan al finalizar cada intervalo (ej: cuotas de un crédito tradicional).</li>
                <li><strong>Anticipada:</strong> Los pagos se efectúan al inicio de cada intervalo (ej: alquiler de un inmueble).</li>
            </ul>
            <p><strong>Uso Común:</strong> Permite planificar amortizaciones de créditos vehiculares, hipotecarios, rentas estables, o el establecimiento de fondos de jubilación continuos.</p>
        `
    },
    rates: {
        titulo: "Concepto de Tasas Equivalentes",
        color: "var(--color-rates)",
        cuerpo: `
            <p>La **Homologación de Tasas de Interés** permite comparar o convertir diferentes ofertas de financiamiento que operan bajo distintas bases temporales o periodos de capitalización. Dos tasas son equivalentes si, operando sobre un mismo capital durante el mismo plazo, producen el mismo rendimiento final.</p>
            <h4 style="margin-top:1rem; font-weight:700;">Fórmula Nominal a Efectiva:</h4>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:1.1rem; text-align:center;">
                TEA = (1 + TNA/m)<sup>m</sup> - 1
            </div>
            <p style="margin-top:1rem;"><strong>Diferencia Esencial:</strong></p>
            <ul style="margin-left:1.5rem; margin-top:0.5rem;">
                <li><strong>Tasa Nominal Anual (TNA):</strong> Es una tasa teórica o de referencia que no considera la reinversión de intereses internos.</li>
                <li><strong>Tasa Efectiva Anual (TEA):</strong> Es la rentabilidad o costo real neto del año, incorporando de forma exacta el efecto multiplicador de la capitalización compuesta.</li>
            </ul>
        `
    },
    costs: {
        titulo: "Concepto de Estimación de Costos",
        color: "var(--color-costs)",
        cuerpo: `
            <p>El **Análisis de Costos y Punto de Equilibrio** evalúa la viabilidad comercial de una producción industrial o comercialización de servicios. Permite determinar el volumen de actividad mínimo indispensable para que la empresa no obtenga pérdidas.</p>
            <h4 style="margin-top:1rem; font-weight:700;">Fórmula del Punto de Equilibrio (en Q):</h4>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:1.1rem; text-align:center;">
                PE = CF / (PVU - CVU)
            </div>
            <p style="margin-top:1rem;">Donde la diferencia <em>(PVU - CVU)</em> representa el margen de contribución marginal unitario que amortiza los costos fijos totales de la estructura corporativa.</p>
        `
    },
    evaluacion: {
        titulo: "Tema V: Técnicas de Evaluación de Proyectos",
        color: "var(--color-evaluacion)",
        cuerpo: `
            <p>La <strong>Evaluación Económica de Proyectos</strong> comprende herramientas financieras indispensables para juzgar la conveniencia de una inversión de capital.</p>
            <ul style="margin-left:1.5rem; margin-top:0.5rem; line-height: 1.6;">
                <li><strong>Valor Presente Neto (VPN):</strong> Mide el valor excedente en el presente tras descontar los flujos a la tasa mínima requerida (TREMA). Si VPN &ge; 0, el proyecto se acepta.</li>
                <li><strong>Valor Anual (VA):</strong> Expresa todos los ingresos y egresos en una serie uniforme equivalente temporal.</li>
                <li><strong>Tasa Interna de Retorno (TIR):</strong> La tasa interna a la cual el VPN se iguala a cero. Debe ser superior a la TREMA para autorizar la inversión.</li>
                <li><strong>Periodo de Recuperación (PRI):</strong> El tiempo requerido para que los flujos acumulados descontados recuperen el desembolso inicial.</li>
            </ul>
        `
    },
    alternativas: {
        titulo: "Tema VI: Selección de Alternativas",
        color: "var(--color-alternativas)",
        cuerpo: `
            <p>La <strong>Selección de Alternativas de Inversión</strong> permite decidir de forma objetiva entre proyectos mutuamente excluyentes.</p>
            <p style="margin-top: 0.5rem;">Cuando los proyectos poseen <strong>vidas útiles diferentes</strong>, la comparación directa de sus VPNs no es válida, pues operan sobre plazos desiguales. Para resolver esto se emplea el método del:</p>
            <ul style="margin-left:1.5rem; margin-top:0.5rem; line-height: 1.6;">
                <li><strong>Mínimo Común Múltiplo (MCM):</strong> Se repiten en cadena los ciclos de vida útil de cada alternativa hasta alcanzar un horizonte de estudio unificado (MCM de los años de vida útil). Las reinversiones iniciales correspondientes se aplican en cada ciclo de renovación.</li>
                <li><strong>Valor Anual Equivalente (VA):</strong> Permite calcular el costo o ganancia equivalente temporal, siendo este un criterio directo y automático sin necesidad de expandir los periodos.</li>
            </ul>
        `
    }
};

function mostrarConceptoHome(tema) {
    let d = GLOSARIO_TEMAS[tema];
    if(!d) return;
    
    document.getElementById('concept-detail-header').style.backgroundColor = d.color;
    document.getElementById('concept-detail-title').textContent = d.titulo;
    document.getElementById('concept-detail-body').innerHTML = d.cuerpo;
    
    let el = document.getElementById('home-concept-detail');
    el.classList.remove('hidden');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function cerrarConceptoHome() {
    document.getElementById('home-concept-detail').classList.add('hidden');
}

// =========================================================================
// OPERACIONES LÓGICAS DE LOS FORMULARIOS
// =========================================================================

// INTERÉS SIMPLE (Ajustado sin Interés Ganado I)
function checkSimple() {
    let t = document.getElementById('simple-target').value;
    ['s-g-p','s-g-i','s-g-t','s-g-vf'].forEach(x => document.getElementById(x).classList.remove('hidden'));
    
    if(t === 'Vf') { document.getElementById('s-g-vf').classList.add('hidden'); }
    else if(t === 'P') { document.getElementById('s-g-p').classList.add('hidden'); }
    else if(t === 'i') { document.getElementById('s-g-i').classList.add('hidden'); }
    else if(t === 't') { document.getElementById('s-g-t').classList.add('hidden'); }
}

function runSimple() {
    let target = document.getElementById('simple-target').value;
    let P = parseFloat(document.getElementById('simple-p').value) || 0;
    let i = (parseFloat(document.getElementById('simple-i').value) || 0) / 100;
    let t = parseFloat(document.getElementById('simple-t').value) || 0;
    let unit = parseFloat(document.getElementById('simple-t-unit').value) || 1;
    let Vf = parseFloat(document.getElementById('simple-vf').value) || 0;

    let tAjustado = t * unit;
    let ans = 0, lbl = "";

    if (target === 'Vf') {
        ans = P * (1 + i * tAjustado);
        lbl = "Valor Futuro Acumulado (Vf):";
    } else if (target === 'P') {
        ans = Vf / (1 + i * tAjustado);
        lbl = "Capital Inicial Requerido (P):";
    } else if (target === 'i') {
        ans = ((Vf / P - 1) / tAjustado) * 100;
        lbl = "Tasa de Interés Nominal (%):";
    } else if (target === 't') {
        ans = ((Vf / P - 1) / i) / unit;
        lbl = "Tiempo Estimado del Período:";
    }

    document.getElementById('lbl-simple-res').textContent = lbl;
    if (target === 'i') {
        document.getElementById('res-simple-main').textContent = ans.toFixed(4) + " %";
        document.getElementById('divisas-simple').classList.add('hidden');
    } else if (target === 't') {
        document.getElementById('res-simple-main').textContent = ans.toFixed(2) + " Períodos";
        document.getElementById('divisas-simple').classList.add('hidden');
    } else {
        document.getElementById('res-simple-main').textContent = ans.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
        document.getElementById('divisas-simple').classList.remove('hidden');
        pintarDivisas('res-simple-usd', 'res-simple-eur', ans);
    }
    document.getElementById('results-simple').classList.remove('hidden');
}

// INTERÉS COMPUESTO
function checkCompound() {
    let t = document.getElementById('compound-target').value;
    ['c-g-p','c-g-i','c-g-n','c-g-vf'].forEach(x => document.getElementById(x).classList.remove('hidden'));
    
    if(t === 'Vf') document.getElementById('c-g-vf').classList.add('hidden');
    else if(t === 'P') document.getElementById('c-g-p').classList.add('hidden');
    else if(t === 'i') document.getElementById('c-g-i').classList.add('hidden');
    else if(t === 'n') document.getElementById('c-g-n').classList.add('hidden');
}

function runCompound() {
    let target = document.getElementById('compound-target').value;
    let P = parseFloat(document.getElementById('compound-p').value) || 0;
    let iNom = (parseFloat(document.getElementById('compound-i').value) || 0) / 100;
    let tUnidades = parseFloat(document.getElementById('compound-n').value) || 0;
    let m = parseFloat(document.getElementById('compound-m').value) || 1;
    let Vf = parseFloat(document.getElementById('compound-vf').value) || 0;

    let nTotal = tUnidades * m;
    let iPeriodo = iNom / m;
    let ans = 0, lbl = "";

    if (target === 'Vf') {
        ans = P * Math.pow(1 + iPeriodo, nTotal);
        lbl = "Valor Futuro Acumulado (Vf):";
    } else if (target === 'P') {
        ans = Vf / Math.pow(1 + iPeriodo, nTotal);
        lbl = "Capital Inicial Base (P):";
    } else if (target === 'i') {
        ans = (Math.pow(Vf / P, 1 / nTotal) - 1) * m * 100;
        lbl = "Tasa Nominal Base (%):";
    } else if (target === 'n') {
        ans = (Math.log(Vf / P) / Math.log(1 + iPeriodo)) / m;
        lbl = "Tiempo en Bloques Necesarios:";
    }

    document.getElementById('lbl-compound-res').textContent = lbl;
    if (target === 'i') {
        document.getElementById('res-compound-main').textContent = ans.toFixed(4) + " %";
        document.getElementById('divisas-compound').classList.add('hidden');
    } else if (target === 'n') {
        document.getElementById('res-compound-main').textContent = ans.toFixed(2) + " Periodos Base";
        document.getElementById('divisas-compound').classList.add('hidden');
    } else {
        document.getElementById('res-compound-main').textContent = ans.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
        document.getElementById('divisas-compound').classList.remove('hidden');
        pintarDivisas('res-compound-usd', 'res-compound-eur', ans);
    }
    document.getElementById('results-compound').classList.remove('hidden');
}

// PAGOS ÚNICOS
function checkSingle() {
    let t = document.getElementById('single-target').value;
    if(t === 'F') {
        document.getElementById('sg-g-p').classList.remove('hidden');
        document.getElementById('sg-g-f').classList.add('hidden');
    } else {
        document.getElementById('sg-g-p').classList.add('hidden');
        document.getElementById('sg-g-f').classList.remove('hidden');
    }
}

function runSingle() {
    let target = document.getElementById('single-target').value;
    let P = parseFloat(document.getElementById('single-p').value) || 0;
    let F = parseFloat(document.getElementById('single-f').value) || 0;
    let i = (parseFloat(document.getElementById('single-i').value) || 0) / 100;
    let n = parseFloat(document.getElementById('single-n').value) || 0;

    let unidadSelect = document.getElementById('single-unidad-tiempo');
    let unidadTexto = unidadSelect ? unidadSelect.options[unidadSelect.selectedIndex].text : 'períodos';

    let ans = 0, lbl = "";
    if (target === 'F') {
        ans = P * Math.pow(1 + i, n);
        lbl = "Valor Futuro Obtenido (F):";
    } else {
        ans = F / Math.pow(1 + i, n);
        lbl = "Valor Presente Obtenido (P):";
    }

    document.getElementById('lbl-single-res').textContent = lbl;
    document.getElementById('res-single-main').textContent = ans.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
    
    let detalleBox = document.getElementById('res-single-detalle');
    if (detalleBox) {
        detalleBox.innerHTML = `* Calculado para <strong>${n} ${unidadTexto.toLowerCase()}</strong> a una tasa del <strong>${(i * 100)}% por período ${unidadTexto.toLowerCase()}</strong>.`;
    }

    pintarDivisas('res-single-usd', 'res-single-eur', ans);
    document.getElementById('results-single').classList.remove('hidden');
}

// SERIES UNIFORMES
function checkUniform() {
    let t = document.getElementById('uniform-target').value;
    ['u-g-a','u-g-p','u-g-f'].forEach(x => document.getElementById(x).classList.remove('hidden'));
    
    if (t === 'P' || t === 'F') { document.getElementById('u-g-p').classList.add('hidden'); document.getElementById('u-g-f').classList.add('hidden'); }
    else if (t === 'A_P') { document.getElementById('u-g-a').classList.add('hidden'); document.getElementById('u-g-f').classList.add('hidden'); }
    else if (t === 'A_F') { document.getElementById('u-g-a').classList.add('hidden'); document.getElementById('u-g-p').classList.add('hidden'); }
}

function runUniform() {
    let target = document.getElementById('uniform-target').value;
    let A = parseFloat(document.getElementById('uniform-a').value) || 0;
    let P = parseFloat(document.getElementById('uniform-p').value) || 0;
    let F = parseFloat(document.getElementById('uniform-f').value) || 0;
    let i = (parseFloat(document.getElementById('uniform-i').value) || 0) / 100;
    let n = parseFloat(document.getElementById('uniform-n').value) || 0;

    let ans = 0, lbl = "";
    let f1 = Math.pow(1 + i, n);

    if (target === 'P') {
        ans = A * ((f1 - 1) / (i * f1));
        lbl = "Valor Presente Unificado (P):";
    } else if (target === 'F') {
        ans = A * ((f1 - 1) / i);
        lbl = "Valor Futuro Acumulado (F):";
    } else if (target === 'A_P') {
        ans = P * ((i * f1) / (f1 - 1));
        lbl = "Pago / Cuota Requerida (A):";
    } else if (target === 'A_F') {
        ans = F * (i / (f1 - 1));
        lbl = "Fondo de Ahorro Periódico (A):";
    }

    document.getElementById('lbl-uniform-res').textContent = lbl;
    document.getElementById('res-uniform-main').textContent = ans.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
    pintarDivisas('res-uniform-usd', 'res-uniform-eur', ans);
    document.getElementById('results-uniform').classList.remove('hidden');
}

// TASAS EQUIVALENTES
function runRates() {
    let target = document.getElementById('rates-target').value;
    let val = parseFloat(document.getElementById('rates-val').value) || 0;
    let m = parseFloat(document.getElementById('rates-m').value) || 1;
    let mDest = parseFloat(document.getElementById('rates-m-dest').value) || 1;

    let ans = 0;
    if (target === 'nom_eff') {
        ans = (Math.pow(1 + (val / 100) / m, m) - 1) * 100;
    } else if (target === 'eff_nom') {
        ans = (Math.pow(1 + (val / 100), 1 / m) - 1) * m * 100;
    } else if (target === 'eff_eff') {
        ans = (Math.pow(1 + (val / 100), mDest / m) - 1) * 100;
    }

    document.getElementById('res-rates-main').textContent = ans.toFixed(4) + " %";
    document.getElementById('results-rates').classList.remove('hidden');
}

// ESTIMACIÓN DE COSTOS
function runCosts() {
    let cf = parseFloat(document.getElementById('costs-cf').value) || 0;
    let cvu = parseFloat(document.getElementById('costs-cvu').value) || 0;
    let pvu = parseFloat(document.getElementById('costs-pvu').value) || 0;
    let q = parseFloat(document.getElementById('costs-q').value) || 0;

    let cv = cvu * q;
    let ct = cf + cv;
    let it = pvu * q;
    let u = it - ct;

    let pe = (pvu - cvu) > 0 ? (cf / (pvu - cvu)) : 0;

    document.getElementById('res-costs-cvt').textContent = cv.toLocaleString('en-US',{minimumFractionDigits:2});
    document.getElementById('res-costs-ct').textContent = ct.toLocaleString('en-US',{minimumFractionDigits:2});
    document.getElementById('res-costs-it').textContent = it.toLocaleString('en-US',{minimumFractionDigits:2});
    document.getElementById('res-costs-u').textContent = u.toLocaleString('en-US',{minimumFractionDigits:2});
    document.getElementById('res-costs-pe').textContent = Math.ceil(pe).toLocaleString('en-US') + " Unidades";

    if (u < 0) {
        document.getElementById('res-costs-u').style.color = "#ef4444";
    } else {
        document.getElementById('res-costs-u').style.color = "#10b981";
    }

    pintarDivisas('res-costs-usd', 'res-costs-eur', u);
    document.getElementById('results-costs').classList.remove('hidden');
}

// =========================================================================
// OPERACIONES FINANCIERAS EVALUACIÓN DE PROYECTOS Y SELECCIÓN DE ALTERNATIVAS
// =========================================================================

function calcularTIRProyecto(inversion, flujo, vida, salvamento) {
    let low = -0.99, high = 5.0, mid = 0;
    for (let k = 0; k < 100; k++) {
        mid = (low + high) / 2;
        let vpnIter = -inversion;
        for (let t = 1; t <= vida; t++) {
            vpnIter += flujo / Math.pow(1 + mid, t);
        }
        vpnIter += salvamento / Math.pow(1 + mid, vida);
        
        if (Math.abs(vpnIter) < 0.0001) return mid * 100;
        if (vpnIter > 0) low = mid;
        else high = mid;
    }
    return mid * 100;
}

function obtenerMCD(a, b) { return !b ? a : obtenerMCD(b, a % b); }
function obtenerMCM(a, b) { return (a * b) / obtenerMCD(a, b); }

// EVALUACIÓN ECONÓMICA DE PROYECTOS
function runEvaluacion() {
    let P = parseFloat(document.getElementById('eval-inv').value) || 0;
    let F = parseFloat(document.getElementById('eval-flujo').value) || 0;
    let n = parseInt(document.getElementById('eval-vida').value) || 1;
    let S = parseFloat(document.getElementById('eval-rescate').value) || 0;
    let tmarPct = parseFloat(document.getElementById('eval-tmar').value) || 0;
    let i = tmarPct / 100;
    let target = document.getElementById('evaluacion-target').value;

    let vpn = -P;
    for(let t = 1; t <= n; t++) {
        vpn += F / Math.pow(1 + i, t);
    }
    vpn += S / Math.pow(1 + i, n);

    let factorAP = (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    let va = vpn * factorAP;

    let tir = calcularTIRProyecto(P, F, n, S);

    let acumulado = 0;
    let pri = n;
    let recuperado = false;
    for(let t = 1; t <= n; t++) {
        acumulado += F / Math.pow(1 + i, t);
        if(acumulado >= P) {
            pri = t;
            recuperado = true;
            break;
        }
    }

    let finalValue = 0;
    let textLabel = "";
    let hideConversion = false;

    if (target === 'vpn') {
        finalValue = vpn;
        textLabel = "Valor Presente Neto (VPN):";
    } else if (target === 'va') {
        finalValue = va;
        textLabel = "Valor Anual (VA):";
    } else if (target === 'tir') {
        finalValue = tir;
        textLabel = "TIR Obtenida del Ciclo:";
        hideConversion = true;
    } else if (target === 'pri') {
        finalValue = pri;
        textLabel = "Tiempo de Retorno (PRI):";
        hideConversion = true;
    }

    document.getElementById('lbl-eval-res').textContent = textLabel;
    
    if (hideConversion) {
        document.getElementById('divisas-evaluacion').classList.add('hidden');
        if (target === 'tir') {
            document.getElementById('res-eval-main').textContent = finalValue.toFixed(2) + " %";
        } else {
            document.getElementById('res-eval-main').textContent = (recuperado ? `${finalValue} Periodos` : "No se recupera en la vida útil");
        }
    } else {
        document.getElementById('divisas-evaluacion').classList.remove('hidden');
        document.getElementById('res-eval-main').textContent = finalValue.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
        pintarDivisas('res-eval-usd', 'res-eval-eur', finalValue);
    }

    let status = document.getElementById('res-eval-status');
    if (vpn >= 0) {
        status.textContent = "ACEPTABLE (El proyecto genera valor)";
        status.style.color = "#10b981";
    } else {
        status.textContent = "RECHAZADO (Pérdidas respecto a la TMAR)";
        status.style.color = "#ef4444";
    }

    document.getElementById('results-evaluacion').classList.remove('hidden');
}

// SELECCIÓN DE ALTERNATIVAS (MCM)
function runAlternativas() {
    let target = document.getElementById('alternativas-target').value;
    let i = (parseFloat(document.getElementById('alt-tmar').value) || 0) / 100;

    let invA = parseFloat(document.getElementById('alt-invA').value) || 0;
    let flujoA = parseFloat(document.getElementById('alt-flujoA').value) || 0;
    let vidaA = parseInt(document.getElementById('alt-vidaA').value) || 1;

    let invB = parseFloat(document.getElementById('alt-invB').value) || 0;
    let flujoB = parseFloat(document.getElementById('alt-flujoB').value) || 0;
    let vidaB = parseInt(document.getElementById('alt-vidaB').value) || 1;

    let mcm = obtenerMCM(vidaA, vidaB);

    let vpnMcmA = 0;
    for (let t = 0; t < mcm; t += vidaA) {
        vpnMcmA -= invA / Math.pow(1 + i, t);
        for (let f = 1; f <= vidaA; f++) {
            vpnMcmA += flujoA / Math.pow(1 + i, t + f);
        }
    }

    let vpnMcmB = 0;
    for (let t = 0; t < mcm; t += vidaB) {
        vpnMcmB -= invB / Math.pow(1 + i, t);
        for (let f = 1; f <= vidaB; f++) {
            vpnMcmB += flujoB / Math.pow(1 + i, t + f);
        }
    }

    let valPrincipal = 0;
    let textLabel = "";
    let hideConversion = false;

    if (target === 'decision') {
        textLabel = "Alternativa Ganadora:";
        hideConversion = true;
    } else if (target === 'mcm') {
        valPrincipal = mcm;
        textLabel = "Horizonte Común (MCM):";
        hideConversion = true;
    } else if (target === 'vpna') {
        valPrincipal = vpnMcmA;
        textLabel = "VPN Proyecto A (MCM):";
    } else if (target === 'vpnb') {
        valPrincipal = vpnMcmB;
        textLabel = "VPN Proyecto B (MCM):";
    }

    document.getElementById('lbl-alt-res').textContent = textLabel;

    if (hideConversion) {
        document.getElementById('divisas-alternativas').classList.add('hidden');
        if (target === 'decision') {
            if (vpnMcmA > vpnMcmB) {
                document.getElementById('res-alt-main').textContent = "Alternativa A";
            } else if (vpnMcmB > vpnMcmA) {
                document.getElementById('res-alt-main').textContent = "Alternativa B";
            } else {
                document.getElementById('res-alt-main').textContent = "Indiferente (Mismo beneficio)";
            }
        } else {
            document.getElementById('res-alt-main').textContent = valPrincipal + " Ciclos";
        }
    } else {
        document.getElementById('divisas-alternativas').classList.remove('hidden');
        document.getElementById('res-alt-main').textContent = valPrincipal.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2});
        pintarDivisas('res-alt-usd', 'res-alt-eur', valPrincipal);
    }

    document.getElementById('results-alternativas').classList.remove('hidden');
}

// =========================================================================
// CARGA Y CONFIGURACIÓN GENERAL DEL SISTEMA (DOM)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    actualizarMonedas();

    document.getElementById('menu-btn').addEventListener("click", toggleMenu);
    document.getElementById('sidebar-overlay').addEventListener("click", toggleMenu);
    document.getElementById('logo-inicio').addEventListener("click", () => { irA('inicio'); });

    document.getElementById("theme-toggle-btn").addEventListener("click", () => {
        let current = document.documentElement.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    });

    ['inicio','simple','compound','single','uniform','rates','costs','evaluacion','alternativas'].forEach(v => {
        if(document.getElementById(`nav-${v}`)) {
            document.getElementById(`nav-${v}`).addEventListener("click", () => { 
                irA(v); 
                toggleMenu(); 
                cerrarConceptoHome(); 
            });
        }
    });

    document.getElementById('simple-target').addEventListener("change", checkSimple);
    document.getElementById('compound-target').addEventListener("change", checkCompound);
    document.getElementById('single-target').addEventListener("change", checkSingle);
    document.getElementById('uniform-target').addEventListener("change", checkUniform);

    document.getElementById('btn-calc-simple').addEventListener("click", runSimple);
    document.getElementById('btn-calc-compound').addEventListener("click", runCompound);
    document.getElementById('btn-calc-single').addEventListener("click", runSingle);
    document.getElementById('btn-calc-uniform').addEventListener("click", runUniform);
    document.getElementById('btn-calc-rates').addEventListener("click", runRates);
    document.getElementById('btn-calc-costs').addEventListener("click", runCosts);
    
    document.getElementById('btn-calc-evaluacion').addEventListener("click", runEvaluacion);
    document.getElementById('btn-calc-alternativas').addEventListener("click", runAlternativas);
});