import { Link } from "react-router-dom";
import useTheme from "../../hooks/useTheme";
import "./portada.css";

const CASAS = [
  { ciudad: "Medellín", depto: "Antioquia", precio: "$ 420 M", tono: "from-emerald-400 to-teal-500" },
  { ciudad: "Cartagena", depto: "Bolívar", precio: "$ 610 M", tono: "from-amber-300 to-orange-400" },
  { ciudad: "Bogotá", depto: "Cundinamarca", precio: "$ 380 M", tono: "from-sky-400 to-indigo-400" },
];

/** Portada de acceso: panel de marca (casas por ciudad y un mensaje de
 *  chat que llega) y, al lado, la tarjeta que reciba como children. */
export default function Portada({ paso, titulo, subtitulo, children }) {
  const { tema, alternarTema } = useTheme();

  return (
    <div className="portada min-h-screen grid grid-rows-[auto_1fr] lg:grid-rows-1 lg:grid-cols-[1.1fr_1fr] text-left bg-emerald-50/40 dark:bg-gray-950">
      <aside className="portada-marca relative overflow-hidden flex flex-col gap-6 lg:justify-between px-5 sm:px-10 lg:px-16 pt-6 pb-14 lg:py-10 bg-emerald-50 dark:bg-[#06140f] text-emerald-950 dark:text-emerald-50">
        <Link to="/" className="relative inline-flex items-center gap-2.5 font-bold text-lg">
          <img src="/icono.svg" alt="" className="w-8 h-8" />
          ColombiaTech
        </Link>

        <div className="relative max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400 mb-3">
            Propiedades · Chat en vivo
          </p>
          <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight tracking-tight">
            Tu próxima casa, <span className="text-emerald-600 dark:text-emerald-400">a un mensaje.</span>
          </h2>
          <p className="hidden lg:block mt-4 text-emerald-900/70 dark:text-emerald-100/70 leading-relaxed">
            Publica y explora casas por departamento y ciudad, y habla en tiempo
            real con quien las ofrece, sin salir de la plataforma.
          </p>
        </div>

        <div className="portada-escena relative hidden lg:block max-w-xl" aria-hidden="true">
          <div className="grid grid-cols-3 gap-3">
            {CASAS.map((casa, i) => (
              <div key={casa.ciudad} className="portada-casa rounded-xl bg-white dark:bg-emerald-950/60 shadow-lg shadow-emerald-900/10 overflow-hidden" style={{ "--retraso": `${i * 0.25}s` }}>
                <div className={`h-20 bg-gradient-to-br ${casa.tono} relative`}>
                  <svg viewBox="0 0 40 30" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 text-white/90" fill="currentColor">
                    <path d="M4 16 L20 4 L36 16 V30 H4 Z" />
                  </svg>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm">{casa.ciudad}</p>
                  <p className="text-xs text-emerald-900/60 dark:text-emerald-100/60">{casa.depto}</p>
                  <p className="text-xs font-bold mt-1 text-emerald-700 dark:text-emerald-400">{casa.precio}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="portada-mensaje absolute -bottom-6 right-4 max-w-[15rem] rounded-2xl rounded-br-sm bg-amber-300 text-emerald-950 px-4 py-2.5 text-sm shadow-xl">
            <p className="font-semibold">Hola, ¿la de Cartagena sigue disponible?</p>
            <p className="text-xs opacity-70 mt-0.5">ahora · en vivo</p>
          </div>
        </div>

        <p className="hidden lg:block relative text-xs text-emerald-900/60 dark:text-emerald-100/60">
          Proyecto de portafolio · React · NestJS · MongoDB
        </p>
      </aside>

      <main className="portada-lado relative flex items-start lg:items-center justify-center px-4 sm:px-6 pb-10 lg:py-12 -mt-8 lg:mt-0">
        <button
          type="button"
          onClick={alternarTema}
          className="portada-tema fixed lg:absolute z-20 right-4 lg:right-5 text-lg leading-none rounded-full w-9 h-9 flex items-center justify-center border border-emerald-900/15 dark:border-gray-700 bg-white dark:bg-gray-900"
          title={tema === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          aria-label="Alternar tema claro/oscuro"
        >
          {tema === "oscuro" ? "☀️" : "🌙"}
        </button>

        <section className="relative z-10 w-full max-w-md rounded-2xl border border-emerald-900/10 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl shadow-emerald-900/10 p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400 mb-2">{paso}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5">{titulo}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{subtitulo}</p>
          {children}
        </section>
      </main>
    </div>
  );
}
