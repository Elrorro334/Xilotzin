const Store = {
    set: (key, data) => localStorage.setItem(`xilotzin_${key}`, JSON.stringify(data)),
    get: (key) => {
        const data = localStorage.getItem(`xilotzin_${key}`);
        return data ? JSON.parse(data) : null;
    },
    remove: (key) => localStorage.removeItem(`xilotzin_${key}`),
    clear: () => localStorage.clear()
};

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('movie-grid')) {
        renderIndex();
    }
    if (document.getElementById('seating-grid')) {
        renderAsientosGigante();
    }
    if (document.getElementById('resumen-titulo')) {
        renderPago();
    }
    if (document.getElementById('historial-boletos')) {
        renderPerfil();
    }
});

function renderIndex() {
    if (typeof cineData === 'undefined') {
        console.error("Error crítico: El archivo data.js no ha cargado correctamente.");
        return;
    }

    const grid = document.getElementById('movie-grid');
    grid.innerHTML = cineData.peliculas.map(p => `
        <div class="group relative rounded-2xl overflow-hidden bg-white/5 border border-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(220,38,38,0.2)]">
            <div class="aspect-[2/3] w-full relative bg-black">
                <img src="${p.poster}" class="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-cinedark via-cinedark/40 to-transparent"></div>
                <div class="absolute top-4 right-4 bg-cinered text-white font-black px-3 py-1 rounded shadow-lg">${p.clasificacion}</div>
            </div>
            <div class="absolute bottom-0 w-full p-6">
                <h3 class="text-2xl font-black uppercase mb-1 drop-shadow-lg text-white">${p.titulo}</h3>
                <p class="text-gray-400 text-sm font-bold mb-4 uppercase">${p.genero} • ${p.duracion}</p>
                <div class="grid grid-cols-1 gap-2">
                    ${p.horarios.map(h => `
                        <button onclick="iniciarReserva(${p.id}, '${h}')" class="bg-white/10 hover:bg-cinered border border-white/20 hover:border-cinered text-white font-black py-3 rounded-xl transition uppercase tracking-widest shadow-lg">
                            ${h}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

function iniciarReserva(id, horario) {
    const peli = cineData.peliculas.find(p => p.id === id);
    Store.set('reserva', { pelicula: peli.titulo, horario: horario, asientos: [], total: 0 });
    window.location.href = 'asientos.html';
}

let asientosSeleccionados = [];
let reservaActual = null;

function renderAsientosGigante() {
    reservaActual = Store.get('reserva');
    
    if (!reservaActual) {
        window.location.href = 'index.html';
        return;
    }

    const headerPeli = document.getElementById('titulo-peli');
    const headerHorario = document.getElementById('horario-peli');
    if (headerPeli) headerPeli.innerText = reservaActual.pelicula;
    if (headerHorario) headerHorario.innerText = `HOY • ${reservaActual.horario}`;

    construirMapaButacas();
    activarZoomPaneo();
}

function construirMapaButacas() {
    const grid = document.getElementById('seating-grid');
    if (!grid) return;
    grid.innerHTML = ''; 

    const filas = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const distribucion = [5, 10, 5]; 

    filas.forEach(letraFila => {
        const filaContenedor = document.createElement('div');
        filaContenedor.className = 'flex gap-6 md:gap-10 justify-center items-center w-max';
        
        filaContenedor.insertAdjacentHTML('beforeend', `<div class="w-6 text-center text-gray-600 font-black text-sm">${letraFila}</div>`);

        let numeroAsiento = 1;

        distribucion.forEach((cantidadSillas) => {
            const bloqueDiv = document.createElement('div');
            bloqueDiv.className = 'flex gap-1 md:gap-2';

            for (let i = 0; i < cantidadSillas; i++) {
                const idAsiento = `${letraFila}${numeroAsiento}`;
                const ocupado = Math.random() < 0.25; 
                
                const btn = document.createElement('button');
                btn.setAttribute('data-seat', idAsiento);
                btn.title = `Asiento ${idAsiento}`;
                
                if (ocupado) {
                    btn.className = 'w-[32px] h-[36px] md:w-[40px] md:h-[45px] rounded-t-lg transition-all flex items-center justify-center bg-red-900/30 border-2 border-red-900/50 cursor-not-allowed shadow-[inset_0_-4px_0_rgba(0,0,0,0.4)]';
                    btn.innerHTML = `<i class="fa-solid fa-xmark text-[10px] md:text-sm text-red-500/40"></i>`;
                } else {
                    btn.className = 'seat w-[32px] h-[36px] md:w-[40px] md:h-[45px] rounded-t-lg bg-gray-800 border-2 border-white/10 text-[10px] md:text-xs font-bold text-gray-400 cursor-pointer shadow-[inset_0_-4px_0_rgba(0,0,0,0.4)] transition-all z-10';
                    btn.innerText = numeroAsiento;
                    
                    btn.onclick = function() {
                        procesarClicAsiento(this, idAsiento);
                    };
                }

                bloqueDiv.appendChild(btn);
                numeroAsiento++;
            }
            filaContenedor.appendChild(bloqueDiv);
        });

        filaContenedor.insertAdjacentHTML('beforeend', `<div class="w-6 text-center text-gray-600 font-black text-sm">${letraFila}</div>`);
        
        grid.appendChild(filaContenedor);
    });
}

function procesarClicAsiento(btnElemento, idAsiento) {
    if (asientosSeleccionados.includes(idAsiento)) {
        asientosSeleccionados = asientosSeleccionados.filter(a => a !== idAsiento);
        btnElemento.classList.remove('bg-cinegold', 'border-cinegold', 'text-black', 'scale-110', 'shadow-[0_0_15px_rgba(251,191,36,0.6)]');
        btnElemento.classList.add('bg-gray-800', 'border-white/10', 'text-gray-400');
    } else {
        if (asientosSeleccionados.length >= 7) {
            alert('Has alcanzado el límite máximo de 7 boletos por transacción.');
            return;
        }
        asientosSeleccionados.push(idAsiento);
        btnElemento.classList.remove('bg-gray-800', 'border-white/10', 'text-gray-400');
        btnElemento.classList.add('bg-cinegold', 'border-cinegold', 'text-black', 'scale-110', 'shadow-[0_0_15px_rgba(251,191,36,0.6)]');
    }
    
    refrescarBarraFooter();
}

function refrescarBarraFooter() {
    const btnContinuar = document.getElementById('btn-continuar');
    const lblAsientos = document.getElementById('texto-asientos');
    const lblPrecio = document.getElementById('texto-precio');
    
    const precioUnitario = typeof cineData !== 'undefined' ? cineData.precioBoleto : 50; 
    const total = asientosSeleccionados.length * precioUnitario;
    
    if (asientosSeleccionados.length > 0) {
        lblAsientos.innerText = `${asientosSeleccionados.length} Asientos: ${asientosSeleccionados.join(', ')}`;
        lblPrecio.innerText = total;
        
        btnContinuar.disabled = false;
        btnContinuar.className = 'bg-cinered hover:bg-red-700 text-white font-black py-4 px-8 md:px-16 rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] uppercase tracking-widest md:text-lg cursor-pointer';
    } else {
        lblAsientos.innerText = "0 Asientos";
        lblPrecio.innerText = "0";
        
        btnContinuar.disabled = true;
        btnContinuar.className = 'bg-gray-800 text-gray-500 font-black py-4 px-8 md:px-16 rounded-xl cursor-not-allowed uppercase tracking-widest shadow-lg md:text-lg';
    }
}

function avanzarPago() {
    if (asientosSeleccionados.length === 0) return;
    
    const precioUnitario = typeof cineData !== 'undefined' ? cineData.precioBoleto : 50;
    reservaActual.asientos = asientosSeleccionados;
    reservaActual.total = asientosSeleccionados.length * precioUnitario;
    
    Store.set('reserva', reservaActual);
    window.location.href = 'pago.html';
}

function activarZoomPaneo() {
    const mapContent = document.getElementById('map-content');
    const mapScroll = document.getElementById('map-scroll');
    if(!mapContent || !mapScroll) return;

    let mapScale = window.innerWidth < 768 ? 0.4 : 0.8;
    const ZOOM_STEP = 0.2;

    function aplicarTransformacion() { 
        mapContent.style.transform = `scale(${mapScale})`; 
    }
    
    window.zoomIn = () => { if (mapScale < 1.5) { mapScale += ZOOM_STEP; aplicarTransformacion(); } };
    window.zoomOut = () => { if (mapScale > 0.3) { mapScale -= ZOOM_STEP; aplicarTransformacion(); } };
    window.resetZoom = () => { 
        mapScale = window.innerWidth < 768 ? 0.4 : 0.8; 
        aplicarTransformacion(); 
        setTimeout(() => { mapScroll.scrollLeft = (mapScroll.scrollWidth - mapScroll.clientWidth) / 2; }, 100);
    };

    aplicarTransformacion();
    setTimeout(() => { mapScroll.scrollLeft = (mapScroll.scrollWidth - mapScroll.clientWidth) / 2; }, 100);

    let isDown = false, startX, startY, scrollLeft, scrollTop;

    mapScroll.addEventListener('mousedown', (e) => {
        isDown = true;
        mapScroll.style.cursor = 'grabbing';
        startX = e.pageX - mapScroll.offsetLeft;
        startY = e.pageY - mapScroll.offsetTop;
        scrollLeft = mapScroll.scrollLeft;
        scrollTop = mapScroll.scrollTop;
    });

    mapScroll.addEventListener('mouseleave', () => { isDown = false; mapScroll.style.cursor = 'auto'; });
    mapScroll.addEventListener('mouseup', () => { isDown = false; mapScroll.style.cursor = 'auto'; });
    mapScroll.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - mapScroll.offsetLeft;
        const y = e.pageY - mapScroll.offsetTop;
        mapScroll.scrollLeft = scrollLeft - (x - startX) * 2;
        mapScroll.scrollTop = scrollTop - (y - startY) * 2;
    });
}

