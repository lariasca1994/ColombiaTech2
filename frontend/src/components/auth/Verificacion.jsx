import { useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Swal from 'sweetalert2'
import { loginSuccess } from "../../features/authSlice";
import {
    useMfaActivarMutation, useMfaConfigurarMutation, useMfaCorreoMutation, useMfaRecuperarActivarMutation,
    useMfaRecuperarMutation, useMfaRecuperarVerificarMutation, useMfaVerificarMutation,
} from "../../features/api/apiSlice";
import Portada from "./Portada";
import CampoCodigo from "./CampoCodigo";
import AnilloCodigo from "./AnilloCodigo";

const reducir = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const despues = (ms, fn) => setTimeout(fn, reducir() ? 0 : ms);

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
    const [pedirRecuperacion] = useMfaRecuperarMutation();
    const [verificarRecuperacion] = useMfaRecuperarVerificarMutation();
    const [activarRecuperacion] = useMfaRecuperarActivarMutation();
    // Pase que entrega "Perdí mi autenticador": solo sirve para activar la app nueva.
    const [paseNuevo, setPaseNuevo] = useState(null);
    const [modo, setModo] = useState(paso?.configurado ? "verificar" : "elegir");
    const [metodo, setMetodo] = useState(paso?.metodo || null);
    const [app, setApp] = useState(null);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [ocupado, setOcupado] = useState(false);
    // Candado sobre el título: se abre con el código correcto y se sacude con uno equivocado.
    const [candado, setCandado] = useState("normal");
    const campo = useRef(null);

    if (!paso) return <Navigate to="/login" replace />;
    const otro = (paso.activos || []).find((m) => m !== metodo);

    // Código equivocado: las casillas tiemblan y se vacían, el candado se sacude.
    const fallo = (r) => {
        setError(mensajeError(r));
        setCandado("error");
        campo.current?.fallar();
        despues(900, () => setCandado("normal"));
    };

    const terminar = (datos) => {
        sessionStorage.removeItem("pasoMfa");
        localStorage.setItem('sessionData', JSON.stringify(datos));
        setCandado("abierto");
        // El candado se abre antes de entrar.
        despues(650, () => {
        dispatch(loginSuccess(datos));
        Swal.fire({ position: "top-end", icon: "success", title: "Bienvenido", showConfirmButton: false, timer: 1500 })
            .then(() => navigate('/house'));
        });
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

    // "Perdí mi autenticador": código al correo de la cuenta (aunque ese método no esté activo).
    const perdiAutenticador = async () => {
        setError(""); setInfo("");
        const r = await pedirRecuperacion({ pase: paso.pase });
        if (r.error) return setError(mensajeError(r));
        setInfo(r.data.detail);
        setModo("recuperar");
    };

    const enviar = async (e) => {
        e.preventDefault();
        setError(""); setOcupado(true); setCandado("verificando");
        const codigo = e.target.codigo.value.replace(/\D/g, "");
        let r;
        if (modo === "recuperar") {
            r = await verificarRecuperacion({ pase: paso.pase, codigo });
            setOcupado(false);
            if (r.error) return fallo(r);
            setCandado("normal");
            campo.current?.limpiar();
            setInfo("");
            setApp(r.data);
            setPaseNuevo(r.data.pase);
            setMetodo("totp");
            return setModo("reconfigurar");
        }
        if (modo === "reconfigurar") r = await activarRecuperacion({ pase: paseNuevo, codigo });
        else if (modo === "activar") r = await activar({ pase: paso.pase, metodo, codigo });
        else r = await verificar({ pase: paso.pase, metodo, codigo });
        setOcupado(false);
        if (r.error) return fallo(r);
        terminar(r.data);
    };

    const subtitulo = modo === "elegir"
        ? "Además de la contraseña, cada ingreso pedirá un código. Elige cómo recibirlo; después puedes agregar el otro en Seguridad."
        : modo === "recuperar"
            ? `Te enviamos un código de 6 dígitos a ${paso.email}. Vence en 15 minutos. Al verificarlo configurarás tu app autenticadora nueva.`
        : modo === "reconfigurar"
            ? "Configura tu app autenticadora nueva: la anterior deja de funcionar cuando actives esta."
        : metodo === "totp"
            ? (modo === "activar" ? "Configura tu app autenticadora." : "Abre tu app autenticadora y escribe el código de 6 dígitos.")
            : `Te enviamos un código de 6 dígitos a ${paso.email}. Vence en 10 minutos.`;

    return (
        <Portada paso="Un paso más" titulo="Verificación en dos pasos" subtitulo={subtitulo} candado={modo === "elegir" ? undefined : candado}>
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
                    {(modo === "activar" || modo === "reconfigurar") && metodo === "totp" && app && (
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
                            <CampoCodigo key={`${modo}-${metodo}`} ref={campo} />
                            <AnilloCodigo key={`anillo-${modo}-${metodo}`}
                                minutos={modo === "recuperar" ? 15 : metodo === "correo" && modo !== "reconfigurar" ? 10 : undefined} />
                        </div>
                        <button type="submit" disabled={ocupado} className={BOTON}>{modo === "activar" || modo === "reconfigurar" ? "Activar" : "Verificar"}</button>
                    </form>
                    <p className="mt-4 text-center text-sm space-x-3">
                        {modo === "verificar" && metodo === "correo" && <button type="button" onClick={enviarOtro} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Enviar otro código</button>}
                        {modo === "verificar" && otro && <button type="button" onClick={cambiar} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Usar {NOMBRES[otro]}</button>}
                        {modo === "activar" && <button type="button" onClick={() => setModo("elegir")} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Elegir otro método</button>}
                        {modo === "recuperar" && <button type="button" onClick={perdiAutenticador} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Enviar otro código</button>}
                    </p>
                    {modo === "verificar" && (
                        <p className="mt-3 text-center text-sm">
                            <button type="button" onClick={perdiAutenticador} className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Perdí mi autenticador</button>
                        </p>
                    )}
                </>
            )}
            <p className="mt-6 text-center text-sm"><Link to="/login" className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline">Volver a iniciar sesión</Link></p>
        </Portada>
    );
}
