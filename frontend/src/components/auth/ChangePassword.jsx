import { useState } from "react";
import { useCambiarContrasenaMutation } from "../../features/api/apiSlice";
import Swal from 'sweetalert2'

import { AvisoError, CabeceraPagina, Campo, Tarjeta } from "../ui/Pagina";

// El backend verifica la contraseña actual y guarda la nueva con bcrypt
// (POST /auth/cambiar-contrasena).
export default function ChangePassword() {

    const [newPassword, setNewPassword] = useState("")
    const [notEqualPassword, setNotEqualPassword] = useState(false)
    const [error, setError] = useState("")
    const [cambiarContrasena, { isLoading }] = useCambiarContrasenaMutation()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("")
        if (notEqualPassword) return
        const response = await cambiarContrasena({
            actual: e.target.password.value,
            nueva: e.target["new-password"].value,
        })
        if (response.error) {
            const detail = response.error.data?.message
            setError(Array.isArray(detail) ? detail.join(' | ') : detail || "No fue posible actualizar la contraseña")
            return
        }
        e.target.reset()
        setNewPassword("")
        Swal.fire({
            position: "top-end",
            icon: "success",
            title: "Contraseña actualizada correctamente",
            showConfirmButton: false,
            timer: 1500
        })
    }

    return (
        <div className="pg pg--angosta">
            <CabeceraPagina antetitulo="Cuenta" titulo="Cambiar contraseña"
                descripcion="Escribe tu contraseña actual y la nueva. Al cambiarla, tus otras sesiones abiertas se cierran." />
            <form onSubmit={handleSubmit}>
                <Tarjeta>
                    {error ? <AvisoError>{error}</AvisoError> : null}
                    <div className="pg-rejilla">
                        <Campo id="password" etiqueta="Contraseña actual" ancho="completo">
                            <input type="password" id="password" required name="password" autoComplete="current-password" className="pg-entrada" />
                        </Campo>
                        <Campo id="new-password" etiqueta="Nueva contraseña"
                            ayuda="Mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un carácter especial.">
                            <input type="password" id="new-password" required minLength="8" name="new-password" autoComplete="new-password"
                                className="pg-entrada" onChange={(e) => setNewPassword(e.target.value)} />
                        </Campo>
                        <Campo id="repeat-new-password" etiqueta="Repite la nueva contraseña"
                            ayuda={notEqualPassword ? <span className="text-red-600 dark:text-red-400 font-semibold">Las contraseñas no coinciden</span> : null}>
                            <input type="password" id="repeat-new-password" required minLength="8" name="repeat-new-password" autoComplete="new-password"
                                className="pg-entrada" onChange={(e) => setNotEqualPassword(newPassword !== e.target.value)} />
                        </Campo>
                    </div>
                    <div className="pg-pie-form">
                        <button type="submit" disabled={isLoading} className="pg-boton bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white">
                            Cambiar contraseña
                        </button>
                    </div>
                </Tarjeta>
            </form>
        </div>
    );
}
