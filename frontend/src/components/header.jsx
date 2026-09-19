import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../features/authSlice";
import { useState } from "react";
import useTheme from "../hooks/useTheme";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Header() {
  const isAutheticated = useSelector((state) => state.auth.isAutheticated);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tema, alternarTema } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("sessionData");
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 text-white py-4 flex justify-between items-center px-8">
      {!isAutheticated ? (
        <ul className="flex space-x-5">
          <li>
            <Link to="/" className="hover:text-emerald-400">
              Inicio
            </Link>
          </li>
          <li>
            <Link to="/create-user" className="hover:text-emerald-400">
              Crear Usuario
            </Link>
          </li>
        </ul>
      ) : (
        <div className="flex items-center space-x-8">
          <Link to="/" className="hover:text-emerald-400">
            Inicio
          </Link>

          {/* Sección: Casas */}
          <div className="flex items-center space-x-3 border-l border-gray-600 pl-8">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              🏠 Casas
            </span>
            <Link to="/house" className="hover:text-emerald-400">
              Ver casas
            </Link>
            <Link to="/create-house" className="hover:text-emerald-400">
              Crear casa
            </Link>
          </div>

          {/* Sección: Chat */}
          <div className="flex items-center space-x-3 border-l border-gray-600 pl-8">
            <span className="text-xs uppercase tracking-wide text-gray-400">
              💬 Chat
            </span>
            <Link to="/chat" className="hover:text-emerald-400">
              Ir al chat
            </Link>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* Interruptor de tema claro/oscuro */}
        <button
          type="button"
          onClick={alternarTema}
          className="boton-tema text-lg leading-none rounded-full w-9 h-9 flex items-center justify-center border border-gray-600 hover:bg-gray-700 transition-colors"
          title={tema === "oscuro" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          aria-label="Alternar tema claro/oscuro"
        >
          {tema === "oscuro" ? "☀️" : "🌙"}
        </button>

        {/* Dropdown de usuario logueado */}
        <div className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 px-5">
          {isAutheticated ? (
            <div className="relative">
              <img
                src={user.avatar}
                className="rounded-full h-10 w-10 cursor-pointer"
                onClick={toggleMenu}
              />
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1">
                  <p className="block px-4 py-2 text-sm text-red-400">
                    {user.name} {user.lastname}
                  </p>
                  <Link
                    to={`/user/${user._id}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Change Password
                  </Link>
                  <a
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    Logout
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="hover:text-emerald-400">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
