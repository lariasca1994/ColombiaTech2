import { useEffect, useState } from 'react'
import { useMantenimiento } from '../features/mantenimiento'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const TOTAL = 15

/**
 * Pantalla de mantenimiento a pantalla completa, con la paleta del proyecto
 * (esmeralda, tema claro/oscuro). Es una espera tranquila, distinta del 404:
 * el ícono flota entre ondas, una barra va y viene y las tres promesas van en
 * fichas. No reintenta acciones del usuario (podría duplicarlas): consulta
 * /health cada 15 s (con cuenta regresiva visible) y recarga la página sola
 * cuando la API y la base vuelven.
 */
export default function Mantenimiento() {
    const activo = useMantenimiento()
    const [resto, setResto] = useState(TOTAL)
    const [revisando, setRevisando] = useState(false)

    const revisar = async () => {
        setRevisando(true)
        try {
            const respuesta = await fetch(`${API_URL}/health`, { cache: 'no-store' })
            if (respuesta.ok) { window.location.reload(); return }
        } catch {
            // sigue caída
        }
        setRevisando(false)
        setResto(TOTAL)
    }

    useEffect(() => {
        if (!activo) return undefined
        document.title = 'En mantenimiento · Alquiler de vivienda'
        const reloj = setInterval(() => setResto((r) => (r > 0 ? r - 1 : 0)), 1000)
        return () => clearInterval(reloj)
    }, [activo])

    useEffect(() => {
        if (activo && resto === 0 && !revisando) revisar()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resto, activo])

    if (!activo) return null

    return (
        <div className="mnt" role="status" aria-live="polite">
            <div className="mnt-caja">
                <div className="orbe" aria-hidden="true"><span /><span /><span /><b><img src="/icono.svg" alt="" /></b></div>
                <p className="mnt-etiqueta">Alquiler de vivienda</p>
                <h1>Estamos en mantenimiento</h1>
                <p className="mnt-texto">
                    El servicio no está respondiendo en este momento, así que no se pueden consultar casas, publicar ni chatear.
                </p>
                <div className="mnt-barra" role="progressbar" aria-label="Esperando a que el servicio responda"><i /></div>
                <p className="mnt-nota">Si el servicio estaba dormido, suele volver en menos de un minuto.</p>
                <ul className="promesas">
                    {[
                        'Tus casas, mensajes y tu cuenta siguen guardados.',
                        'Ninguna acción quedó a medias: si no viste la confirmación, no se guardó.',
                        'Esta página se recarga sola cuando el servicio vuelva.',
                    ].map((texto) => (
                        <li key={texto}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                            <span>{texto}</span>
                        </li>
                    ))}
                </ul>
                <div className="mnt-pie">
                    <span className="reintento">
                        <svg className="cuenta" viewBox="0 0 24 24" aria-hidden="true">
                            <circle className="cuenta-fondo" cx="12" cy="12" r="9" />
                            <circle className="cuenta-valor" cx="12" cy="12" r="9" pathLength="1" style={{ strokeDashoffset: revisando ? 0 : 1 - resto / TOTAL }} />
                        </svg>
                        <span>{revisando ? 'Comprobando…' : `Reintento automático en ${resto} s`}</span>
                    </span>
                    <button type="button" onClick={revisar} disabled={revisando}
                        className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5">
                        Reintentar ahora
                    </button>
                </div>
            </div>
        </div>
    )
}
