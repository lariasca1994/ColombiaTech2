import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

/**
 * 404 propio de Alquiler de vivienda: la tarjeta de una casa sin dirección
 * (con el sello "NO ENCONTRADA") y un mensaje de chat que nadie responde. El
 * botón principal lleva a las casas; la sesión sigue abierta.
 */
export default function NoEncontrada() {
    const { pathname } = useLocation()
    const conSesion = useSelector((state) => state.auth.isAutheticated)

    return (
        <div className="nf">
            <div className="nf-arte" aria-hidden="true">
                <div className="nf-casa">
                    <div className="nf-foto">
                        <svg viewBox="0 0 40 30" fill="currentColor"><path d="M4 16 L20 4 L36 16 V30 H4 Z" /></svg>
                        <span className="nf-sello">NO ENCONTRADA</span>
                    </div>
                    <div className="nf-datos">
                        <p className="nf-ciudad">Sin dirección</p>
                        <p className="nf-ruta">{pathname}</p>
                        <p className="nf-precio">404</p>
                    </div>
                </div>
                <div className="nf-mensaje">
                    <p>Hola, ¿esta casa sigue disponible?</p>
                    <span>enviado · sin respuesta</span>
                </div>
            </div>
            <div className="nf-texto">
                <h1>Esta dirección no tiene casa</h1>
                <p>
                    No hay nada en <code>{pathname}</code>. Puede que el enlace sea viejo o que la casa se haya
                    retirado.{conSesion && ' Tu sesión sigue abierta.'}
                </p>
                <div className="nf-acciones">
                    <Link to={conSesion ? '/house' : '/login'} className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 min-h-[44px] inline-flex items-center">
                        {conSesion ? 'Ver casas' : 'Iniciar sesión'}
                    </Link>
                    <Link to="/" className="rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 font-bold px-5 py-3 min-h-[44px] inline-flex items-center">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </div>
    )
}
