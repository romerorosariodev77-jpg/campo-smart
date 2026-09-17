// --- CORRECCIÓN INTEGRAL ANTIBLOQUEOS - PARTE 1 ---

// Inicialización ultra segura con valores por defecto limpios
let DB_ANIMALES = [];
let DB_SANIDAD = [];
let DB_SERVICIOS = [];
let DB_TRANSACCIONES = [];
let filtroActual = 'TODOS';
let busquedaCaravana = ''; 

try {
    DB_ANIMALES = JSON.parse(localStorage.getItem('ganado_animales')) || [
        { id: "101", sexo: "HEMBRA", tipo: "Vaca", notes: "Marcada oreja izquierda", lote: "General", foto: "" },
        { id: "102", sexo: "HEMBRA", tipo: "Vaquillona", notes: "Lote nuevo", lote: "General", foto: "" },
        { id: "201", sexo: "MACHO", tipo: "Toro", notes: "Padrillo Brangus", lote: "General", foto: "" }
    ];
    DB_SANIDAD = JSON.parse(localStorage.getItem('ganado_sanidad')) || [];
    DB_SERVICIOS = JSON.parse(localStorage.getItem('ganado_servicios')) || [];
    DB_TRANSACCIONES = JSON.parse(localStorage.getItem('ganado_transacciones')) || [];
} catch (e) {
    console.error("Memoria corrupta detectada, inicializando limpio.", e);
}

// Persistencia local sin cortes
function persistir() {
    try {
        localStorage.setItem('ganado_animales', JSON.stringify(DB_ANIMALES));
        localStorage.setItem('ganado_sanidad', JSON.stringify(DB_SANIDAD));
        localStorage.setItem('ganado_servicios', JSON.stringify(DB_SERVICIOS));
        localStorage.setItem('ganado_transacciones', JSON.stringify(DB_TRANSACCIONES));
    } catch (err) {
        console.error("Error al guardar en el disco local.", err);
    }
    renderizarTodo();
}

// Navegación de pestañas con verificación de existencia de elementos HTML
function cambiarSeccion(seccion) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
    
    const targetSec = document.getElementById(`sec-${seccion}`);
    const targetNav = document.getElementById(`nav-${seccion}`);
    if (targetSec) targetSec.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
}

function abrirModal(id) { 
    const m = document.getElementById(id);
    if (m) m.style.display = 'block'; 
}

function cerrarModal(id) { 
    const m = document.getElementById(id);
    if (m) {
        const form = m.querySelector('form');
        if (form) form.reset();
        m.style.display = 'none'; 
    }
}

function calcularMontoTotal() {
    const cabezas = parseFloat(document.getElementById('trans-cabezas')?.value) || 0;
    const precio = parseFloat(document.getElementById('trans-precio-unitario')?.value) || 0;
    const inputTotal = document.getElementById('trans-monto-total');
    if (inputTotal) inputTotal.value = (cabezas * precio).toFixed(2);
}

function filtrarAnimales(valor) { 
    filtroActual = valor; 
    renderizarTodo(); 
}

function filtrarPorCaravana(texto) {
    busquedaCaravana = texto.toLowerCase().trim(); 
    renderizarTodo(); 
}

function darDeBajaAnimal(id) {
    if (confirm(`¿Estás seguro de dar de BAJA definitiva al animal con RP: ${id}?`)) {
        DB_ANIMALES = DB_ANIMALES.filter(a => a.id !== id);
        persistir();
    }
}
// --- CORRECCIÓN INTEGRAL ANTIBLOQUEOS - PARTE 2 ---

function guardarAnimal(e) {
    e.preventDefault();
    const archivoFoto = document.getElementById('ani-foto')?.files;
    
    const nuevoAnimal = {
        id: document.getElementById('ani-id').value.trim(),
        sexo: document.getElementById('ani-sexo').value,
        tipo: document.getElementById('ani-tipo').value,
        lote: document.getElementById('ani-lote').value.trim(),
        notes: document.getElementById('ani-notas').value.trim(),
        foto: ""
    };

    if (archivoFoto && archivoFoto.length > 0) {
        const lector = new FileReader();
        lector.onload = function(evt) {
            nuevoAnimal.foto = evt.target.result;
            DB_ANIMALES.push(nuevoAnimal);
            persistir(); 
            cerrarModal('modal-animal');
        };
        lector.readAsDataURL(archivoFoto[0]);
    } else {
        DB_ANIMALES.push(nuevoAnimal);
        persistir(); 
        cerrarModal('modal-animal');
    }
}

