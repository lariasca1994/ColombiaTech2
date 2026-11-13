import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";
import HouseList from "./components/house/HouseList";
import Login from "./components/auth/Login";
import UserFormCreate from "./components/user/UserFormCreate";
import UserFormEdit from "./components/user/UserFormEdit";
import PrivateRoute from "./components/PrivateRoute";
import ChangePassword from "./components/auth/ChangePassword";
import Recuperar from "./components/auth/Recuperar";
import Restablecer from "./components/auth/Restablecer";
import Verificacion from "./components/auth/Verificacion";
import Seguridad from "./components/auth/Seguridad";
import HouseFormCreate from "./components/house/HouseFormCreate";
import HouseFormEdit from "./components/house/HouseFormEdit";
import Chat from "./components/chat/Chat";
import useInactivityLogout from "./hooks/useInactivityLogout";
import Mantenimiento from "./components/Mantenimiento";
import { PortadaMarco } from "./components/auth/Portada";
import MarcoApp from "./components/navegacion/MarcoApp";
import NoEncontrada from "./components/NoEncontrada";

function InactivityWatcher() {
  useInactivityLogout(4 * 60 * 60 * 1000); // cierra sesión sola a las 4 horas sin actividad
  return null;
}

/** Inicio: la portada de acceso es la primera pantalla, igual que en el
 *  resto del portafolio; con sesión iniciada se va directo a las casas. */
function Inicio() {
  const isAutheticated = useSelector((state) => state.auth.isAutheticated);
  return isAutheticated ? <Navigate to="/house" replace /> : <Login />;
}

// Rutas de la portada de acceso (el resto va en el marco con menú o cabecera).
const RUTAS_PORTADA = ["/", "/login", "/recuperar", "/restablecer", "/verificacion"];
const grupo = (ruta) => (RUTAS_PORTADA.includes(ruta) ? "portada" : "app");
const reducir = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Al pasar entre la portada y el resto (por ejemplo, del login al registro, que
 *  es una página independiente), la página que sale se desvanece y se corre, y
 *  la nueva entra desde el lado hacia donde se navega. Dentro de cada grupo,
 *  la transición la hace <Transicion /> de cada layout. */
function useTransicionDePagina() {
  const location = useLocation();
  const [mostrada, setMostrada] = useState(location);
  const [fase, setFase] = useState("entra");
  const [dir, setDir] = useState(1);

  useEffect(() => {
    if (location.key === mostrada.key) return undefined;
    if (grupo(location.pathname) === grupo(mostrada.pathname) || reducir()) {
      setMostrada(location);
      return undefined;
    }
    setDir(grupo(location.pathname) === "app" ? 1 : -1);
    setFase("sale");
    const t = setTimeout(() => { setMostrada(location); setFase("entra"); }, 200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return { mostrada, fase, dir };
}

function Marco() {
  const { mostrada, fase, dir } = useTransicionDePagina();
  return (
    <>
      <InactivityWatcher />
      <Mantenimiento />
      <div key={grupo(mostrada.pathname)} className={fase === "sale" ? "pagina-sale" : "pagina-entra"} style={{ "--dir": dir }}>
      <Routes location={mostrada}>
        {/* Portada de acceso: el panel de marca queda quieto y solo cambian las tarjetas. */}
        <Route element={<PortadaMarco />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar" element={<Recuperar />} />
          <Route path="/restablecer" element={<Restablecer />} />
          <Route path="/verificacion" element={<Verificacion />} />
        </Route>

        {/* Con sesión: menú lateral y transición entre secciones. */}
        <Route element={<MarcoApp />}>
          {/* Sección: Casas */}
          <Route path="/house" element={<PrivateRoute Component={HouseList} />} />
          <Route path="/house/:id" element={<PrivateRoute Component={HouseFormEdit} />} />
          <Route path="/create-house" element={<PrivateRoute Component={HouseFormCreate} />} />

          {/* Sección: Chat */}
          <Route path="/chat" element={<PrivateRoute Component={Chat} />} />

          {/* Sección: cuenta */}
          <Route path="/user/:id" element={<PrivateRoute Component={UserFormEdit} />} />
          <Route path="/change-password" element={<PrivateRoute Component={ChangePassword} />} />
          <Route path="/seguridad" element={<PrivateRoute Component={Seguridad} />} />

          {/* Rutas públicas */}
          <Route path="/create-user" element={<UserFormCreate />} />

          {/* Cualquier otra dirección: el 404 propio del proyecto. */}
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Marco />
    </BrowserRouter>
  );
}

export default App;
