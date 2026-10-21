import { useState } from "react";
import { useLoginMutation } from "../../features/api/apiSlice";
import Swal from 'sweetalert2'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { loginSuccess } from "../../features/authSlice";
import Portada from "./Portada";

// Los textos "Email", "Password", "Iniciar Sesion" y "Datos Invalidos" los
// usa la prueba E2E de qa-evidencia: cambiarlos rompe esa prueba.
const CAMPO = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 " +
    "text-gray-900 dark:text-gray-100 px-3.5 py-2.5 text-base focus:outline-none focus:border-emerald-600 " +
    "focus:ring-4 focus:ring-emerald-600/15";

export default function Login() {

    const [login] = useLoginMutation();
    const [error, setError] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError(false)
            const user = {
                email: e.target.email.value,
                password: e.target.password.value,
            }
            const response = await login(user)
            if (response.error) {
                setError(true)
            } else {
                localStorage.setItem('sessionData', JSON.stringify(response.data))
                dispatch(loginSuccess(response.data))
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Bienvenido",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    navigate('/house')
                });
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Portada
            paso="Acceso"
            titulo="Iniciar sesión"
            subtitulo="Entra para ver las casas publicadas y conversar con otros usuarios."
        >
            {error && (
                <div role="alert" className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm font-semibold px-3.5 py-2.5">
                    Datos Invalidos
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="email">Correo</label>
                    <input type="email" id="email" required name="email" placeholder="Email" autoComplete="username" className={CAMPO} />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="password">Contraseña</label>
                    <input type="password" id="password" required minLength="3" name="password" placeholder="Password" autoComplete="current-password" className={CAMPO} />
                </div>
                <button type="submit" className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3">Iniciar Sesion</button>
            </form>
            <p className="mt-4 text-center text-sm">
                <Link to="/recuperar" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">¿Olvidaste tu contraseña?</Link>
            </p>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                ¿No tienes cuenta? <Link to="/create-user" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Crea una</Link>
            </p>
        </Portada>
    );
}
