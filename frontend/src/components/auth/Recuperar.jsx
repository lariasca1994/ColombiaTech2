import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecuperarMutation } from "../../features/api/apiSlice";
import Portada from "./Portada";

const CAMPO = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 " +
    "text-gray-900 dark:text-gray-100 px-3.5 py-2.5 text-base focus:outline-none focus:border-emerald-600 " +
    "focus:ring-4 focus:ring-emerald-600/15";

// La respuesta es la misma exista o no la cuenta: no revela qué correos están registrados.
export default function Recuperar() {
    const [recuperar, { isLoading }] = useRecuperarMutation();
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const response = await recuperar({ email: e.target.email.value.trim() });
        if (response.error && response.error.status === 400) {
            setError("El correo no tiene un formato válido");
        } else if (response.error) {
            setError("No fue posible enviar el enlace. Intenta de nuevo en unos minutos.");
        } else {
            setEnviado(true);
        }
    };

    return (
        <Portada
            paso="Acceso"
            titulo="¿Olvidaste tu contraseña?"
            subtitulo="Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva. Vence en 30 minutos y sirve una sola vez."
        >
            {enviado && (
                <div role="status" className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold px-3.5 py-2.5">
                    Si el correo está registrado, recibirás un enlace para crear una contraseña nueva. Revisa tu bandeja (y la carpeta de spam).
                </div>
            )}
            {error && (
                <div role="alert" className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm font-semibold px-3.5 py-2.5">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="email">Correo</label>
                    <input type="email" id="email" required name="email" autoComplete="username" className={CAMPO} />
                </div>
                <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3">Enviar enlace</button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                <Link to="/login" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Volver a iniciar sesión</Link>
            </p>
        </Portada>
    );
}
