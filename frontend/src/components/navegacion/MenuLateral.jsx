import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../features/authSlice'
import useTheme from '../../hooks/useTheme'
import Icono from './Iconos'

const reducir = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const guardar = (clave, valor) => { try { sessionStorage.setItem(clave, valor) } catch { /* sin almacenamiento */ } }
const leer = (clave) => { try { return sessionStorage.getItem(clave) } catch { return null } }

/** Orden del menú: lo usa también la transición entre pantallas. */
export const ORDEN_MENU = ['/house', '/create-house', '/chat', '/user', '/change-password', '/seguridad']

/**
 * Menú lateral (antes barra superior), igual al del resto del portafolio: entra
 * en cascada la primera vez, un fondo suave sigue al ratón, la opción activa
 * lleva un haz de luz que se desliza al cambiar de sección y se compacta a
 * solo íconos (con una etiqueta del nombre al pasar el ratón). En el teléfono
 * es una barra de vidrio abajo con una hoja "Más". Mismas opciones y textos
 * que tenía la cabecera.
 */
export default function MenuLateral() {
    const user = useSelector((state) => state.auth.user)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const { alternarTema } = useTheme()
    const nav = useRef(null)
    const ind = useRef(null)
    const hov = useRef(null)
    const etiqueta = useRef(null)
    const hoja = useRef(null)
    const [compacto, setCompacto] = useState(() => document.documentElement.getAttribute('data-menu') === 'compacto')

    const opciones = [
        { to: '/house', icono: 'casas', largo: 'Ver casas', corto: 'Casas', activa: pathname === '/house' || pathname.startsWith('/house/') },
        { to: '/create-house', icono: 'nueva', largo: 'Crear casa', corto: 'Crear', activa: pathname === '/create-house' },
        { to: '/chat', icono: 'chat', largo: 'Chat', corto: 'Chat', activa: pathname === '/chat' },
        { to: `/user/${user?._id}`, icono: 'perfil', largo: 'Profile', corto: 'Profile', activa: pathname.startsWith('/user/'), soloAmplio: true },
        { to: '/change-password', icono: 'clave', largo: 'Change Password', corto: 'Clave', activa: pathname === '/change-password', soloAmplio: true },
        { to: '/seguridad', icono: 'escudo', largo: 'Seguridad', corto: 'Seguridad', activa: pathname === '/seguridad', soloAmplio: true },
    ]
    const enMas = opciones.some((o) => o.soloAmplio && o.activa)

    const salir = () => {
        dispatch(logout())
        localStorage.removeItem('sessionData')
        navigate('/login')
    }

    const ubicar = (capa, op) => {
        if (!capa || !op) return
        capa.style.transform = `translate(${op.offsetLeft}px,${op.offsetTop}px)`
        capa.style.width = `${op.offsetWidth}px`
        capa.style.height = `${op.offsetHeight}px`
    }

    const visibles = () => [...(nav.current?.querySelectorAll('.menu-op') || [])].filter((o) => o.offsetParent !== null)

    const colocar = useCallback((sinAnim) => {
        if (!nav.current || !ind.current) return
        let a = nav.current.querySelector('.menu-op[aria-current="page"]')
        if ((!a || a.offsetParent === null) && enMas) a = nav.current.querySelector('.menu-mas')
        if (!a || a.offsetParent === null) { ind.current.style.opacity = '0'; return }
        ind.current.style.opacity = '1'
        if (sinAnim) nav.current.classList.add('menu-sin-anim')
        ubicar(ind.current, a)
        if (sinAnim) requestAnimationFrame(() => requestAnimationFrame(() => nav.current?.classList.remove('menu-sin-anim')))
    }, [enMas])

    // El indicador parte de la opción anterior y se desliza a la actual.
    useLayoutEffect(() => {
        const ops = visibles()
        const activa = nav.current?.querySelector('.menu-op[aria-current="page"]')
        const indice = activa ? ops.indexOf(activa) : -1
        const previo = parseInt(leer('ct-menu-indice') || '', 10)
        if (!reducir() && !Number.isNaN(previo) && ops[previo] && previo !== indice && activa && ind.current) {
            nav.current.classList.add('menu-sin-anim')
            ubicar(ind.current, ops[previo])
            requestAnimationFrame(() => requestAnimationFrame(() => { nav.current?.classList.remove('menu-sin-anim'); colocar(false) }))
        } else {
            colocar(true)
        }
        if (indice >= 0) guardar('ct-menu-indice', String(indice))
    }, [pathname, colocar])

    useEffect(() => {
        const raiz = document.documentElement
        raiz.classList.add('menu-listo')
        guardar('ct-menu-visto', '1')
        const t = setTimeout(() => raiz.classList.remove('menu-primera'), 1100)
        const ro = window.ResizeObserver ? new ResizeObserver(() => colocar(true)) : null
        ro?.observe(nav.current)
        const alCambiarTamano = () => colocar(true)
        window.addEventListener('resize', alCambiarTamano)
        return () => { clearTimeout(t); ro?.disconnect(); window.removeEventListener('resize', alCambiarTamano) }
    }, [colocar])

    const alternarMenu = () => {
        const nuevo = !compacto
        setCompacto(nuevo)
        document.documentElement.setAttribute('data-menu', nuevo ? 'compacto' : 'extendido')
        try { localStorage.setItem('colombiatech-menu', nuevo ? 'compacto' : 'extendido') } catch { /* nada */ }
    }

    // Fondo que sigue al ratón y etiqueta del modo compacto.
    const sobre = (e) => {
        const op = e.target.closest('.menu-op')
        if (!op || !hov.current) return
        if (!hov.current.classList.contains('listo')) {
            nav.current.classList.add('menu-sin-anim')
            ubicar(hov.current, op)
            void hov.current.offsetWidth
            nav.current.classList.remove('menu-sin-anim')
            hov.current.classList.add('listo')
        }
        ubicar(hov.current, op)
        if (etiqueta.current) {
            const r = op.getBoundingClientRect()
            etiqueta.current.textContent = (op.querySelector('.texto-largo') || op).textContent.trim()
            etiqueta.current.style.top = `${r.top + r.height / 2 - etiqueta.current.offsetHeight / 2}px`
            etiqueta.current.classList.add('visible')
        }
    }
    const fuera = () => {
        hov.current?.classList.remove('listo')
        etiqueta.current?.classList.remove('visible')
    }

    const abrirHoja = () => hoja.current?.showModal?.()
    const cerrarHoja = () => {
        const h = hoja.current
        if (!h) return
        if (reducir()) { h.close(); return }
        h.classList.add('cerrando')
        setTimeout(() => { h.classList.remove('cerrando'); h.close() }, 200)
    }

    const nombre = [user?.name, user?.lastname].filter(Boolean).join(' ')

    return (
        <>
            <aside className="menu" aria-label="Menú principal">
                <Link to="/house" className="menu-marca" style={{ '--k': 0 }}>
                    <img src="/icono.svg" alt="" /><span className="menu-texto">Alquiler de vivienda</span>
                </Link>
                <nav className="menu-nav" aria-label="Secciones" ref={nav} onMouseOver={sobre} onMouseLeave={fuera}>
                    <span className="menu-hov" ref={hov} aria-hidden="true" />
                    <span className="menu-ind" ref={ind} aria-hidden="true" />
                    {opciones.map((o, k) => (
                        <Link key={o.icono} to={o.to} className={`menu-op${o.soloAmplio ? ' solo-amplio' : ''}`} style={{ '--k': k }}
                            aria-current={o.activa ? 'page' : undefined}>
                            <Icono nombre={o.icono} />
                            <span className="menu-texto"><span className="texto-largo">{o.largo}</span><span className="texto-corto" aria-hidden="true">{o.corto}</span></span>
                        </Link>
                    ))}
                    <button type="button" className="menu-op menu-mas solo-movil" aria-haspopup="dialog" onClick={abrirHoja}
                        style={enMas ? { color: 'var(--c-acento-texto)', fontWeight: 600 } : undefined}>
                        <Icono nombre="mas" /><span className="menu-texto">Más</span>
                    </button>
                </nav>
                <div className="menu-pie">
                    <div className="menu-usuario" title={nombre}>
                        {user?.avatar ? <img src={user.avatar} alt="" /> : <span className="menu-avatar" aria-hidden="true">{nombre.slice(0, 1).toUpperCase()}</span>}
                        <span className="menu-texto">{nombre}</span>
                    </div>
                    <button type="button" className="menu-op" style={{ '--k': 1 }} onClick={alternarTema} aria-label="Alternar tema claro/oscuro">
                        <Icono nombre="tema" /><span className="menu-texto"><span className="texto-largo">Cambiar tema</span></span>
                    </button>
                    <button type="button" className="menu-op" style={{ '--k': 2 }} onClick={salir}>
                        <Icono nombre="salir" /><span className="menu-texto"><span className="texto-largo">Logout</span></span>
                    </button>
                    <button type="button" className="menu-op menu-alternar" style={{ '--k': 3 }} onClick={alternarMenu}
                        aria-expanded={!compacto} aria-label="Compactar o extender el menú">
                        <Icono nombre="alternar" /><span className="menu-texto"><span className="texto-largo">{compacto ? 'Extender menú' : 'Compactar menú'}</span></span>
                    </button>
                </div>
            </aside>
            <span className="menu-etiqueta" ref={etiqueta} aria-hidden="true" />
            <dialog className="hoja-mas" ref={hoja} aria-label="Más opciones"
                onClick={(e) => { if (e.target === hoja.current) cerrarHoja() }}
                onCancel={(e) => { e.preventDefault(); cerrarHoja() }}>
                {opciones.filter((o) => o.soloAmplio).map((o, k) => (
                    <Link key={o.icono} to={o.to} style={{ '--k': k }} aria-current={o.activa ? 'page' : undefined} onClick={() => hoja.current?.close()}>
                        <Icono nombre={o.icono} />{o.largo}
                    </Link>
                ))}
                <button type="button" style={{ '--k': 3 }} onClick={() => { hoja.current?.close(); salir() }}>
                    <Icono nombre="salir" />Logout
                </button>
            </dialog>
        </>
    )
}
