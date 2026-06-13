import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import Library from "./pages/library/library";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Game from "./pages/game/game";
import Playing from "./pages/playing/playing";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/library" element={<Library />} />
      <Route path="/game/:gameId/:gamePlatform" element={<Game />} />
      <Route path="/playing/:gameId/:gamePlatform" element={<Playing />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default App;