function renderPago() {
    const reserva = Store.get('reserva');
    if (!reserva || reserva.asientos.length === 0) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('resumen-titulo').innerText = reserva.pelicula;
    document.getElementById('resumen-horario').innerText = `HOY • ${reserva.horario}`;
    document.getElementById('resumen-boletos').innerText = `Boletos (${reserva.asientos.length})`;
    document.getElementById('resumen-asientos').innerText = reserva.asientos.join(', ');
    document.getElementById('resumen-total').innerText = reserva.total;
    
    const btnTotal = document.getElementById('btn-total');
    if (btnTotal) btnTotal.innerText = reserva.total;
}

function procesarPago(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmit');
    if (btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PROCESANDO...';
        btn.classList.replace('bg-cinered', 'bg-gray-600');
        btn.disabled = true;
    }

    setTimeout(() => {
        const reserva = Store.get('reserva');
        if (reserva) {
            let historial = Store.get('historial') || [];
            reserva.idBoleto = Math.random().toString(36).substr(2, 8).toUpperCase();
            reserva.fecha = new Date().toLocaleDateString('es-MX');
            historial.push(reserva);
            Store.set('historial', historial);
        }

        Store.remove('reserva');
        alert('¡Transacción aprobada! Boleto generado con éxito.');
        window.location.href = 'perfil.html';
    }, 1500);
}