function guardarMovimientoLote(e) {
    e.preventDefault();
    const idBuscar = document.getElementById('mov-animal-id').value.trim();
    const destino = document.getElementById('mov-destino').value.trim();
    let exito = false;

    DB_ANIMALES.forEach(a => {
        if (idBuscar.toLowerCase() === 'todos' || a.id === idBuscar) {
            a.lote = destino; 
            exito = true;
        }
    });

    if (exito) { 
        persistir(); 
        cerrarModal('modal-movimiento'); 
    } else { 
        alert("Animal o ID de lote no encontrado."); 
    }
}

function guardarSanidad(e) {
    e.preventDefault();
    const idA = document.getElementById('san-id').value.trim();
    const animal = DB_ANIMALES.find(a => a.id === idA);

    if (!animal) {
        alert("Error: El ID de caravana no existe en la base de datos.");
        return;
    }

    DB_SANIDAD.unshift({
        id: idA,
        fecha: new Date().toLocaleDateString(),
        evento: document.getElementById('san-evento').value,
        detalle: document.getElementById('san-detalle').value.trim()
    });
    persistir(); 
    cerrarModal('modal-sanidad');
}

function guardarServicio(e) {
    e.preventDefault();
    const idH = document.getElementById('srv-id').value.trim();
    const animal = DB_ANIMALES.find(a => a.id === idH);

    if (!animal || animal.sexo !== 'HEMBRA') {
        alert("Error: Este registro es exclusivo para HEMBRAS.");
        return;
    }

    DB_SERVICIOS.unshift({
        id: idH,
        fecha: new Date().toLocaleDateString(),
        evento: document.getElementById('srv-evento').value,
        detalle: document.getElementById('srv-detalle').value.trim()
    });
    persistir(); 
    cerrarModal('modal-servicio');
}

function guardarTransaccion(e) {
    e.preventDefault();
    DB_TRANSACCIONES.unshift({
        fecha: new Date().toLocaleDateString(),
        tipo: document.getElementById('trans-tipo').value,
        categoria: document.getElementById('trans-categoria').value,
        cabezas: document.getElementById('trans-cabezas').value,
        monto: document.getElementById('trans-monto-total').value
    });
    persistir(); 
    cerrarModal('modal-transaccion');
}

