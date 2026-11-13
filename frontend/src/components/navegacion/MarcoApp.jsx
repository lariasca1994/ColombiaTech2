import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Header from '../header'
import Footer from '../footer'
import useTheme from '../../hooks/useTheme'
import MenuLateral, { ORDEN_MENU } from './MenuLateral'
import Transicion from './Transicion'

/**
 * Marco de las pantallas fuera de la portada de acceso. Con sesión: menú
 * lateral (barra de vidrio en el teléfono) y el contenido con la transición
 * entre secciones. Sin sesión (crear usuario, 404): la cabecera de siempre.
 */
export default function MarcoApp() {
    const isAutheticated = useSelector((state) => state.auth.isAutheticated)
    const { tema, alternarTema } = useTheme()

    if (!isAutheticated) {
        return (
            <>
                <Header />
                <Transicion />
                <Footer />
            </>
        )
    }

    return (
        <div className="app-con-menu">
            <MenuLateral />
            <div className="zona">
                <header className="cabecera-movil">
                    <Link to="/house" className="inline-flex items-center gap-2.5">
                        <img src="/icono.svg" alt="" className="w-8 h-8" />Alquiler de vivienda
                    </Link>
                    <button type="button" onClick={alternarTema}
                        className="text-lg leading-none rounded-full w-11 h-11 flex items-center justify-center border border-gray-300 dark:border-gray-700"
                        title={tema === 'oscuro' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} aria-label="Alternar tema claro/oscuro">
                        {tema === 'oscuro' ? '☀️' : '🌙'}
                    </button>
                </header>
                <main className="zona-contenido">
                    <Transicion orden={ORDEN_MENU} />
                </main>
                <Footer />
            </div>
        </div>
    )
}
