import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

function Marco() {
  return (
    <>
      <InactivityWatcher />
      <Mantenimiento />
      <Routes>
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
