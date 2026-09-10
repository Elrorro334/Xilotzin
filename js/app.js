// ==========================================================
// CINE TEATRO XILOTZIN - MOTOR DE APLICACIÓN Y VISTA PÚBLICA
// ==========================================================

const Store = {
    set: (key, data) => XilotzinDB.set(key, data),
    get: (key) => XilotzinDB.get(key),
    remove: (key) => localStorage.removeItem(`xilotzin_${key}`),
    clear: () => localStorage.clear()
};

// Registro de Service Worker PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(reg => console.log('PWA ServiceWorker registrado con éxito:', reg.scope))
            .catch(err => console.log('PWA ServiceWorker registro omitido:', err));
    });
}

// Variables de estado global
let preordenEnCurso = {
    pelicula: null,
    horario: null,
    boletosGeneral: 1,
    combos: []
};
let carruselInterval = null;
let noticiaActualIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tema estacional guardado
    const temaGuardado = Store.get('tema_activo') || 'traditional';
    aplicarTema(temaGuardado, false);

    // Inicializar carrusel de noticias si existe el contenedor
    if (document.getElementById('carrusel-noticias')) {
        renderNoticiasCarrusel();
    }

    // Inicializar toast de captación de newsletter
    iniciarToastNewsletter();

    // Sincronizar selectores de tema si existen
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
        themeSelector.value = temaGuardado;
        themeSelector.addEventListener('change', (e) => aplicarTema(e.target.value, true));
    }
});

// Cuando la cartelera de TMDB/Local esté lista
document.addEventListener('CarteleraLista', () => {
    if (document.getElementById('movie-grid')) {
        renderIndex();
    }
});

// ==========================================================
// 1. MOTOR DE TEMÁTICAS ESTACIONALES
// ==========================================================
function aplicarTema(tema, guardar = true) {
    const temasValidos = ['traditional', 'halloween', 'christmas', 'blockbuster'];
    if (!temasValidos.includes(tema)) tema = 'traditional';

    temasValidos.forEach(t => document.body.classList.remove(`theme-${t}`));
    document.body.classList.add(`theme-${tema}`);

    if (guardar) {
        Store.set('tema_activo', tema);
        mostrarAlertaToast(`Tema cambiado a: ${obtenerNombreTema(tema)}`);
    }

    // Sincronizar selector visual en el header si existe
    const sel = document.getElementById('theme-selector');
    if (sel && sel.value !== tema) sel.value = tema;

    // Actualizar badge temático visual
    const badge = document.getElementById('theme-current-badge');
    if (badge) {
        const nombres = {
            'traditional': '🎬 Cine Tradicional',
            'halloween': '🎃 Noche de Terror',
            'christmas': '🎄 Especial Navideño',
            'blockbuster': '🍿 Verano Blockbuster'
        };
        badge.innerText = nombres[tema] || 'Cine Xilotzin';
    }
}

function obtenerNombreTema(tema) {
    switch (tema) {
        case 'halloween': return 'Noche de Terror (Halloween)';
        case 'christmas': return 'Especial Navideño e Invernal';
        case 'blockbuster': return 'Verano Blockbuster';
        default: return 'Cine Tradicional (Xilotzin Clásico)';
    }
}

