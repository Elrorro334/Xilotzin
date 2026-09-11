// ==========================================================
// CINE TEATRO XILOTZIN - MOTOR DE DATOS Y PERSISTENCIA MAESTRA
// ==========================================================

const TMDB_API_KEY = 'a9b90184f1235d3b78c24e4b31e993b8';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w500';
const TMDB_IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// Catálogo base de películas en exhibición para Cine Xilotzin
const catalogoLocal = [
    { id: 1, titulo: 'Caminos del Crimen', horarios: ['10:30', '15:00', '19:30'] },
    { id: 2, titulo: 'Payaso terrifier', horarios: ['12:30', '17:15', '22:00'] },
    { id: 3, titulo: 'La posesion de la momia', horarios: ['14:30', '19:00'] },
    { id: 4, titulo: 'Spiderman', horarios: ['11:00', '16:30', '21:15'] },
    { id: 5, titulo: 'The Super Mario Bros. Movie', horarios: ['13:00', '16:00', '18:45'] },
    { id: 6, titulo: 'Avatar: Fire and Ash', horarios: ['15:30', '21:00'] },
    { id: 7, titulo: 'Five Nights at Freddy\'s 2', horarios: ['17:45', '20:30', '23:15'] },
    { id: 8, titulo: 'Super Mario Galaxy', horarios: ['09:00', '12:00', '14:45'] }
];

