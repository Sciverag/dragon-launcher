import { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import Library from "./pages/library/library";
import Home from "./pages/home/home";
import Login from "./pages/login/login";
import Register from "./pages/register/register";
import Game from "./pages/game/game";
import Playing from "./pages/playing/playing";
import Profile from "./pages/profile/profile";
import GamesXp from "./pages/profile/gamesXp";
import Settings from "./pages/settings/settings";
import { applyInitialWindowSettings } from "./services/windowSettingsService";

function App() {
  const location = useLocation();
  const isLibraryRoute = location.pathname === "/library";
  const [hasVisitedLibrary, setHasVisitedLibrary] = useState(isLibraryRoute);
  const shouldRenderLibrary = hasVisitedLibrary || isLibraryRoute;
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const recalculateUserLevelFromAchievements = useAuthStore(
    (state) => state.recalculateUserLevelFromAchievements,
  );

  useEffect(() => {
    if (isLibraryRoute) {
      setHasVisitedLibrary(true);
    }
  }, [isLibraryRoute]);

  useEffect(() => {
    void applyInitialWindowSettings().catch((error) => {
      console.warn(
        "No se pudieron aplicar los ajustes de ventana al iniciar:",
        error,
      );
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      await checkAuth();

      if (!cancelled) {
        await recalculateUserLevelFromAchievements();
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [checkAuth, recalculateUserLevelFromAchievements]);

  return (
    <>
      {shouldRenderLibrary && (
        <div
          style={{
            display: isLibraryRoute ? "block" : "none",
            width: "100%",
            height: "100%",
          }}
          aria-hidden={!isLibraryRoute}
        >
          <Library />
        </div>
      )}

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="/library" element={null} />
        <Route path="/game/:gameId/:gamePlatform" element={<Game />} />
        <Route
          path="/playing/:gameId/:gameName/:gamePlatform"
          element={<Playing />}
        />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/profile/:userId/games-xp" element={<GamesXp />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