// ==========================================================
// 2. CARRUSEL DE NOTICIAS Y AVISOS
// ==========================================================
function renderNoticiasCarrusel() {
    const contenedor = document.getElementById('carrusel-noticias');
    if (!contenedor) return;

    const noticias = Store.get('noticias') || [];
    if (noticias.length === 0) return;

    contenedor.innerHTML = `
        <div class="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r ${noticias[noticiaActualIndex].bg} p-6 md:p-8 shadow-2xl transition-all duration-700 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-start gap-4">
                <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-lg">
                    <i class="fa-solid ${noticias[noticiaActualIndex].icono} text-2xl md:text-3xl text-white"></i>
                </div>
                <div class="flex flex-col">
                    <div class="flex items-center gap-3 mb-1">
                        <span class="bg-cneRed text-white font-sans font-bold text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-sm">
                            ${noticias[noticiaActualIndex].tag}
                        </span>
                        <span class="text-white/60 font-sans text-xs font-medium">
                            <i class="fa-regular fa-clock mr-1"></i>${noticias[noticiaActualIndex].fecha}
                        </span>
                    </div>
                    <h3 class="text-xl md:text-2xl font-serif font-black uppercase text-white tracking-wide leading-tight">
                        ${noticias[noticiaActualIndex].titulo}
                    </h3>
                    <p class="text-white/80 text-xs md:text-sm font-sans mt-2 max-w-2xl font-medium leading-relaxed">
                        ${noticias[noticiaActualIndex].descripcion}
                    </p>
                </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
                <button onclick="cambiarNoticia(-1)" class="w-9 h-9 rounded-full bg-black/40 border border-white/20 text-white hover:bg-white hover:text-black transition-all flex items-center justify-center">
                    <i class="fa-solid fa-chevron-left text-xs"></i>
                </button>
                <div class="flex gap-1.5 px-2">
                    ${noticias.map((_, i) => `
                        <button onclick="irANoticia(${i})" class="w-2 h-2 rounded-full transition-all ${i === noticiaActualIndex ? 'bg-white w-6' : 'bg-white/30'}"></button>
                    `).join('')}
                </div>
                <button onclick="cambiarNoticia(1)" class="w-9 h-9 rounded-full bg-black/40 border border-white/20 text-white hover:bg-white hover:text-black transition-all flex items-center justify-center">
                    <i class="fa-solid fa-chevron-right text-xs"></i>
                </button>
            </div>
        </div>
    `;

    if (!carruselInterval) {
        carruselInterval = setInterval(() => cambiarNoticia(1), 6000);
    }
}

function cambiarNoticia(dir) {
    const noticias = Store.get('noticias') || [];
    if (noticias.length <= 1) return;
    noticiaActualIndex = (noticiaActualIndex + dir + noticias.length) % noticias.length;
    renderNoticiasCarrusel();
}

function irANoticia(idx) {
    noticiaActualIndex = idx;
    renderNoticiasCarrusel();
}

