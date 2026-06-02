import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Library from "./pages/library/library";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Register from "./pages/register/register";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Verificar si hay una sesión guardada al cargar la app
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/library" element={<Library />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
