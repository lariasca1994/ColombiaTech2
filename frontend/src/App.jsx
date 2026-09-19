import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Home from "./components/Home";
import Chat from "./components/chat/Chat";
import useInactivityLogout from "./hooks/useInactivityLogout";

function InactivityWatcher() {
  useInactivityLogout(4 * 60 * 60 * 1000); // cierra sesión sola a las 4 horas sin actividad
  return null;
}

function App() {
  return (
    <BrowserRouter>
          <InactivityWatcher />
      <Header />
      <Routes>
        {/* Inicio: pública a propósito. Cualquier visitante (sin sesión
            incluido) debe poder ver de qué trata el proyecto antes de
            que se le pida loguearse. */}
        <Route path="/" element={<Home />} />

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
      <Footer />
    </BrowserRouter>
  );
}

export default App;