// ==========================================================
// 3. CARTELERA INTELIGENTE (SIN HORARIOS NI CALIFICACIONES EN PORTADA)
// ==========================================================
// Conforme a la especificación: "Tarjetas de películas ajustadas para ocultar horarios y calificaciones en la vista principal."
function renderIndex() {
    if (typeof cineData === 'undefined' || !cineData.peliculas.length) return;

    const grid = document.getElementById('movie-grid');
    if (!grid) return;

    grid.innerHTML = cineData.peliculas.map(p => `
        <div class="group relative rounded-2xl overflow-hidden bg-cneCard border border-cneBorder hover:border-cneRed/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(225,29,47,0.25)] flex flex-col">
            <!-- Portada limpia de película -->
            <div onclick="openModal(${p.id})" class="aspect-[2/3] w-full relative bg-black cursor-pointer overflow-hidden">
                <img src="${p.poster}" alt="${p.titulo}" class="object-cover w-full h-full opacity-85 group-hover:opacity-100 group-hover:scale-105 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-cneCard via-transparent to-transparent"></div>
                
                <!-- Badge de clasificación oficial -->
                <div class="absolute top-3.5 right-3.5 bg-cneRed text-white font-black text-xs px-2.5 py-1 rounded shadow-lg z-10 border border-white/20">
                    ${p.clasificacion}
                </div>

                <!-- Hover overlay cinematográfico -->
                <div class="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 backdrop-blur-[2px]">
                    <span class="bg-white text-black px-5 py-2.5 font-sans font-bold uppercase text-xs tracking-widest shadow-2xl rounded-full flex items-center gap-2 transform group-hover:scale-105 transition-transform">
                        <i class="fa-solid fa-eye text-cneRed"></i> Ver Sinopsis y Horarios
                    </span>
                    <span class="text-[10px] text-white/80 uppercase font-sans font-bold tracking-widest mt-3">
                        ${p.duracion} • ${p.genero}
                    </span>
                </div>
            </div>

            <!-- Ficha informativa limpia (SIN horarios y SIN calificaciones en portada) -->
            <div class="p-5 flex flex-col flex-grow justify-between bg-cneCard/90">
                <div>
                    <h3 class="text-xl font-serif font-black uppercase mb-1 text-white leading-tight group-hover:text-cneRed transition-colors line-clamp-1" title="${p.titulo}">
                        ${p.titulo}
                    </h3>
                    <p class="text-cneMuted text-xs font-sans font-semibold uppercase tracking-wider mb-4">
                        ${p.genero} • ${p.duracion}
                    </p>
                </div>

                <div class="pt-3 border-t border-cneBorder flex items-center justify-between">
                    <button onclick="openModal(${p.id})" class="w-full bg-white/5 hover:bg-cneRed text-white hover:text-white border border-white/10 hover:border-cneRed font-sans font-bold py-2.5 px-4 rounded-xl transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                        <i class="fa-regular fa-calendar-days"></i> Consultar Horarios y Pre-orden
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// ==========================================================
// 4. MODAL DETALLADO DE PELÍCULA (AQUÍ SE MUESTRAN HORARIOS Y PRE-ORDEN)
// ==========================================================
let peliculaModalActual = null;

function openModal(id) {
    const p = cineData.peliculas.find(m => m.id === id);
    if (!p) return;

    peliculaModalActual = p;

    document.getElementById('modal-title').innerText = p.titulo;
    document.getElementById('modal-image').src = p.poster; 
    document.getElementById('modal-genre').innerText = p.genero;
    document.getElementById('modal-duration').innerText = p.duracion;
    document.getElementById('modal-year').innerText = p.año;
    document.getElementById('modal-description').innerText = p.descripcion;
    document.getElementById('modal-tagline').innerText = p.eslogan;
    document.getElementById('modal-rating').innerText = p.calificacion;
    document.getElementById('modal-director').innerText = p.director;
    document.getElementById('modal-cast').innerText = p.actores;

    // Renderizar horarios en el modal
    const contHorarios = document.getElementById('modal-horarios-container');
    if (contHorarios) {
        contHorarios.innerHTML = p.horarios.map(h => `
            <button onclick="abrirPreorden(${p.id}, '${h}')" class="bg-cneDark hover:bg-cneRed text-white border border-cneBorder hover:border-cneRed font-sans font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-widest transition-all shadow flex items-center justify-center gap-2 group">
                <i class="fa-solid fa-ticket text-cneRed group-hover:text-white transition-colors"></i> ${h}
            </button>
        `).join('');
    }

    // Botón de trailer en YouTube
    const btnTrailer = document.getElementById('modal-trailer-btn');
    if (p.trailerKey) { 
        btnTrailer.href = `https://www.youtube.com/watch?v=${p.trailerKey}`; 
        btnTrailer.classList.remove('hidden'); 
        btnTrailer.classList.add('flex');
    } else {
        btnTrailer.classList.add('hidden');
        btnTrailer.classList.remove('flex');
    }

    const modal = document.getElementById('movie-modal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('movie-modal');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ==========================================================
// 5. MÓDULO DE PRE-ORDEN Y TICKET DIGITAL CON CÓDIGO QR
// ==========================================================
function abrirPreorden(idPeli, horario) {
    closeModal();
    const peli = cineData.peliculas.find(p => p.id === idPeli) || peliculaModalActual;
    if (!peli) return;

    preordenEnCurso = {
        pelicula: peli.titulo,
        horario: horario || peli.horarios[0],
        boletosGeneral: 2,
        precioBoleto: 50,
        combosSeleccionados: {}
    };

    actualizarResumenPreordenUI();

    const modalPreorden = document.getElementById('modal-preorden');
    if (modalPreorden) {
        modalPreorden.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModalPreorden() {
    const modal = document.getElementById('modal-preorden');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function ajustarBoletosPreorden(cambio) {
    preordenEnCurso.boletosGeneral = Math.max(1, Math.min(10, preordenEnCurso.boletosGeneral + cambio));
    actualizarResumenPreordenUI();
}

function alternarComboPreorden(comboId, precio, nombre) {
    if (!preordenEnCurso.combosSeleccionados[comboId]) {
        preordenEnCurso.combosSeleccionados[comboId] = { nombre, precio, cantidad: 1 };
    } else {
        delete preordenEnCurso.combosSeleccionados[comboId];
    }
    actualizarResumenPreordenUI();
}

function actualizarResumenPreordenUI() {
    const elPeli = document.getElementById('preorden-pelicula');
    const elHorario = document.getElementById('preorden-horario');
    const elCantBoletos = document.getElementById('preorden-cant-boletos');
    const elSubtotalBoletos = document.getElementById('preorden-subtotal-boletos');
    const elTotal = document.getElementById('preorden-total');
    const elContCombos = document.getElementById('preorden-combos-lista');

    if (elPeli) elPeli.innerText = preordenEnCurso.pelicula;
    if (elHorario) elHorario.innerText = preordenEnCurso.horario;
    if (elCantBoletos) elCantBoletos.innerText = preordenEnCurso.boletosGeneral;

    const subtotalBoletos = preordenEnCurso.boletosGeneral * preordenEnCurso.precioBoleto;
    if (elSubtotalBoletos) elSubtotalBoletos.innerText = `$${subtotalBoletos} MXN`;

    // Renderizar combos disponibles
    const combos = Store.get('combos') || [];
    if (elContCombos) {
        elContCombos.innerHTML = combos.map(c => {
            const activo = !!preordenEnCurso.combosSeleccionados[c.id];
            return `
                <div onclick="alternarComboPreorden('${c.id}', ${c.precio}, '${c.nombre}')" class="cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${activo ? 'bg-cneRed/20 border-cneRed shadow-md' : 'bg-cneDark border-cneBorder hover:border-white/30'}">
                    <div class="flex items-center gap-3">
                        <i class="fa-solid ${activo ? 'fa-circle-check text-cneRed' : 'fa-circle text-white/20'} text-lg"></i>
                        <div class="flex flex-col">
                            <span class="text-xs font-bold uppercase text-white leading-tight">${c.nombre}</span>
                            <span class="text-[10px] text-cneMuted">${c.desc}</span>
                        </div>
                    </div>
                    <span class="text-xs font-black text-white shrink-0 ml-2">$${c.precio}</span>
                </div>
            `;
        }).join('');
    }

    let totalCombos = 0;
    Object.values(preordenEnCurso.combosSeleccionados).forEach(c => {
        totalCombos += c.precio * c.cantidad;
    });

    const totalGeneral = subtotalBoletos + totalCombos;
    if (elTotal) elTotal.innerText = `$${totalGeneral} MXN`;
}

function generarCodigoQRUnico(codigo) {
    // Generador de QR visual de alta definición mediante QuickChart / QRServer API con respaldo seguro
    const urlEncoded = encodeURIComponent(`CINE_XILOTZIN_PREORDEN:${codigo}`);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${urlEncoded}&bgcolor=FFFFFF&color=000000`;
}

function confirmarPreorden(event) {
    if (event) event.preventDefault();

    const nombreCliente = document.getElementById('preorden-nombre')?.value.trim() || 'Cliente Cine Xilotzin';
    const telCliente = document.getElementById('preorden-telefono')?.value.trim() || 'No registrado';

    // Generar Folio único
    const folioUnico = `PRE-XIL-${Math.floor(10000 + Math.random() * 90000)}`;

    // Fechas de vigencia (De 8 a 15 días, conforme a la propuesta)
    const hoy = new Date();
    const diasVigencia = 12; // Entre 8 y 15 días
    const fechaVence = new Date(hoy);
    fechaVence.setDate(hoy.getDate() + diasVigencia);

    const formatoFecha = (d) => d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });

    const combosArray = Object.values(preordenEnCurso.combosSeleccionados);
    const subtotalBoletos = preordenEnCurso.boletosGeneral * preordenEnCurso.precioBoleto;
    let totalCombos = 0;
    combosArray.forEach(c => totalCombos += c.precio * c.cantidad);
    const total = subtotalBoletos + totalCombos;

    const nuevaPreorden = {
        codigo: folioUnico,
        cliente: nombreCliente,
        telefono: telCliente,
        pelicula: preordenEnCurso.pelicula,
        horario: preordenEnCurso.horario,
        boletosGeneral: preordenEnCurso.boletosGeneral,
        precioBoleto: preordenEnCurso.precioBoleto,
        combos: combosArray,
        total: total,
        fechaCreacion: hoy.toISOString().split('T')[0],
        fechaCreacionFormateada: formatoFecha(hoy),
        fechaVencimiento: fechaVence.toISOString().split('T')[0],
        fechaVencimientoFormateada: formatoFecha(fechaVence),
        vigenciaDias: diasVigencia,
        estado: 'PENDIENTE'
    };

    // Guardar en el almacenamiento maestro
    let preordenes = Store.get('preordenes') || [];
    preordenes.unshift(nuevaPreorden);
    Store.set('preordenes', preordenes);

    // Cerrar modal de creación y abrir ticket digital
    cerrarModalPreorden();
    mostrarTicketDigital(nuevaPreorden);
}

function mostrarTicketDigital(preorden) {
    const modalTicket = document.getElementById('modal-ticket-digital');
    if (!modalTicket) return;

    document.getElementById('ticket-folio').innerText = preorden.codigo;
    document.getElementById('ticket-pelicula').innerText = preorden.pelicula;
    document.getElementById('ticket-horario').innerText = preorden.horario;
    document.getElementById('ticket-boletos').innerText = `${preorden.boletosGeneral} Accesos Generales`;
    document.getElementById('ticket-cliente').innerText = preorden.cliente;
    document.getElementById('ticket-vigencia').innerText = `Válido del ${preorden.fechaCreacionFormateada || preorden.fechaCreacion} al ${preorden.fechaVencimientoFormateada || preorden.fechaVencimiento} (${preorden.vigenciaDias || 12} días)`;
    document.getElementById('ticket-total').innerText = `$${preorden.total} MXN`;

    const contCombos = document.getElementById('ticket-combos-resumen');
    if (contCombos) {
        if (preorden.combos && preorden.combos.length > 0) {
            contCombos.innerHTML = preorden.combos.map(c => `• ${c.nombre} (x${c.cantidad})`).join('<br>');
        } else {
            contCombos.innerText = 'Sin combos adicionales';
        }
    }

    // Cargar imagen de QR
    const qrImg = document.getElementById('ticket-qr-img');
    if (qrImg) {
        qrImg.src = generarCodigoQRUnico(preorden.codigo);
    }

    modalTicket.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarTicketDigital() {
    const modal = document.getElementById('modal-ticket-digital');
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ==========================================================
// 6. MARKETING & CAPTACIÓN DE NEWSLETTER (TOAST INTERACTIVO)
// ==========================================================
function iniciarToastNewsletter() {
    // Si ya se suscribió en esta sesión, no molestar inmediatamente
    if (sessionStorage.getItem('xilotzin_newsletter_dismissed')) return;

    setTimeout(() => {
        const toast = document.getElementById('notification-toast');
        if (!toast) return;

        toast.classList.remove('translate-y-4', 'opacity-0');
        toast.classList.add('translate-y-0', 'opacity-100');
    }, 3500);
}

function procesarSuscripcionNewsletter(event) {
    if (event) event.preventDefault();

    const inputEmail = document.getElementById('newsletter-email-input');
    if (!inputEmail || !inputEmail.value.includes('@')) {
        alert('Por favor introduce un correo electrónico válido.');
        return;
    }

    const email = inputEmail.value.trim().toLowerCase();
    let suscriptores = Store.get('suscriptores_newsletter') || [];

    if (!suscriptores.includes(email)) {
        suscriptores.push(email);
        Store.set('suscriptores_newsletter', suscriptores);
    }

    // Ocultar toast y mostrar agradecimiento
    cerrarToastNewsletter();
    mostrarAlertaToast('¡Gracias por suscribirte! Recibirás nuestras preventas exclusivas.');
    sessionStorage.setItem('xilotzin_newsletter_dismissed', 'true');
}

function cerrarToastNewsletter() {
    const toast = document.getElementById('notification-toast');
    if (toast) {
        toast.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => toast.style.display = 'none', 500);
    }
    sessionStorage.setItem('xilotzin_newsletter_dismissed', 'true');
}

function mostrarAlertaToast(mensaje) {
    let alerta = document.getElementById('alerta-flotante-global');
    if (!alerta) {
        alerta = document.createElement('div');
        alerta.id = 'alerta-flotante-global';
        alerta.className = 'fixed top-6 right-6 z-[9999] bg-cneCard border border-cneRed text-white px-5 py-3.5 rounded-xl shadow-2xl transition-all duration-300 transform -translate-y-10 opacity-0 flex items-center gap-3 text-xs font-sans font-bold uppercase tracking-wider';
        document.body.appendChild(alerta);
    }

    alerta.innerHTML = `<i class="fa-solid fa-circle-check text-cneRed text-base"></i> <span>${mensaje}</span>`;
    alerta.classList.remove('-translate-y-10', 'opacity-0');
    alerta.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        alerta.classList.add('-translate-y-10', 'opacity-0');
        alerta.classList.remove('translate-y-0', 'opacity-100');
    }, 3500);
}