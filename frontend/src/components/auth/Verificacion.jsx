import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from 'sweetalert2'
import { loginSuccess } from "../../features/authSlice";
import { useMfaActivarMutation, useMfaConfigurarMutation, useMfaCorreoMutation, useMfaVerificarMutation } from "../../features/api/apiSlice";
import Portada from "./Portada";

const CAMPO = "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 " +
    "text-gray-900 dark:text-gray-100 px-3.5 py-2.5 text-base focus:outline-none focus:border-emerald-600 " +
    "focus:ring-4 focus:ring-emerald-600/15";
const BOTON = "w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3";
const NOMBRES = { totp: "app autenticadora", correo: "código por correo" };

// Segundo paso obligatorio del ingreso. El "pase" del login vive en sessionStorage
// y vence a los 10 minutos en el servidor.
function leerPasoMfa() {
    try { return JSON.parse(sessionStorage.getItem("pasoMfa")) || null; } catch { return null; }
}

const mensajeError = (r) => {
    const d = r.error?.data?.message;
    return (Array.isArray(d) ? d.join(" | ") : d) || "No fue posible completar la verificación.";
};

export default function Verificacion() {
    const paso = leerPasoMfa();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [configurar] = useMfaConfigurarMutation();
    const [activar] = useMfaActivarMutation();
    const [verificar] = useMfaVerificarMutation();
    const [reenviar] = useMfaCorreoMutation();
    const [modo, setModo] = useState(paso?.configurado ? "verificar" : "elegir");
    const [metodo, setMetodo] = useState(paso?.metodo || null);
    const [app, setApp] = useState(null);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [ocupado, setOcupado] = useState(false);

    if (!paso) return <Navigate to="/login" replace />;
    const otro = (paso.activos || []).find((m) => m !== metodo);

    const terminar = (datos) => {
        sessionStorage.removeItem("pasoMfa");
        localStorage.setItem('sessionData', JSON.stringify(datos));
        dispatch(loginSuccess(datos));
        Swal.fire({ position: "top-end", icon: "success", title: "Bienvenido", showConfirmButton: false, timer: 1500 })
            .then(() => navigate('/house'));
    };

    const elegir = async (elegido) => {
        setError(""); setInfo("");
        const r = await configurar({ pase: paso.pase, metodo: elegido });
        if (r.error) return setError(mensajeError(r));
        setMetodo(elegido);
        setApp(elegido === "totp" ? r.data : null);
        setModo("activar");
    };

    const enviarOtro = async () => {
        setError("");
        const r = await reenviar({ pase: paso.pase });
        if (r.error) setError(mensajeError(r)); else setInfo(r.data.detail);
    };

    const cambiar = async () => {
        setMetodo(otro);
        setError(""); setInfo("");
        if (otro === "correo") await enviarOtro();
    };

    const enviar = async (e) => {
        e.preventDefault();
        setError(""); setOcupado(true);
        const codigo = e.target.codigo.value.replace(/\D/g, "");
        const r = modo === "activar"
            ? await activar({ pase: paso.pase, metodo, codigo })
            : await verificar({ pase: paso.pase, metodo, codigo });
        setOcupado(false);
        if (r.error) return setError(mensajeError(r));
        terminar(r.data);
    };

    const subtitulo = modo === "elegir"
        ? "Además de la contraseña, cada ingreso pedirá un código. Elige cómo recibirlo; después puedes agregar el otro en Seguridad."
        : metodo === "totp"
            ? (modo === "activar" ? "Configura tu app autenticadora." : "Abre tu app autenticadora y escribe el código de 6 dígitos.")
            : `Te enviamos un código de 6 dígitos a ${paso.email}. Vence en 10 minutos.`;

    return (
        <Portada paso="Un paso más" titulo="Verificación en dos pasos" subtitulo={subtitulo}>
            {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm font-semibold px-3.5 py-2.5">{error}</div>}
            {info && <div role="status" className="mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold px-3.5 py-2.5">{info}</div>}

            {modo === "elegir" ? (
                <div className="space-y-3">
                    <button type="button" className={BOTON} onClick={() => elegir("totp")}>App autenticadora (recomendado)</button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Google Authenticator, Microsoft Authenticator u otra: funciona sin internet.</p>
                    <button type="button" className={BOTON} onClick={() => elegir("correo")}>Código por correo</button>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Te enviamos un código de 6 dígitos cada vez que ingreses.</p>
                </div>
            ) : (
                <>
                    {modo === "activar" && metodo === "totp" && app && (
                        <div className="mb-4 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>1. Escanea este código con tu app autenticadora.</p>
                            {/* SVG generado por el servidor (librería qrcode), no por el usuario. */}
                            <div className="mx-auto w-48 rounded-lg bg-white p-2" aria-label="Código QR para la app autenticadora" dangerouslySetInnerHTML={{ __html: app.qr }} />
                            <p>¿No puedes escanear? Escribe esta clave: <code className="break-all font-mono text-xs">{app.secreto}</code></p>
                            <p>2. Escribe el código de 6 dígitos que muestra la app.</p>
                        </div>
                    )}
                    <form onSubmit={enviar} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5" htmlFor="codigo">Código de 6 dígitos</label>
                            <input type="text" id="codigo" name="codigo" required inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} autoComplete="one-time-code" autoFocus className={CAMPO} />
                        </div>
                        <button type="submit" disabled={ocupado} className={BOTON}>{modo === "activar" ? "Activar" : "Verificar"}</button>
                    </form>
                    <p className="mt-4 text-center text-sm space-x-3">
                        {modo === "verificar" && metodo === "correo" && <button type="button" onClick={enviarOtro} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Enviar otro código</button>}
                        {modo === "verificar" && otro && <button type="button" onClick={cambiar} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Usar {NOMBRES[otro]}</button>}
                        {modo === "activar" && <button type="button" onClick={() => setModo("elegir")} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Elegir otro método</button>}
                    </p>
                </>
            )}
            <p className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Volver a iniciar sesión</Link></p>
        </Portada>
    );
}
