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
    } catch(e) { console.warn("Modo de respaldo activo."); }
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

// NAVEGACIÓN Y MENÚ SIDEBAR
function toggleMenu() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('active');
}

function irA(v) {
    ['inicio','simple','compound','single','uniform','anualidades','rates','costs','evaluacion','alternativas'].forEach(x => {
        if(document.getElementById(`section-${x}`)) document.getElementById(`section-${x}`).classList.add('hidden');
        if(document.getElementById(`nav-${x}`)) document.getElementById(`nav-${x}`).classList.remove('active');
    });
    
    if(document.getElementById(`section-${v}`)) document.getElementById(`section-${v}`).classList.remove('hidden');
    if(document.getElementById(`nav-${v}`)) document.getElementById(`nav-${v}`).classList.add('active');
}

// =========================================================================
// GLOSARIO DE CONCEPTOS Y FÓRMULAS
// =========================================================================
const GLOSARIO_TEMAS = {
    simple: {
        titulo: "Concepto de Interés Simple",
        color: "var(--color-simple)",
        cuerpo: `
            <p>El <strong>Interés Simple</strong> es un método financiero donde los rendimientos generados durante un tiempo determinado se calculan <strong>únicamente sobre el capital inicial (P)</strong>.</p>
            <h4 style="margin-top:1rem; font-weight:700;">Fórmula Base de Valor Futuro:</h4>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:1.1rem; text-align:center;">
                Vf = P * (1 + i * t)
            </div>
            <p style="margin-top:1rem;"><strong>Características Principales:</strong></p>
            <ul style="margin-left:1.5rem; margin-top:0.5rem;">
                <li>La tasa de interés (i) y el tiempo (t) deben estar expresados en la misma unidad de tiempo.</li>
                <li>Los intereses devengados son constantes en cada período.</li>
            </ul>
        `
    },
    compound: {
        titulo: "Concepto de Interés Compuesto",
        color: "var(--color-compound)",
        cuerpo: `
            <p>El <strong>Interés Compuesto</strong> representa la acumulación sistemática de rendimientos donde los intereses devengados al final de cada período <strong>se suman al capital original</strong> para generar nuevos intereses.</p>
            <h4 style="margin-top:1rem; font-weight:700;">Fórmula Base:</h4>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:1.1rem; text-align:center;">
                Vf = P * (1 + i/m)<sup>n</sup>
            </div>
        `
    },
    single: {
        titulo: "Concepto de Pagos Únicos",
        color: "var(--color-single)",
        cuerpo: `
            <p>Analiza el comportamiento de un único flujo de efectivo en el presente (P) y otro en el futuro (F).</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; text-align:center;">
                F = P * (1 + i)<sup>n</sup> &nbsp;|&nbsp; P = F / (1 + i)<sup>n</sup>
            </div>
        `
    },
    uniform: {
        titulo: "Concepto de Series Uniformes",
        color: "var(--color-uniform)",
        cuerpo: `
            <p>Las <strong>Series Uniformes</strong> consisten en un conjunto de pagos o cobros iguales (A) a intervalos regulares de tiempo.</p>
        `
    },
    anualidades: {
        titulo: "Las Anualidades y sus Fórmulas Matemáticas Completa",
        color: "var(--color-anualidades)",
        cuerpo: `
            <p>Una <strong>Anualidad</strong> es una serie de depósitos, pagos o retiros periódicos iguales (A) a intervalos regulares. A continuación se presentan todas sus clasificaciones teóricas e integrales junto a sus <strong>fórmulas matemáticas explícitas</strong>:</p>

            <!-- 1. VENCIDA / ORDINARIA -->
            <h4 style="margin-top:1.25rem; font-weight:700; border-bottom: 2px solid var(--color-anualidades); color: var(--color-anualidades); padding-bottom: 0.25rem;">1. Anualidad Ordinaria (Vencida)</h4>
            <p>Los pagos se realizan al final de cada período de pago.</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:0.95rem;">
                <strong>Valor Presente (P):</strong> P = A * [ (1 - (1 + i)<sup>-n</sup>) / i ] <br><br>
                <strong>Valor Futuro (F):</strong> F = A * [ ((1 + i)<sup>n</sup> - 1) / i ] <br><br>
                <strong>Cuota dado Presente (A|P):</strong> A = P * [ i / (1 - (1 + i)<sup>-n</sup>) ] <br><br>
                <strong>Cuota dado Futuro (A|F):</strong> A = F * [ i / ((1 + i)<sup>n</sup> - 1) ]
            </div>

            <!-- 2. ANTICIPADA -->
            <h4 style="margin-top:1.25rem; font-weight:700; border-bottom: 2px solid var(--color-anualidades); color: var(--color-anualidades); padding-bottom: 0.25rem;">2. Anualidad Anticipada</h4>
            <p>Los pagos se realizan al inicio de cada período de pago (se multiplican por el factor de capitalización <code>(1 + i)</code>).</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:0.95rem;">
                <strong>Valor Presente (P):</strong> P = A * [ (1 - (1 + i)<sup>-n</sup>) / i ] * (1 + i) <br><br>
                <strong>Valor Futuro (F):</strong> F = A * [ ((1 + i)<sup>n</sup> - 1) / i ] * (1 + i) <br><br>
                <strong>Cuota dado Presente (A|P):</strong> A = P / [ ((1 - (1 + i)<sup>-n</sup>) / i) * (1 + i) ] <br><br>
                <strong>Cuota dado Futuro (A|F):</strong> A = F / [ (((1 + i)<sup>n</sup> - 1) / i) * (1 + i) ]
            </div>

            <!-- 3. DIFERIDA -->
            <h4 style="margin-top:1.25rem; font-weight:700; border-bottom: 2px solid var(--color-anualidades); color: var(--color-anualidades); padding-bottom: 0.25rem;">3. Anualidad Diferida</h4>
            <p>Los pagos comienzan después de transcurrir un período de gracia o diferimiento de <code>k</code> períodos.</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:0.95rem;">
                <strong>Valor Presente (P):</strong> P = A * [ (1 - (1 + i)<sup>-n</sup>) / i ] * (1 + i)<sup>-k</sup> <br><br>
                <strong>Valor Futuro (F):</strong> F = A * [ ((1 + i)<sup>n</sup> - 1) / i ] <br><br>
                <strong>Cuota dado Presente (A|P):</strong> A = (P * (1 + i)<sup>k</sup>) * [ i / (1 - (1 + i)<sup>-n</sup>) ]
            </div>

            <!-- 4. PERPETUIDAD -->
            <h4 style="margin-top:1.25rem; font-weight:700; border-bottom: 2px solid var(--color-anualidades); color: var(--color-anualidades); padding-bottom: 0.25rem;">4. Perpetuidad (Serie Infinita)</h4>
            <p>Serie de pagos que se extienden indefinidamente en el tiempo (<code>n → ∞</code>).</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:0.95rem;">
                <strong>Valor Presente Perpetuo:</strong> P = A / i <br><br>
                <strong>Cuota Perpetua:</strong> A = P * i
            </div>

            <!-- 5. ANUALIDADES GENERALES -->
            <h4 style="margin-top:1.25rem; font-weight:700; border-bottom: 2px solid var(--color-anualidades); color: var(--color-anualidades); padding-bottom: 0.25rem;">5. Anualidad General</h4>
            <p>El período de pago no coincide con el período de capitalización de la tasa. Requiere convertir la tasa nominal/efectiva a una tasa equivalente <code>i_eq</code> que coincida con la frecuencia de los pagos.</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:0.95rem;">
                <strong>Tasa Equivalente Periódica (i_eq):</strong> i_eq = (1 + i_origen)<sup>(m_origen / m_destino)</sup> - 1
            </div>

            <!-- 6. ANUALIDADES CONTINGENTES -->
            <h4 style="margin-top:1.25rem; font-weight:700; border-bottom: 2px solid var(--color-anualidades); color: var(--color-anualidades); padding-bottom: 0.25rem;">6. Anualidad Contingente / Vitalicia</h4>
            <p>El inicio o la finalización de la serie de pagos depende de un evento incierto (ej. un seguro de vida o pensión actuarial).</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; font-size:0.95rem;">
                <strong>Valor Actuarial Estimado:</strong> P = Σ [ (A * p<sub>t</sub>) / (1 + i)<sup>t</sup> ]
            </div>
        `
    },
    rates: {
        titulo: "Concepto de Tasas Equivalentes",
        color: "var(--color-rates)",
        cuerpo: `
            <p>Permite comparar rentabilidades bajo distintas bases temporales de capitalización.</p>
            <div style="background:var(--bg-card); padding:0.75rem; border-radius:6px; font-family:monospace; margin:0.5rem 0; text-align:center;">
                TEA = (1 + TNA/m)<sup>m</sup> - 1
            </div>
        `
    },
    costs: {
        titulo: "Estimación de Costos",
        color: "var(--color-costs)",
        cuerpo: `
            <p>Punto de Equilibrio: <code>PE = CF / (PVU - CVU)</code></p>
        `
    },
    evaluacion: {
        titulo: "Evaluación Económica de Proyectos",
        color: "var(--color-evaluacion)",
        cuerpo: `
            <p>Análisis de métricas VPN, VA, TIR y PRI.</p>
        `
    },
    alternativas: {
        titulo: "Selección de Alternativas",
        color: "var(--color-alternativas)",
        cuerpo: `
            <p>Análisis de proyectos con vidas útiles distintas mediante MCM.</p>
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
// CALCULADORA DE ANUALIDADES Y SUS TIPOS COMPLETA
// =========================================================================
function checkAnualidades() {
    let tipo = document.getElementById('anu-tipo').value;
    let target = document.getElementById('anu-target').value;

    // Mostrar/ocultar inputs según tipo
    if (tipo === 'diferida') {
        document.getElementById('anu-g-gracia').classList.remove('hidden');
    } else {
        document.getElementById('anu-g-gracia').classList.add('hidden');
    }

    if (tipo === 'general') {
        document.getElementById('anu-g-cap').classList.remove('hidden');
    } else {
        document.getElementById('anu-g-cap').classList.add('hidden');
    }

    if (tipo === 'contingente') {
        document.getElementById('anu-g-prob').classList.remove('hidden');
    } else {
        document.getElementById('anu-g-prob').classList.add('hidden');
    }

    // Ajustar opciones de variable a calcular según tipo (Perpetuidad)
    let optionF = document.querySelector("#anu-target option[value='F']");
    let optionAF = document.querySelector("#anu-target option[value='A_F']");
    
    if (tipo === 'perpetua') {
        if (optionF) optionF.disabled = true;
        if (optionAF) optionAF.disabled = true;
        if (target === 'F' || target === 'A_F') {
            document.getElementById('anu-target').value = 'P';
            target = 'P';
        }
        document.getElementById('anu-g-n-container').classList.add('hidden');
    } else {
        if (optionF) optionF.disabled = false;
        if (optionAF) optionAF.disabled = false;
        document.getElementById('anu-g-n-container').classList.remove('hidden');
    }

    // Mostrar/Ocultar campos de variables
    ['anu-g-a','anu-g-p','anu-g-f'].forEach(x => document.getElementById(x).classList.remove('hidden'));
    
    if (target === 'P' || target === 'F') { 
        document.getElementById('anu-g-p').classList.add('hidden'); 
        document.getElementById('anu-g-f').classList.add('hidden'); 
    } else if (target === 'A_P') { 
        document.getElementById('anu-g-a').classList.add('hidden'); 
        document.getElementById('anu-g-f').classList.add('hidden'); 
    } else if (target === 'A_F') { 
        document.getElementById('anu-g-a').classList.add('hidden'); 
        document.getElementById('anu-g-p').classList.add('hidden'); 
    }
}

function runAnualidades() {
    let tipo = document.getElementById('anu-tipo').value;
    let target = document.getElementById('anu-target').value;

    let A = parseFloat(document.getElementById('anu-a').value) || 0;
    let P = parseFloat(document.getElementById('anu-p').value) || 0;
    let F = parseFloat(document.getElementById('anu-f').value) || 0;
    let iInput = (parseFloat(document.getElementById('anu-i').value) || 0) / 100;
    let n = parseFloat(document.getElementById('anu-n').value) || 0;
    let k = parseFloat(document.getElementById('anu-k').value) || 0;
    let prob = (parseFloat(document.getElementById('anu-prob') ? document.getElementById('anu-prob').value : 100) || 100) / 100;

    let unidadSelect = document.getElementById('anu-unidad');
    let unidadTexto = unidadSelect ? unidadSelect.options[unidadSelect.selectedIndex].text : 'cuotas';

    // Ajuste por Anualidad General (Diferencia entre frecuencia de pago y capitalización)
    let i = iInput;
    if (tipo === 'general') {
        let freqPago = parseFloat(document.getElementById('anu-unidad-freq').value) || 12;
        let freqCap = parseFloat(document.getElementById('anu-cap-freq').value) || 12;
        // Convertir tasa del periodo de capitalización al periodo de pago equivalente
        i = Math.pow(1 + iInput, freqCap / freqPago) - 1;
    }

    let factorAnticipado = (tipo === 'anticipada') ? (1 + i) : 1;
    let factorGracia = (tipo === 'diferida') ? Math.pow(1 + i, -k) : 1;
    let factorContingente = (tipo === 'contingente') ? prob : 1;

    let ans = 0, lbl = "";
    let f1 = Math.pow(1 + i, n);

    if (tipo === 'perpetua') {
        if (target === 'P') {
            ans = (A / i) * factorAnticipado * factorGracia;
            lbl = `Valor Presente [PERPETUIDAD ${tipo.toUpperCase()}]:`;
        } else if (target === 'A_P') {
            ans = (P * i) / (factorAnticipado * factorGracia);
            lbl = `Cuota Periódica [PERPETUIDAD ${tipo.toUpperCase()}]:`;
        }
    } else {
        if (target === 'P') {
            let pBase = A * ((1 - Math.pow(1 + i, -n)) / i);
            ans = pBase * factorAnticipado * factorGracia * factorContingente;
            lbl = `Valor Presente [${tipo.toUpperCase()}]:`;
        } else if (target === 'F') {
            let fBase = A * ((f1 - 1) / i);
            ans = fBase * factorAnticipado * factorContingente;
            lbl = `Valor Futuro [${tipo.toUpperCase()}]:`;
        } else if (target === 'A_P') {
            let pAjustado = P / (factorAnticipado * factorGracia * factorContingente);
            ans = pAjustado * ((i * f1) / (f1 - 1));
            lbl = `Cuota Periódica A|P [${tipo.toUpperCase()}]:`;
        } else if (target === 'A_F') {
            let fAjustado = F / (factorAnticipado * factorContingente);
            ans = fAjustado * (i / (f1 - 1));
            lbl = `Cuota Periódica A|F [${tipo.toUpperCase()}]:`;
        }
    }

    document.getElementById('lbl-anu-res').textContent = lbl;
    document.getElementById('res-anu-main').textContent = ans.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
    
    let detalleBox = document.getElementById('res-anu-detalle');
    if (detalleBox) {
        let textoGracia = (tipo === 'diferida') ? ` con ${k} períodos de gracia` : '';
        let textoDuracion = (tipo === 'perpetua') ? 'perpetua (infinita)' : `${n} cuotas (${unidadTexto.toLowerCase()})`;
        let textoProb = (tipo === 'contingente') ? ` con probabilidad del ${(prob*100).toFixed(1)}%` : '';
        
        detalleBox.innerHTML = `* Calculado para <strong>Anualidad ${tipo}</strong> de <strong>${textoDuracion}</strong>${textoGracia}${textoProb} a una tasa equivalente de <strong>${(i * 100).toFixed(4)}% por período</strong>.`;
    }

    pintarDivisas('res-anu-usd', 'res-anu-eur', ans);
    document.getElementById('results-anualidades').classList.remove('hidden');
}

// =========================================================================
// INTERÉS SIMPLE
// =========================================================================
function checkSimple() {
    let t = document.getElementById('simple-target').value;
    ['s-g-p','s-g-i','s-g-t','s-g-vf'].forEach(x => document.getElementById(x).classList.remove('hidden'));
    
    if(t === 'Vf') document.getElementById('s-g-vf').classList.add('hidden');
    else if(t === 'P') document.getElementById('s-g-p').classList.add('hidden');
    else if(t === 'i') document.getElementById('s-g-i').classList.add('hidden');
    else if(t === 't') document.getElementById('s-g-t').classList.add('hidden');
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

// =========================================================================
// INTERÉS COMPUESTO
// =========================================================================
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

// =========================================================================
// PAGOS ÚNICOS
// =========================================================================
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

// =========================================================================
// SERIES UNIFORMES
// =========================================================================
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

    let unidadSelect = document.getElementById('uniform-unidad-tiempo');
    let unidadTexto = unidadSelect ? unidadSelect.options[unidadSelect.selectedIndex].text : 'cuotas';

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
        lbl = "Cuota Periódica Requerida (A):";
    } else if (target === 'A_F') {
        ans = F * (i / (f1 - 1));
        lbl = "Fondo de Ahorro Periódico (A):";
    }

    document.getElementById('lbl-uniform-res').textContent = lbl;
    document.getElementById('res-uniform-main').textContent = ans.toLocaleString('en-US',{minimumFractionDigits:2, maximumFractionDigits:2});
    
    let detalleBox = document.getElementById('res-uniform-detalle');
    if (detalleBox) {
        detalleBox.innerHTML = `* Calculado para <strong>${n} cuotas con frecuencia ${unidadTexto.toLowerCase()}</strong> a una tasa del <strong>${(i * 100)}% por período ${unidadTexto.toLowerCase()}</strong>.`;
    }

    pintarDivisas('res-uniform-usd', 'res-uniform-eur', ans);
    document.getElementById('results-uniform').classList.remove('hidden');
}

// =========================================================================
// TASAS EQUIVALENTES, COSTOS Y EVALUACIÓN
// =========================================================================
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
// CARGA INICIAL
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

    ['inicio','simple','compound','single','uniform','anualidades','rates','costs','evaluacion','alternativas'].forEach(v => {
        if(document.getElementById(`nav-${v}`)) {
            document.getElementById(`nav-${v}`).addEventListener("click", () => { 
                irA(v); 
                toggleMenu(); 
            });
        }
    });

    // Listeners Anualidades
    document.getElementById('anu-tipo').addEventListener("change", checkAnualidades);
    document.getElementById('anu-target').addEventListener("change", checkAnualidades);
    document.getElementById('btn-calc-anualidades').addEventListener("click", runAnualidades);

    // Listeners Módulos Restantes
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