import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { useRestablecerMutation } from "../../features/api/apiSlice";
import Portada from "./Portada";

const CAMPO = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 " +
    "text-gray-900 dark:text-gray-100 px-3.5 py-2.5 text-base focus:outline-none focus:border-emerald-600 " +
    "focus:ring-4 focus:ring-emerald-600/15";

// El enlace del correo trae el token después de "#", así no viaja a ningún servidor.
export default function Restablecer() {
    const [restablecer, { isLoading }] = useRestablecerMutation();
    const [token] = useState(() => window.location.hash.slice(1));
    const [error, setError] = useState(token ? "" : "El enlace no es válido o ya venció. Pide uno nuevo.");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const password = e.target.password.value;
        if (password !== e.target.confirmacion.value) {
            setError("Las contraseñas no coinciden");
            return;
        }
        const response = await restablecer({ token, password });
        if (response.error) {
            const detalle = response.error.data?.message;
            setError(Array.isArray(detalle) ? detalle.join(" | ") : detalle || "No fue posible guardar la contraseña.");
            return;
        }
        window.history.replaceState(null, "", "/restablecer");
        await Swal.fire({ icon: "success", title: "Tu contraseña quedó actualizada. Ya puedes ingresar.", timer: 2000, showConfirmButton: false });
        navigate("/login");
    };

    return (
        <Portada paso="Acceso" titulo="Crea una nueva contraseña"
            subtitulo="Mínimo 8 caracteres, con una mayúscula, una minúscula, un número y un carácter especial.">
            {error && (
                <div role="alert" className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm font-semibold px-3.5 py-2.5">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="password">Nueva contraseña</label>
                    <input type="password" id="password" required minLength="8" name="password" autoComplete="new-password" className={CAMPO} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="confirmacion">Confirma la nueva contraseña</label>
                    <input type="password" id="confirmacion" required minLength="8" name="confirmacion" autoComplete="new-password" className={CAMPO} />
                </div>
                <button type="submit" disabled={isLoading || !token} className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3">Guardar contraseña</button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <Link to="/recuperar" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Pedir otro enlace</Link>
            </p>
        </Portada>
    );
}
