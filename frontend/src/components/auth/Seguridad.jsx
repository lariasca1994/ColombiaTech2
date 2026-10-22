import { useState } from "react";
import { useSelector } from "react-redux";
import { useGetMfaQuery, useMfaAgregarActivarMutation, useMfaAgregarMutation, useMfaPreferidoMutation } from "../../features/api/apiSlice";

const NOMBRES = { totp: "App autenticadora", correo: "Código por correo" };
const CAMPO = "shadow appearance-none border rounded w-full focus:shadow-outline bg-white dark:bg-gray-700 " +
    "text-gray-900 dark:text-gray-100 dark:border-gray-600 px-3 py-2";

const mensajeError = (r) => {
    const d = r.error?.data?.message;
    return (Array.isArray(d) ? d.join(" | ") : d) || "No fue posible completar la acción.";
};

// Perfil → Seguridad: agregar el método de verificación que falta y elegir el preferido.
export default function Seguridad() {
    const user = useSelector((state) => state.auth.user);
    const { data: estado, refetch } = useGetMfaQuery();
    const [agregar] = useMfaAgregarMutation();
    const [activar] = useMfaAgregarActivarMutation();
    const [preferir] = useMfaPreferidoMutation();
    const [agregando, setAgregando] = useState(null);
    const [app, setApp] = useState(null);
    const [error, setError] = useState("");
    const [exito, setExito] = useState("");

    const iniciar = async (metodo) => {
        setError(""); setExito("");
        const r = await agregar({ metodo });
        if (r.error) return setError(mensajeError(r));
        setAgregando(metodo);
        setApp(metodo === "totp" ? r.data : null);
    };

    const confirmar = async (e) => {
        e.preventDefault();
        setError("");
        const r = await activar({ metodo: agregando, codigo: e.target.codigo.value.replace(/\D/g, "") });
        if (r.error) return setError(mensajeError(r));
        setExito(`${NOMBRES[agregando]} quedó activada como segundo paso.`);
        setAgregando(null);
        refetch();
    };

    const elegirPreferido = async (metodo) => {
        const r = await preferir({ metodo });
        if (r.error) setError(mensajeError(r)); else refetch();
    };

    return (
        <div className="max-w-lg w-full mx-auto px-5 py-5">
            <section className="shadow-md rounded pt-6 pb-8 mb-4 px-8 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 space-y-4">
                <h1 className="text-xl font-bold">Verificación en dos pasos</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cada ingreso pide, además de la contraseña, un código de uno de tus métodos.</p>
                {error && <div role="alert" className="rounded bg-rose-50 dark:bg-rose-950/40 text-red-600 dark:text-red-400 text-sm font-semibold px-3 py-2">{error}</div>}
                {exito && <div role="status" className="rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-sm font-semibold px-3 py-2">{exito}</div>}
                <ul className="space-y-3">
                    {Object.entries(NOMBRES).map(([clave, nombre]) => {
                        const activo = estado?.activos?.includes(clave);
                        return (
                            <li key={clave} className="flex flex-wrap items-center justify-between gap-3 rounded border border-gray-200 dark:border-gray-700 px-4 py-3">
                                <div>
                                    <p className="font-semibold">{nombre}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{activo ? `Activa${clave === estado?.preferido ? " · se pide por defecto" : ""}` : "Sin configurar"}</p>
                                </div>
                                {!activo && <button type="button" onClick={() => iniciar(clave)} className="bg-emerald-600 hover:bg-emerald-700 rounded text-white font-bold py-2 px-4">Agregar</button>}
                                {activo && clave !== estado?.preferido && <button type="button" onClick={() => elegirPreferido(clave)} className="border border-emerald-600 text-emerald-700 dark:text-emerald-400 rounded font-bold py-2 px-4">Pedir este por defecto</button>}
                            </li>
                        );
                    })}
                </ul>
                {agregando && (
                    <form onSubmit={confirmar} className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h2 className="font-semibold">Agregar: {NOMBRES[agregando]}</h2>
                        {agregando === "totp" && app ? (
                            <div className="space-y-2 text-sm">
                                <p>1. Escanea este código con tu app autenticadora.</p>
                                {/* SVG generado por el servidor (librería qrcode), no por el usuario. */}
                                <div className="w-48 rounded bg-white p-2" dangerouslySetInnerHTML={{ __html: app.qr }} />
                                <p>¿No puedes escanear? Escribe esta clave: <code className="break-all font-mono text-xs">{app.secreto}</code></p>
                                <p>2. Escribe el código de 6 dígitos que muestra la app.</p>
                            </div>
                        ) : (
                            <p className="text-sm">Te enviamos un código de 6 dígitos a <strong>{user?.email}</strong>. Vence en 10 minutos.</p>
                        )}
                        <label className="block text-sm font-bold" htmlFor="codigo">Código de 6 dígitos</label>
                        <input type="text" id="codigo" name="codigo" required inputMode="numeric" pattern="[0-9 ]{6,7}" maxLength={7} autoComplete="one-time-code" className={CAMPO} />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 rounded text-white font-bold py-2 px-4">Activar</button>
                    </form>
                )}
            </section>
        </div>
    );
}
