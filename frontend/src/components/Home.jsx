import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

/** Página de inicio pública: cualquier visitante (incluso sin iniciar
 *  sesión) debe poder llegar aquí y entender de qué trata el proyecto
 *  antes de que se le pida loguearse. */
export default function Home() {
  const isAutheticated = useSelector((state) => state.auth.isAutheticated);

  return (
    <div className="max-w-4xl w-full mx-auto px-6 py-14 text-center">
      <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full px-3 py-1 mb-4">
        Portafolio · Proyecto full-stack · MongoDB
      </span>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        ColombiaTech
      </h1>

      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-3">
        Plataforma de catálogo y gestión de propiedades en Colombia: publica,
        edita y explora casas por departamento y ciudad, y conversa en vivo
        con otros usuarios mediante chat en tiempo real.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
        Backend en NestJS con API dual REST + GraphQL sobre MongoDB, WebSockets
        para el chat, autenticación con JWT y un frontend en React + Redux
        Toolkit con Tailwind CSS.
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {["React", "Redux Toolkit", "Tailwind CSS", "NestJS", "GraphQL", "MongoDB", "WebSockets (Socket.IO)"].map(
          (tech) => (
            <span
              key={tech}
              className="text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-full px-3 py-1"
            >
              {tech}
            </span>
          )
        )}
      </div>

      {isAutheticated ? (
        <Link
          to="/house"
          className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded px-6 py-3"
        >
          Ver casas
        </Link>
      ) : (
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded px-6 py-3"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/create-user"
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold rounded px-6 py-3"
          >
            Crear cuenta
          </Link>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4 mt-14 text-left">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🏠 Catálogo de casas</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Publica, edita y filtra propiedades por departamento y ciudad, con
            fotos e información detallada.
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">💬 Chat en vivo</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mensajería en tiempo real entre usuarios a través de WebSockets
            (Socket.IO).
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">🔐 Cuenta y perfil</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Registro, inicio de sesión con JWT, edición de perfil, avatar y
            cambio de contraseña.
          </p>
        </div>
      </div>
    </div>
  );
}
