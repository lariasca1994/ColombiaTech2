// Íconos del menú (SVG propios, sin librerías).
const TRAZOS = {
    casas: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    nueva: 'M12 8v8M8 12h8M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
    chat: 'M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z',
    perfil: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    clave: 'M15 7a4 4 0 1 1-3.9 4.9L4 19v2h3v-2h2v-2h2l1.1-1.1A4 4 0 0 1 15 7zM16 9h.01',
    escudo: 'M12 3l8 3v6c0 4.4-3.4 8.1-8 9-4.6-.9-8-4.6-8-9V6zM9 12l2 2 4-4',
    salir: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11',
    alternar: 'M11 17l-5-5 5-5M18 17l-5-5 5-5',
    mas: 'M5 12h.01M12 12h.01M19 12h.01',
    tema: 'M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z',
}

export default function Icono({ nombre }) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={nombre === 'mas' ? 3 : 1.8}
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d={TRAZOS[nombre]} />
        </svg>
    )
}
