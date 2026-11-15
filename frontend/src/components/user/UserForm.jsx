import { Link } from "react-router-dom";
import Portada from "../auth/Portada";
import { CabeceraPagina, Campo, Tarjeta, ZonaImagen } from "../ui/Pagina";

const CAMPO_PORTADA = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 " +
    "text-gray-900 dark:text-gray-100 px-3.5 py-2.5 text-base focus:outline-none focus:border-emerald-600 " +
    "focus:ring-4 focus:ring-emerald-600/15";
const ETIQUETA = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5";

/** Registro (sin usuario, en la portada de acceso) y perfil (con usuario, en el marco de la app). */
export default function UserForm({ props }) {
    const { handleSubmit, handleChangeAvatar, user, enviando } = props;

    if (!user) {
        return (
            <Portada paso="Registro" titulo="Crear una cuenta"
                subtitulo="Regístrate para publicar casas y conversar con otros usuarios. Al entrar por primera vez configurarás la verificación en dos pasos.">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className={ETIQUETA} htmlFor="name">Nombre</label>
                            <input id="name" type="text" required name="name" autoComplete="given-name" className={CAMPO_PORTADA} />
                        </div>
                        <div>
                            <label className={ETIQUETA} htmlFor="lastname">Apellido</label>
                            <input id="lastname" type="text" required name="lastname" autoComplete="family-name" className={CAMPO_PORTADA} />
                        </div>
                    </div>
                    <div>
                        <label className={ETIQUETA} htmlFor="email">Correo</label>
                        <input id="email" type="email" required name="email" autoComplete="email" className={CAMPO_PORTADA} />
                    </div>
                    <div>
                        <label className={ETIQUETA} htmlFor="password">Contraseña</label>
                        <input id="password" type="password" required minLength="8" name="password" autoComplete="new-password" className={CAMPO_PORTADA} />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un carácter especial.</p>
                    </div>
                    <ZonaImagen id="avatar" nombre="avatar" etiqueta="Foto de perfil (opcional)" onChange={handleChangeAvatar} />
                    <button type="submit" disabled={enviando} className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3">Crear cuenta</button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                    ¿Ya tienes cuenta? <Link to="/login" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Inicia sesión</Link>
                </p>
            </Portada>
        );
    }

    return (
        <div className="pg pg--angosta">
            <CabeceraPagina antetitulo="Cuenta" titulo="Mi perfil" descripcion="Actualiza tu nombre, tu correo y tu foto de perfil." />
            <form onSubmit={handleSubmit}>
                <Tarjeta titulo="Datos personales">
                    <div className="pg-rejilla">
                        <Campo id="name" etiqueta="Nombre">
                            <input id="name" type="text" required name="name" defaultValue={user.name} autoComplete="given-name" className="pg-entrada" />
                        </Campo>
                        <Campo id="lastname" etiqueta="Apellido">
                            <input id="lastname" type="text" required name="lastname" defaultValue={user.lastname} autoComplete="family-name" className="pg-entrada" />
                        </Campo>
                        <Campo id="email" etiqueta="Correo" ancho="completo">
                            <input id="email" type="email" required name="email" defaultValue={user.email} autoComplete="email" className="pg-entrada" />
                        </Campo>
                        <div className="pg-campo pg-campo--completo">
                            <ZonaImagen id="avatar" nombre="avatar" etiqueta="Agregar foto de perfil" imagenActual={user.avatar} onChange={handleChangeAvatar} />
                        </div>
                    </div>
                    <div className="pg-pie-form">
                        <button type="submit" disabled={enviando} className="pg-boton bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white">Guardar cambios</button>
                    </div>
                </Tarjeta>
            </form>
        </div>
    );
}
