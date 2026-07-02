import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import { useLibraryStore } from "../../stores/libraryStore";
import {
  dedupeTitles,
  getLevelProgress,
  getUnlockedTitlesFromStorage,
} from "../../utils/leveling";
import "./profile.css";

type ProfileLocationState = {
  steamMessage?: string;
};

export default function Profile() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const recalculateUserLevelFromAchievements = useAuthStore(
    (state) => state.recalculateUserLevelFromAchievements,
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const hasLoadedLibraryGames = useLibraryStore(
    (state) => state.hasLoadedGames,
  );
  const steamMessage =
    (location.state as ProfileLocationState | null)?.steamMessage ?? null;

  useEffect(() => {
    if (!hasLoadedLibraryGames) {
      return;
    }

    void recalculateUserLevelFromAchievements();
  }, [hasLoadedLibraryGames, recalculateUserLevelFromAchievements]);

  useEffect(() => {
    const storedTitles = getUnlockedTitlesFromStorage();
    const mergedTitles = dedupeTitles([
      ...(user?.unlockedTitles ?? []).filter(Boolean),
      ...storedTitles,
    ]);

    if (mergedTitles.length === 0) {
      return;
    }

    const currentTitles = dedupeTitles(
      (user?.unlockedTitles ?? []).filter(Boolean),
    );
    const needsSync =
      currentTitles.length !== mergedTitles.length ||
      mergedTitles.some((title, index) => currentTitles[index] !== title);

    if (needsSync) {
      updateUser({ unlockedTitles: mergedTitles });
    }
  }, [updateUser, user?.unlockedTitles]);

  useEffect(() => {
    const steamStatus = searchParams.get("steam");
    const steamId = searchParams.get("steamId");

    if (!steamStatus) {
      return;
    }

    if (steamStatus === "linked" && steamId) {
      updateUser({ steamId });
    }

    navigate("/profile", {
      replace: true,
      state: {
        steamMessage:
          steamStatus === "linked" && steamId
            ? "Cuenta de Steam conectada correctamente."
            : "No se pudo conectar la cuenta de Steam.",
      } satisfies ProfileLocationState,
    });
  }, [navigate, searchParams, updateUser]);

  const handleSteamConnect = () => {
    try {
      authService.connectSteam();
    } catch (error) {
      navigate("/profile", {
        replace: true,
        state: {
          steamMessage:
            error instanceof Error
              ? error.message
              : "No se pudo iniciar la conexion con Steam.",
        } satisfies ProfileLocationState,
      });
    }
  };

  const levelProgress = useMemo(() => {
    const rawXp = user?.xp ?? 0;
    const computedProgress = getLevelProgress(rawXp);

    return {
      ...computedProgress,
      level: user?.level ?? computedProgress.level,
    };
  }, [user?.level, user?.xp]);

  return (
    <main className="profile-container">
      <section className="custom-section">
        <div className="hero-container">
          <img className="hero" src="" alt="" />
        </div>
        <div className="avatar-container">
          <img className="avatar" src={user?.avatar} alt="" />
          <div className="name-title-container">
            <h1 className="user-name">{user?.username}</h1>
            <h2 className="user-title">{user?.equippedTitle}</h2>
          </div>
          <div
            title={`Experiencia necesaria para el siguiente nivel: ${levelProgress.xpNeededForNextLevel}xp`}
            className="level-progress-container"
          >
            <span className="level-progress-text">{levelProgress.level}</span>
            <p className="level-progress-xp">{levelProgress.xp} XP</p>
            <div className="level-progress-bar">
              <div
                className="level-progress-fill"
                style={{ width: `${levelProgress.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        <section className="platform-links-card">
          <div>
            <p className="platform-links-label">Plataformas vinculadas</p>
            <h3 className="platform-links-title">Steam</h3>
            <p className="platform-links-status">
              {user?.steamId
                ? `Conectado con Steam ID ${user.steamId}`
                : "Todavia no has conectado tu cuenta de Steam."}
            </p>
            {steamMessage ? (
              <p className="platform-links-feedback">{steamMessage}</p>
            ) : null}
          </div>
          <button
            className="steam-connect-button"
            type="button"
            onClick={handleSteamConnect}
          >
            {user?.steamId ? "Reconectar Steam" : "Conectar con Steam"}
          </button>
        </section>
      </section>
    </main>
  );
}
