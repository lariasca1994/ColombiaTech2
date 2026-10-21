import { useState } from "react";
import { useCambiarContrasenaMutation } from "../../features/api/apiSlice";
import Swal from 'sweetalert2'

const CAMPO = "shadow appearance-none border rounded w-full focus:shadow-outline bg-white dark:bg-gray-700 " +
    "text-gray-900 dark:text-gray-100 dark:border-gray-600";

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
        <div className="max-w-lg w-full mx-auto px-5 py-5">
            <form onSubmit={handleSubmit} className="shadow-md rounded pt-6 pb-10 mb-4 px-10 bg-white dark:bg-gray-800">
                {error ?
                    <div role="alert" className="mb-4 rounded bg-rose-50 dark:bg-rose-950/40 text-red-600 dark:text-red-400 text-sm font-semibold px-3 py-2">{error}</div>
                    : null}
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="password">Contraseña actual</label>
                    <input type="password" id="password" required name="password" autoComplete="current-password" className={CAMPO} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="new-password">Nueva contraseña</label>
                    <input type="password" id="new-password" required minLength="8" name="new-password" autoComplete="new-password"
                        className={CAMPO} onChange={(e) => setNewPassword(e.target.value)} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">Mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un carácter especial.</span>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2" htmlFor="repeat-new-password">Repite la nueva contraseña</label>
                    <input type="password" id="repeat-new-password" required minLength="8" name="repeat-new-password" autoComplete="new-password"
                        className={CAMPO} onChange={(e) => setNotEqualPassword(newPassword !== e.target.value)} />
                    {notEqualPassword ?
                        <span className="text-red-600 dark:text-red-400">Las contraseñas no coinciden</span>
                        : null}
                </div>
                <div className="flex justify-center">
                    <button type="submit" disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded text-white font-bold py-2 px-4">
                        Cambiar contraseña
                    </button>
                </div>
            </form>
        </div>
    );
}
