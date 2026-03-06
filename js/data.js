const cineData = {
    precioBoleto: 50,
    peliculas: [
        // --- LAS DEL FLYER ORIGINAL ---
        {
            id: 1,
            titulo: 'Caminos del Crimen',
            clasificacion: 'B15',
            duracion: '120 min',
            genero: 'Acción',
            poster: 'https://www.sonypictures.com.mx/sites/mexico/files/2026-01/C101_1400x2100%201.jpg',
            horarios: ['14:00 ESP']
        },
        {
            id: 2,
            titulo: 'Operación Bebé Oso',
            clasificacion: 'AA',
            duracion: '95 min',
            genero: 'Infantil',
            poster: 'https://storage.googleapis.com/citicinemas-store/Movie-2235/poster/Rgp7xJ2cPypW/Poster%20-%20OBO.jpg',
            horarios: ['16:40 ESP']
        },
        {
            id: 3,
            titulo: 'Cumbres Borrascosas',
            clasificacion: 'B',
            duracion: '130 min',
            genero: 'Drama',
            poster: 'https://assets.biggerpicture.ai/assets/HO-1670/eventmaster/1271_4.png',
            horarios: ['18:40 ESP']
        },
        
        // --- BLOCKBUSTERS AGREGADOS PARA RELLENAR CARTELERA ---
        {
            id: 4,
            titulo: 'The Batman Part II',
            clasificacion: 'B15',
            duracion: '165 min',
            genero: 'Acción/Crimen',
            poster: 'https://www.noroeste.com.mx/binrepository/481x600/0c0/0d0/none/12707/PPCM/mv5botkwotzlnwetn2yxms00mzy0lwexmzit_1-10965776_20250808121943.jpg',
            horarios: ['15:30 ESP', '19:15 ESP', '22:45 ESP']
        },
        {
            id: 5,
            titulo: 'Super Mario Bros La Película',
            clasificacion: 'AA',
            duracion: '105 min',
            genero: 'Animación',
            poster: 'https://www.universalpictures-latam.com/tl_files/content/movies/super_mario_bros/posters/02.jpg',
            horarios: ['12:00 ESP', '14:15 ESP', '16:30 ESP', '18:45 ESP']
        },
        {
            id: 6,
            titulo: 'Avatar: Fuego y Ceniza',
            clasificacion: 'B',
            duracion: '190 min',
            genero: 'Ciencia Ficción',
            poster: 'https://lumiere-a.akamaihd.net/v1/images/image_8ac3fa97.jpeg',
            horarios: ['13:00 ESP', '17:00 ESP', '21:00 ESP']
        },
        {
            id: 7,
            titulo: 'Five Nights at Freddy\'s 2',
            clasificacion: 'C',
            duracion: '115 min',
            genero: 'Terror',
            poster: 'https://m.media-amazon.com/images/M/MV5BZmQ3NmIxNTgtYjFiNS00NzliLWI0YzAtZDkxY2E0YWIxZDEwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
            horarios: ['20:00 ESP', '22:30 ESP']
        },
        {
            id: 8,
            titulo: 'Dune: Messiah',
            clasificacion: 'B15',
            duracion: '150 min',
            genero: 'Sci-Fi/Épico',
            poster: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2e317a1c-f1ce-4a5f-90db-d88cc01db2d0/djtls6c-f393245c-f5d8-46b1-817d-74366dd218ab.png/v1/fill/w_734,h_1088,q_70,strp/dune_3_messiah_teaser_poster_new__date_2026_by_mrandrew7w7_djtls6c-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTUwMCIsInBhdGgiOiIvZi8yZTMxN2ExYy1mMWNlLTRhNWYtOTBkYi1kODhjYzAxZGIyZDAvZGp0bHM2Yy1mMzkzMjQ1Yy1mNWQ4LTQ2YjEtODE3ZC03NDM2NmRkMjE4YWIucG5nIiwid2lkdGgiOiI8PTEwMTIifV1dLCJhdWQiOlsidXJuOnNlcnZpY2U6aW1hZ2Uub3BlcmF0aW9ucyJdfQ.FcbNHA3Rn6xcFPLskfJj0Lq4Bm7TolfbdaV23AtC_w4',
            horarios: ['16:00 ESP', '19:40 ESP']
        }
    ]
};