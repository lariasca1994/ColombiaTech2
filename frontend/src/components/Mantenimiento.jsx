import { useEffect } from 'react'
import { useMantenimiento } from '../features/mantenimiento'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Pantalla de mantenimiento a pantalla completa, con la paleta del proyecto
 * (esmeralda, tema claro/oscuro). No reintenta acciones del usuario (podria
 * duplicarlas): consulta /health cada 15 s y recarga la pagina sola cuando
 * la API y la base vuelven.
 */
export default function Mantenimiento() {
    const activo = useMantenimiento()

    useEffect(() => {
        if (!activo) return undefined
        document.title = 'En mantenimiento · ColombiaTech'
        const intervalo = setInterval(async () => {
            try {
                const respuesta = await fetch(`${API_URL}/health`, { cache: 'no-store' })
                if (respuesta.ok) window.location.reload()
            } catch {
                // sigue caida
            }
        }, 15000)
        return () => clearInterval(intervalo)
    }, [activo])

    if (!activo) return null

    return (
        <div className="fixed inset-0 z-50 grid place-items-center p-6 bg-emerald-50 dark:bg-gray-950 text-left">
            <section
                role="status"
                aria-live="polite"
                className="w-full max-w-lg rounded-2xl border border-emerald-900/10 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl shadow-emerald-900/10 px-8 py-9"
            >
                <div className="flex items-end gap-1.5 h-10 mb-5" aria-hidden="true">
                    <span className="w-3 h-1/2 rounded bg-emerald-600 dark:bg-emerald-400 motion-safe:animate-pulse" />
                    <span className="w-3 h-full rounded bg-emerald-600 dark:bg-emerald-400 motion-safe:animate-pulse [animation-delay:200ms]" />
                    <span className="w-3 h-[70%] rounded bg-emerald-600 dark:bg-emerald-400 motion-safe:animate-pulse [animation-delay:400ms]" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400 mb-2">ColombiaTech</p>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Estamos en mantenimiento</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    El servicio no está respondiendo en este momento, así que no se pueden consultar casas, publicar ni chatear.
                </p>
                <ul className="space-y-2 mb-6 text-gray-800 dark:text-gray-200">
                    {[
                        'Tus casas, mensajes y tu cuenta siguen guardados.',
                        'Ninguna acción quedó a medias: si no viste la confirmación, no se guardó.',
                        'Esta página se recarga sola cuando el servicio vuelva.',
                    ].map((texto) => (
                        <li key={texto} className="flex gap-2.5 items-baseline">
                            <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                            {texto}
                        </li>
                    ))}
                </ul>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-emerald-950 text-white font-semibold px-5 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                    Reintentar ahora
                </button>
            </section>
        </div>
    )
}
