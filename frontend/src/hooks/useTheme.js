import { useEffect, useState } from 'react'

const CLAVE = 'colombiatech-tema'

function obtenerTemaInicial() {
    try {
        const guardado = localStorage.getItem(CLAVE)
        if (guardado === 'claro' || guardado === 'oscuro') return guardado
    } catch (e) {
        // localStorage no disponible (modo privado, etc.) -> usar claro por defecto
    }
    return document.documentElement.getAttribute('data-tema') === 'oscuro' ? 'oscuro' : 'claro'
}

/** Hook para leer y alternar el tema claro/oscuro de toda la app.
 *  Sincroniza el atributo data-tema en <html> (usado por Tailwind, ver
 *  tailwind.config.js -> darkMode) y lo persiste en localStorage. */
export default function useTheme() {
    const [tema, setTema] = useState(obtenerTemaInicial)

    useEffect(() => {
        document.documentElement.setAttribute('data-tema', tema)
        try {
            localStorage.setItem(CLAVE, tema)
        } catch (e) {
            // si falla el guardado, el tema sigue funcionando solo en esta sesión
        }
    }, [tema])

    const alternarTema = () => {
        setTema((actual) => (actual === 'oscuro' ? 'claro' : 'oscuro'))
    }

    return { tema, alternarTema }
}
