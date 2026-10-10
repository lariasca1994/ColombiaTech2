import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";
import Footer from "./components/footer";
import Header from "./components/header";
import HouseList from "./components/house/HouseList";
import Login from "./components/auth/Login";
import UserFormCreate from "./components/user/UserFormCreate";
import UserFormEdit from "./components/user/UserFormEdit";
import PrivateRoute from "./components/PrivateRoute";
import ChangePassword from "./components/auth/ChangePassword";
import HouseFormCreate from "./components/house/HouseFormCreate";
import HouseFormEdit from "./components/house/HouseFormEdit";
import Chat from "./components/chat/Chat";
import useInactivityLogout from "./hooks/useInactivityLogout";

function InactivityWatcher() {
  useInactivityLogout(4 * 60 * 60 * 1000); // cierra sesión sola a las 4 horas sin actividad
  return null;
}

// La portada de acceso ocupa toda la pantalla: sin cabecera ni pie.
const RUTAS_PORTADA = ["/", "/login"];

/** Inicio: la portada de acceso es la primera pantalla, igual que en el
 *  resto del portafolio; con sesión iniciada se va directo a las casas. */
function Inicio() {
  const isAutheticated = useSelector((state) => state.auth.isAutheticated);
  return isAutheticated ? <Navigate to="/house" replace /> : <Login />;
}

function Marco() {
  const { pathname } = useLocation();
  const esPortada = RUTAS_PORTADA.includes(pathname);

  return (
    <>
      <InactivityWatcher />
      {!esPortada && <Header />}
      <Routes>
        <Route path="/" element={<Inicio />} />

        {/* Sección: Casas */}
        <Route path="/house" element={<PrivateRoute Component={HouseList} />} />
        <Route path="/house/:id" element={<PrivateRoute Component={HouseFormEdit} />} />
        <Route path="/create-house" element={<PrivateRoute Component={HouseFormCreate} />} />

        {/* Sección: Chat */}
        <Route path="/chat" element={<PrivateRoute Component={Chat} />} />

        {/* Sección: cuenta */}
        <Route path="/user/:id" element={<PrivateRoute Component={UserFormEdit} />} />
        <Route path="/change-password" element={<PrivateRoute Component={ChangePassword} />} />

        {/* Rutas públicas */}
        <Route path="/create-user" element={<UserFormCreate />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      {!esPortada && <Footer />}
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