function renderPerfil() {
    const contenedor = document.getElementById('historial-boletos');
    const historial = Store.get('historial') || [];

    if (historial.length === 0) {
        contenedor.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                <i class="fa-solid fa-ticket text-6xl mb-4 opacity-30"></i>
                <p class="text-xl font-bold uppercase tracking-widest">Aún no tienes boletos</p>
                <a href="index.html" class="mt-8 bg-white/10 hover:bg-cinered border border-white/20 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest transition-all">Ir a Cartelera</a>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = historial.map(boleto => `
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden group hover:border-cinegold/50 transition-all duration-300">
            <div class="absolute -right-10 -top-10 w-32 h-32 bg-cinegold/10 rounded-full blur-3xl group-hover:bg-cinegold/20 transition-all duration-500"></div>
            
            <div class="flex-grow z-10">
                <p class="text-cinegold font-bold text-xs md:text-sm tracking-widest mb-1">TICKET #${boleto.idBoleto}</p>
                <h3 class="text-xl md:text-2xl font-black uppercase text-white mb-4">${boleto.pelicula}</h3>
                
                <div class="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                        <p class="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Horario</p>
                        <p class="text-white font-bold text-sm md:text-base">${boleto.horario}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Fecha de Compra</p>
                        <p class="text-white font-bold text-sm md:text-base">${boleto.fecha}</p>
                    </div>
                    <div class="col-span-2">
                        <p class="text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Asientos (${boleto.asientos.length})</p>
                        <p class="text-white font-bold tracking-widest text-sm md:text-base break-words">${boleto.asientos.join(', ')}</p>
                    </div>
                </div>
            </div>

            <div class="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 z-10 shrink-0">
                <div class="bg-white p-1 rounded-lg hidden md:block mb-4">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${boleto.idBoleto}" class="w-16 h-16 md:w-20 md:h-20 opacity-90" alt="QR Boleto">
                </div>
                <div class="text-left md:text-right">
                    <p class="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1">Total Pagado</p>
                    <p class="text-xl md:text-2xl font-black text-white">$${boleto.total} <span class="text-xs text-cinegold">MXN</span></p>
                </div>
                <div class="bg-white p-1 rounded-lg md:hidden">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${boleto.idBoleto}" class="w-12 h-12 opacity-90" alt="QR Boleto">
                </div>
            </div>
        </div>
    `).reverse().join('');
}