function exportarDatosOffline() {
    const copia = { animales: DB_ANIMALES, sanidad: DB_SANIDAD, servicios: DB_SERVICIOS, transacciones: DB_TRANSACCIONES };
    const blob = new Blob([JSON.stringify(copia, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `RESPALDO_CAMPO_SMART_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
}

function importarDatosOffline(evt) {
    const arch = evt.target.files;
    if (!arch || arch.length === 0) return;
    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            if (datos.animales && datos.sanidad && datos.servicios) {
                if (confirm("¿Cargar respaldo? Se reemplazará la pantalla actual.")) {
                    DB_ANIMALES = datos.animales;
                    DB_SANIDAD = datos.sanidad;
                    DB_SERVICIOS = datos.servicios;
                    DB_TRANSACCIONES = datos.transacciones || [];
                    persistir();
                }
            } else { alert("Formulario de copia no válido."); }
        } catch (err) { alert("Error al procesar archivo."); }
        evt.target.value = '';
    };
    lector.readAsText(arch[0]);
}
// --- CORRECCIÓN INTEGRAL ANTIBLOQUEOS - PARTE 3 ---

function renderizarTodo() {
    const containerA = document.getElementById('lista-animales');
    
    // 1. Contador de Stock Seguro
    if (containerA) {
        let vacas = 0, vaquillonas = 0, toros = 0, terneros = 0;
        DB_ANIMALES.forEach(animal => {
            if (animal.tipo === 'Vaca') vacas++;
            else if (animal.tipo === 'Vaquillona') vaquillonas++;
            else if (animal.tipo === 'Toro') toros++;
            else if (animal.tipo === 'Ternero/a') terneros++;
        });
        const actualizarTexto = (id, num) => { const el = document.getElementById(id); if (el) el.innerText = num; };
        actualizarTexto('stk-total', DB_ANIMALES.length);
        actualizarTexto('stk-vacas', vacas);
        actualizarTexto('stk-vaquillonas', vaquillonas);
        actualizarTexto('stk-toros', toros);
        actualizarTexto('stk-terneros', terneros);
    }

    // 2. Render de Inventario con Bloque Termoaislante contra Fallas de Fecha
    if (containerA) {
        containerA.innerHTML = '';
        
        const filtrados = DB_ANIMALES.filter(a => {
            const cat = (filtroActual === 'TODOS' || a.tipo === filtroActual);
            const bus = a.id.toLowerCase().includes(busquedaCaravana);
            return cat && bus;
        });

        filtrados.forEach(a => {
            let htmlAlertas = '';
            
            // Aislamiento total de errores: si una fecha está rota, no rompe a Sanidad ni Hacienda
            try {
                if (a.sexo === 'HEMBRA') {
                    const hist = DB_SERVICIOS.filter(s => s.id === a.id);
                    if (hist.length > 0) {
                        const ult = hist[0]; // Corrección de índice nativo
                        if (ult && ult.fecha && ult.fecha.includes('/')) {
                            const p = ult.fecha.split('/');
                            if (p.length === 3) {
                                const fEv = new Date(parseInt(p[2]), parseInt(p[1]) - 1, parseInt(p[0]));
                                const fHoy = new Date();
                                const dTrans = Math.ceil(Math.abs(fHoy - fEv) / (1000 * 60 * 60 * 24));
                                
                                if (ult.evento.includes('Inseminación') || ult.evento.includes('Servicio')) {
                                    if (dTrans >= 270 && dTrans <= 295) {
                                        htmlAlertas += `<span class="alert-tag alert-parto">⚠️ Próxima al Parto (~${dTrans} días)</span>`;
                                    }
                                }
                                const vac = ult.detalle.toLowerCase().includes('vacía') || ult.detalle.toLowerCase().includes('vacia');
                                const srv = ult.evento.includes('Inseminación') || ult.evento.includes('Servicio');
                                if ((srv || vac) && dTrans >= 18 && dTrans <= 24) {
                                    htmlAlertas += `<span class="alert-tag alert-celo">🔥 Alerta de Celo (Hace ${dTrans} días)</span>`;
                                }
                            }
                        }
                    }
                }
            } catch (errFecha) {
                console.warn("Falla de cálculo biológico en animal id: " + a.id, errFecha);
            }

            const img = a.foto ? `<img src="${a.foto}" class="avatar-animal" alt="Foto">` : `<div class="avatar-animal" style="display:flex;align-items:center;justify-content:center;color:var(--text-gray);font-size:1.2rem;">🐄</div>`;

            // Estampado limpio sin secuencias de escape rotas
            containerA.innerHTML += `
                <div class="item-row" style="flex-direction: column; align-items: flex-start; gap: 4px;">
                    <div style="display: flex; justify-content: space-between; width: 100%; align-items: center; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                            ${img}
                            <div>
                                <strong>RP: ${a.id}</strong> - ${a.tipo} 
                                <br><small style="color:#666">Lote: ${a.lote} | ${a.notes || ''}</small>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="badge badge-${a.sexo.toLowerCase()}">${a.sexo}</span>
                            <button class="btn-delete" onclick="darDeBajaAnimal('${a.id}')">X Baja</button>
                        </div>
                    </div>
                    ${htmlAlertas ? `<div class="alert-container">\${htmlAlertas}</div>` : ''}
                </div>`;
        });
    }

    // 3. Renderizado del Historial Clínico Sanitario (Sanidad)
    const containerS = document.getElementById('lista-sanidad');
    if (containerS) {
        containerS.innerHTML = '';
        DB_SANIDAD.forEach(s => {
            containerS.innerHTML += `
                <div class="item-row">
                    <div><strong>RP: ${s.id}</strong> - ${s.evento}<br><small style="color:#666">${s.detalle}</small></div>
                    <span style="font-size:0.85rem; color:#888;">${s.fecha}</span>
                </div>`;
        });
    }

    // 4. Renderizado del Historial de Servicios y Reproducción
    const containerServ = document.getElementById('lista-servicio');
    if (containerServ) {
        containerServ.innerHTML = '';
        DB_SERVICIOS.forEach(srv => {
            containerServ.innerHTML += `
                <div class="item-row">
                    <div><strong>Hembra: ${srv.id}</strong> - ${srv.evento}<br><small style="color:#666">${srv.detalle}</small></div>
                    <span style="font-size:0.85rem; color:#d84315; font-weight:bold;">${srv.fecha}</span>
                </div>`;
        });
    }

    // 5. Renderizado del Libro Contable (Compra y Venta de Hacienda)
    const containerT = document.getElementById('lista-transacciones');
    if (containerT) {
        containerT.innerHTML = '';
        DB_TRANSACCIONES.forEach(t => {
            containerT.innerHTML += `
                <div class="item-row">
                    <div><strong>${t.cabezas} ${t.categoria}</strong><br><small style="color:#666">${t.fecha}</small></div>
                    <span class="badge badge-${t.tipo.toLowerCase()}">$ ${t.monto}</span>
                </div>`;
        });
    }
}

// Ejecución controlada inicial
document.addEventListener("DOMContentLoaded", () => { renderizarTodo(); });
renderizarTodo();
