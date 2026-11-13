import { useEffect, useRef, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'

const reducir = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Transición en cada cambio de pantalla (la de toda la plataforma): la pantalla
 * que sale se desenfoca y se corre (180 ms) y la nueva entra por bloques desde
 * el lado hacia donde se navega. Envuelve el <Outlet /> de un layout: mientras
 * sale, se sigue mostrando la pantalla anterior.
 *
 * - orden: rutas en el orden del menú (define hacia dónde entra la nueva).
 * - modo(desde, hacia): "avanza" (horizontal) o "arriba" (vertical).
 */
export default function Transicion({ orden = [], modo, className = '' }) {
    const location = useLocation()
    const outlet = useOutlet()
    const anterior = useRef(outlet)
    const [estado, setEstado] = useState({ clave: location.pathname, fase: 'entra', dir: 1, modo: 'avanza' })

    // Mientras la ruta no cambia, se guarda la pantalla actual (la que saldrá).
    if (estado.clave === location.pathname) anterior.current = outlet

    useEffect(() => {
        if (location.pathname === estado.clave) return undefined
        const indice = (ruta) => {
            const i = orden.findIndex((r) => ruta === r || ruta.startsWith(`${r}/`))
            return i < 0 ? orden.length : i
        }
        const dir = indice(location.pathname) >= indice(estado.clave) ? 1 : -1
        const m = modo ? modo(estado.clave, location.pathname) : 'avanza'
        if (reducir()) {
            setEstado({ clave: location.pathname, fase: 'entra', dir, modo: m })
            return undefined
        }
        setEstado((e) => ({ ...e, fase: 'sale', dir, modo: m }))
        const t = setTimeout(() => setEstado({ clave: location.pathname, fase: 'entra', dir, modo: m }), 170)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname])

    const mostrando = estado.clave === location.pathname ? outlet : anterior.current
    return (
        <div
            key={estado.clave}
            className={`${estado.fase === 'sale' ? 'transicion-sale' : 'transicion-entra'} ${className}`}
            data-modo={estado.modo}
            style={{ '--dir': estado.dir }}
        >
            {mostrando}
        </div>
    )
}
