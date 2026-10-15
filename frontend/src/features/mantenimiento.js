import { useSyncExternalStore } from 'react'

/**
 * Estado global de "mantenimiento": se activa cuando la API propia (Render)
 * no responde o responde 502/503/504 (MongoDB caido). Lo activa el middleware
 * de store.js y lo lee <Mantenimiento /> para mostrar su pantalla.
 *
 * La API externa (api-colombia) no cuenta: si ella falla, la app sigue.
 */
const API_PROPIAS = ['api/', 'housesApi/', 'messageApi/']

let activo = false
const oyentes = new Set()

export function activarMantenimiento() {
    if (activo) return
    activo = true
    oyentes.forEach((oyente) => oyente())
}

export function useMantenimiento() {
    return useSyncExternalStore(
        (oyente) => { oyentes.add(oyente); return () => oyentes.delete(oyente) },
        () => activo,
    )
}

/** Middleware de Redux: mira las peticiones rechazadas de RTK Query. */
export const vigilarMantenimiento = () => (next) => (action) => {
    if (action.type?.endsWith('/rejected') && API_PROPIAS.some((p) => action.type.startsWith(p))) {
        const estado = action.payload?.status
        if (estado === 'FETCH_ERROR' || [502, 503, 504].includes(estado)) activarMantenimiento()
    }
    return next(action)
}