// Almacén seguro con LocalStorage
const XilotzinDB = {
    get: (key, defaultValue = null) => {
        try {
            const data = localStorage.getItem(`xilotzin_${key}`);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error leyendo LocalStorage:', e);
            return defaultValue;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(`xilotzin_${key}`, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error guardando en LocalStorage:', e);
            return false;
        }
    }
};

// Inventario inicial con lógica de fraccionamiento para Pizza
const INVENTARIO_INICIAL = [
    { sku: '7501001', nombre: 'Palomitas Grandes', cat: 'Snacks', stock: 85, min: 20, costo: 15.00, precio: 50.00, img: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=400&auto=format&fit=crop' },
    { sku: '7501002', nombre: 'Refresco 600ml', cat: 'Bebidas', stock: 120, min: 30, costo: 10.00, precio: 35.00, img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop' },
    { sku: '7501003', nombre: 'Nachos con Queso', cat: 'Snacks', stock: 40, min: 15, costo: 25.00, precio: 65.00, img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400&auto=format&fit=crop' },
    { sku: '7501004', nombre: 'Chips / Frituras', cat: 'Dulces', stock: 35, min: 12, costo: 12.00, precio: 25.00, img: 'https://images.unsplash.com/photo-1566478989037-e924e50cb792?q=80&w=400&auto=format&fit=crop' },
    { sku: '7501005', nombre: 'Sopa Maruchan Preparada', cat: 'Comida', stock: 24, min: 10, costo: 14.00, precio: 30.00, img: 'https://images.pexels.com/photos/29269189/pexels-photo-29269189.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=400' },
    { 
        sku: '7501006', 
        nombre: 'Pizza (Rebanada Individual)', 
        cat: 'Comida', 
        stockRebanadas: 56, // Total rebanadas en stock (7 pizzas enteras de 8 rebanadas)
        esFraccionado: true,
        rebanadasPorPizza: 8,
        costo: 15.00, 
        precio: 35.00, 
        img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop' 
    },
    { 
        sku: '7501007', 
        nombre: 'Pizza Completa (8 Rebanadas)', 
        cat: 'Comida', 
        esPizzaCompleta: true,
        costo: 120.00, 
        precio: 180.00, 
        img: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=400&auto=format&fit=crop' 
    }
];

// Combos para Pre-orden y POS
const COMBOS_INICIALES = [
    { id: 'C01', sku: 'COMBO01', nombre: 'Combo Pareja Xilotzin', desc: '1 Palomitas Gdes + 2 Refrescos 600ml', precio: 110.00, img: 'https://images.unsplash.com/photo-1585647347384-2593bc35786b?q=80&w=400' },
    { id: 'C02', sku: 'COMBO02', nombre: 'Combo Mega Cine', desc: '1 Palomitas + 1 Refresco + 1 Nachos', precio: 135.00, img: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?q=80&w=400' },
    { id: 'C03', sku: 'COMBO03', nombre: 'Combo Pizza Familiar', desc: '1 Pizza Completa + 2 Refrescos 600ml', precio: 230.00, img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400' }
];

// Noticias y avisos de la pantalla de inicio
const NOTICIAS_INICIALES = [
    {
        id: 1,
        titulo: '¡Gran Estreno de Medianoche Este Jueves!',
        tag: 'Estreno Exclusivo',
        descripcion: 'Aparta tus boletos de acceso general en preventa. Sonido digital envolvente y pantalla gigante en Jilotepec.',
        fecha: 'Válido esta semana',
        bg: 'from-red-950/80 via-black to-red-950/80',
        icono: 'fa-clapperboard'
    },
    {
        id: 2,
        titulo: 'Miércoles 2x1 en Boletos de Taquilla',
        tag: 'Promoción Tradicional',
        descripcion: 'Todos los miércoles vive el séptimo arte al doble. Aplica en todas las funciones y horarios del día.',
        fecha: 'Todos los miércoles',
        bg: 'from-amber-950/80 via-black to-neutral-950',
        icono: 'fa-ticket'
    },
    {
        id: 3,
        titulo: 'Pre-ordena en Línea y Paga en Taquilla',
        tag: 'Nuevo Módulo QR',
        descripcion: 'Genera tu código QR con validez de 8 a 15 días. Llega a caja física, escanea tu ticket digital y evita filas.',
        fecha: 'Servicio 24/7',
        bg: 'from-emerald-950/80 via-black to-neutral-950',
        icono: 'fa-qrcode'
    }
];

// Generar pre-órdenes demo con QR válido
function generarPreordenesDemo() {
    const hoy = new Date();
    const vencimiento1 = new Date(hoy);
    vencimiento1.setDate(hoy.getDate() + 10);
    const vencimiento2 = new Date(hoy);
    vencimiento2.setDate(hoy.getDate() + 14);

    return [
        {
            codigo: 'PRE-XIL-84920',
            cliente: 'Carlos Méndez (Demo)',
            telefono: '55 2341 8920',
            pelicula: 'The Super Mario Bros. Movie',
            horario: '16:00',
            boletosGeneral: 2,
            precioBoleto: 50,
            combos: [{ nombre: 'Combo Pareja Xilotzin', cantidad: 1, precio: 110 }],
            total: 210,
            fechaCreacion: hoy.toISOString().split('T')[0],
            fechaVencimiento: vencimiento1.toISOString().split('T')[0],
            estado: 'PENDIENTE',
            vigenciaDias: 10
        },
        {
            codigo: 'PRE-XIL-91044',
            cliente: 'Valeria Soto (Demo)',
            telefono: '55 8912 3445',
            pelicula: 'Spiderman',
            horario: '16:30',
            boletosGeneral: 3,
            precioBoleto: 50,
            combos: [{ nombre: 'Combo Mega Cine', cantidad: 1, precio: 135 }],
            total: 285,
            fechaCreacion: hoy.toISOString().split('T')[0],
            fechaVencimiento: vencimiento2.toISOString().split('T')[0],
            estado: 'PENDIENTE',
            vigenciaDias: 14
        }
    ];
}

// Ventas históricas para cortes cinematográficos de Jueves a Miércoles
function generarVentasHistoricasDemo() {
    const ventas = [];
    const metodos = ['Efectivo', 'Tarjeta Mercado Pago'];
    const cajeros = ['Cajero Taquilla 1 (Turno Vespertino)', 'Cajero Taquilla 2 (Turno Matutino)'];
    
    // Generar 18 transacciones distribuidas en los últimos días
    for (let i = 0; i < 18; i++) {
        const d = new Date();
        d.setDate(d.getDate() - (i % 7));
        const esTaquilla = i % 2 === 0;
        const total = esTaquilla ? (i % 3 + 1) * 50 : ((i % 4 + 1) * 35 + 50);
        ventas.push({
            folio: `VT-${1000 + i}`,
            fecha: d.toISOString().split('T')[0],
            hora: `${12 + (i % 10)}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60}`,
            tipo: esTaquilla ? 'Taquilla' : 'Dulcería',
            concepto: esTaquilla ? `Boletos Acceso General (${(i % 3) + 1})` : 'Combos y Palomitas',
            cantidad: (i % 3) + 1,
            total: total,
            metodo: metodos[i % 2],
            cajero: cajeros[i % 2]
        });
    }
    return ventas;
}

// Entradas de mercancía demo
const ENTRADAS_MERCANCIA_INICIAL = [
    { id: 'ENT-001', fecha: '2026-04-10', proveedor: 'Distribuidora Central de Dulces', factura: 'F-9821', producto: 'Palomitas Grandes (Grano)', cantidad: 100, costoUnitario: 15.00, total: 1500.00 },
    { id: 'ENT-002', fecha: '2026-04-11', proveedor: 'Bebidas del Valle', factura: 'F-4412', producto: 'Refresco Jarabe / Botellas', cantidad: 150, costoUnitario: 10.00, total: 1500.00 },
    { id: 'ENT-003', fecha: '2026-04-12', proveedor: 'Pizzas Artesanales Jilotepec', factura: 'F-1029', producto: 'Bases de Pizza (64 rebanadas)', cantidad: 8, costoUnitario: 120.00, total: 960.00 }
];

// Inicializar almacenamiento si es la primera vez
if (!XilotzinDB.get('inventario')) XilotzinDB.set('inventario', INVENTARIO_INICIAL);
if (!XilotzinDB.get('combos')) XilotzinDB.set('combos', COMBOS_INICIALES);
if (!XilotzinDB.get('noticias')) XilotzinDB.set('noticias', NOTICIAS_INICIALES);
if (!XilotzinDB.get('preordenes')) XilotzinDB.set('preordenes', generarPreordenesDemo());
if (!XilotzinDB.get('ventas')) XilotzinDB.set('ventas', generarVentasHistoricasDemo());
if (!XilotzinDB.get('entradas_mercancia')) XilotzinDB.set('entradas_mercancia', ENTRADAS_MERCANCIA_INICIAL);
if (!XilotzinDB.get('suscriptores_newsletter')) XilotzinDB.set('suscriptores_newsletter', ['cinefilo_jilotepec@gmail.com', 'rodrigo_cine@outlook.com']);
if (!XilotzinDB.get('tema_activo')) XilotzinDB.set('tema_activo', 'traditional');

// Configuración de Seguridad y Control de Accesos
const CONFIG_SEGURIDAD_DEFECTO = {
    ipCineAutorizada: '192.168.1.105',
    ipActualSimulada: '192.168.1.105', // Por defecto simula estar dentro de la red del cine
    horarioInicioVendedor: '10:00',
    horarioFinVendedor: '23:30',
    excepcionHorasExtras: false,
    permitirAccesoExternoDemo: false
};
if (!XilotzinDB.get('config_seguridad')) XilotzinDB.set('config_seguridad', CONFIG_SEGURIDAD_DEFECTO);

// Función constructora con API TMDB y respaldo garantizado
async function generarCineData() {
    try {
        const peliculasPromesas = catalogoLocal.map(async (item) => {
            try {
                const searchRes = await fetch(`${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=es-MX&query=${encodeURIComponent(item.titulo)}`);
                const searchData = await searchRes.json();

                if (searchData.results && searchData.results.length > 0) {
                    const movieId = searchData.results[0].id;
                    const detailRes = await fetch(`${TMDB_BASE}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-MX&append_to_response=release_dates,credits,videos`);
                    const d = await detailRes.json();

                    const release = d.release_dates?.results?.find(r => r.iso_3166_1 === 'MX') || d.release_dates?.results?.find(r => r.iso_3166_1 === 'US');
                    const cert = release ? release.release_dates[0].certification : 'B';
                    const mapaCert = { 'R': 'C', 'PG-13': 'B15', 'PG': 'B', 'G': 'AA', 'NC-17': 'C' };

                    return {
                        id: item.id,
                        titulo: d.title || item.titulo,
                        eslogan: d.tagline || 'Cine Tradicional en Jilotepec',
                        clasificacion: mapaCert[cert] || cert || 'B',
                        duracion: d.runtime ? `${d.runtime} min` : '120 min',
                        genero: d.genres && d.genres.length > 0 ? d.genres[0].name : 'Cine',
                        generosCompletos: d.genres ? d.genres.map(g => g.name).join(', ') : '',
                        calificacion: d.vote_average ? d.vote_average.toFixed(1) : '8.5',
                        poster: d.poster_path ? `${TMDB_IMG}${d.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600',
                        fondo: d.backdrop_path ? `${TMDB_IMG_ORIGINAL}${d.backdrop_path}` : '',
                        descripcion: d.overview || 'Disfruta de esta emocionante producción en nuestra pantalla gigante con audio cinematográfico inmersivo.',
                        año: d.release_date ? d.release_date.split('-')[0] : '2026',
                        director: d.credits?.crew?.find(c => c.job === 'Director')?.name || 'Director Cinematográfico',
                        actores: d.credits?.cast?.slice(0, 3).map(a => a.name).join(', ') || 'Elenco estelar',
                        trailerKey: d.videos?.results?.find(v => v.site === 'YouTube' && v.type === 'Trailer')?.key || null,
                        horarios: item.horarios
                    };
                }
            } catch (err) {
                console.warn(`TMDB soft fallback para ${item.titulo}:`, err);
            }

            // Fallback de alta calidad
            const postersFallback = {
                1: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600',
                2: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600',
                3: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600',
                4: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600',
                5: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600',
                6: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600',
                7: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600',
                8: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600'
            };

            return {
                id: item.id,
                titulo: item.titulo,
                eslogan: 'Gran Función en Pantalla Gigante',
                clasificacion: 'B',
                duracion: '115 min',
                genero: 'Estreno',
                generosCompletos: 'Acción, Aventuras',
                calificacion: '8.4',
                poster: postersFallback[item.id] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600',
                fondo: '',
                descripcion: 'Vive la magia del cine tradicional en el corazón de Jilotepec. Sonido digital y la mejor dulcería.',
                año: '2026',
                director: 'Director de Cine',
                actores: 'Reparto oficial',
                trailerKey: null,
                horarios: item.horarios
            };
        });

        const peliculasFinales = await Promise.all(peliculasPromesas);
        return { precioBoleto: 50, peliculas: peliculasFinales };
    } catch (error) {
        console.error('Error generando CineData:', error);
        return { precioBoleto: 50, peliculas: [] };
    }
}

const postersFallbackGlobal = {
    1: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600',
    2: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600',
    3: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?q=80&w=600',
    4: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=600',
    5: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600',
    6: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600',
    7: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600',
    8: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=600'
};

const fallbackPeliculasSincronas = catalogoLocal.map(item => ({
    id: item.id,
    titulo: item.titulo,
    eslogan: 'Gran Función en Pantalla Gigante',
    clasificacion: 'B',
    duracion: '115 min',
    genero: 'Estreno',
    generosCompletos: 'Acción, Aventuras',
    calificacion: '8.4',
    poster: postersFallbackGlobal[item.id] || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600',
    fondo: '',
    descripcion: 'Vive la magia del cine tradicional en el corazón de Jilotepec. Sonido digital y la mejor dulcería.',
    año: '2026',
    director: 'Director de Cine',
    actores: 'Reparto oficial',
    trailerKey: null,
    horarios: item.horarios
}));

window.cineData = { precioBoleto: 50, peliculas: fallbackPeliculasSincronas };

generarCineData().then(data => {
    if (data && data.peliculas && data.peliculas.length > 0) {
        window.cineData = data;
    }
    document.dispatchEvent(new Event('CarteleraLista'));
});