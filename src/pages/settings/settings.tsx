import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { isTauri } from "@tauri-apps/api/core";
import { clearLocalAppCache } from "../../services/cacheMaintenanceService";
import { authService } from "../../services/authService";
import { applyWindowSettings } from "../../services/windowSettingsService";
import { useAuthStore } from "../../stores/authStore";
import { useLibraryStore } from "../../stores/libraryStore";
import {
  useSettingsStore,
  type ResolutionOption,
  type WindowMode,
} from "../../stores/settingsStore";
import "./settings.css";

type SettingsLocationState = {
  steamMessage?: string;
};

const RESOLUTION_OPTIONS: ResolutionOption[] = [
  "1280x720",
  "1366x768",
  "1600x900",
  "1920x1080",
];

const WINDOW_MODES: Array<{ value: WindowMode; label: string }> = [
  { value: "windowed", label: "Ventana" },
  { value: "maximized", label: "Maximizada" },
  { value: "fullscreen", label: "Pantalla completa" },
];

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const resetLibrary = useLibraryStore((state) => state.resetLibrary);
  const windowMode = useSettingsStore((state) => state.windowMode);
  const setWindowMode = useSettingsStore((state) => state.setWindowMode);
  const resolution = useSettingsStore((state) => state.resolution);
  const setResolution = useSettingsStore((state) => state.setResolution);
  const audioVolume = useSettingsStore((state) => state.audioVolume);
  const setAudioVolume = useSettingsStore((state) => state.setAudioVolume);
  const audioMuted = useSettingsStore((state) => state.audioMuted);
  const setAudioMuted = useSettingsStore((state) => state.setAudioMuted);
  const recalculateUserLevelFromAchievements = useAuthStore(
    (state) => state.recalculateUserLevelFromAchievements,
  );
  const [feedback, setFeedback] = useState<string | null>(
    (location.state as SettingsLocationState | null)?.steamMessage ?? null,
  );

  useEffect(() => {
    const steamStatus = searchParams.get("steam");
    const steamId = searchParams.get("steamId");

    if (!steamStatus) {
      return;
    }

    if (steamStatus === "linked" && steamId) {
      updateUser({ steamId });
    }

    navigate("/settings", {
      replace: true,
      state: {
        steamMessage:
          steamStatus === "linked" && steamId
            ? "Cuenta de Steam conectada correctamente."
            : "No se pudo conectar la cuenta de Steam.",
      } satisfies SettingsLocationState,
    });
  }, [navigate, searchParams, updateUser]);

  useEffect(() => {
    const stateMessage =
      (location.state as SettingsLocationState | null)?.steamMessage ?? null;

    if (stateMessage) {
      setFeedback(stateMessage);
    }
  }, [location.state]);

  useEffect(() => {
    void applyWindowSettings(windowMode, resolution).catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      setFeedback(
        `No se pudieron aplicar algunos cambios de ventana: ${errorMessage}`,
      );
    });
  }, [resolution, windowMode]);

  const steamStatusLabel = useMemo(() => {
    if (!user) {
      return "Inicia sesión para conectar Steam.";
    }

    if (user.steamId) {
      return `Conectada como ${user.steamId}`;
    }

    return "Steam no conectada.";
  }, [user]);

  const handleLogout = () => {
    logout();
    resetLibrary();
    navigate("/login");
  };

  const handleSteamToggle = async () => {
    try {
      if (user?.steamId) {
        await authService.disconnectSteam();
        setFeedback("Cuenta de Steam desconectada correctamente.");
        return;
      }

      authService.connectSteam("/settings");
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar la conexión de Steam.",
      );
    }
  };

  const handleVisitSteamProfile = () => {
    if (!user?.steamId) {
      return;
    }

    const steamCommunityProfile = `https://steamcommunity.com/profiles/${user.steamId}`;

    if (isTauri()) {
      window.location.href = `steam://openurl/${steamCommunityProfile}`;
      return;
    }

    window.open(steamCommunityProfile, "_blank", "noopener,noreferrer");
  };

  const handleCloseApp = async () => {
    if (!isTauri()) {
      window.close();
      return;
    }

    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch {
      setFeedback("No se pudo cerrar la aplicación desde este entorno.");
    }
  };

  const handleClearCache = async () => {
    try {
      const result = await clearLocalAppCache();
      await recalculateUserLevelFromAchievements();

      setFeedback(
        result.removedDiskCache
          ? "Cache local eliminada correctamente."
          : "Cache local limpiada. No habia archivos en disco para borrar.",
      );
    } catch (error) {
      setFeedback(
        error instanceof Error
          ? `No se pudo borrar la cache local: ${error.message}`
          : "No se pudo borrar la cache local.",
      );
    }
  };

  return (
    <main className="settings-page">
      <section className="settings-card">
        <header className="settings-header">
          <h1>Ajustes</h1>
          <button
            type="button"
            className="settings-back"
            onClick={() => navigate("/library")}
          >
            Volver
          </button>
        </header>

        <section className="settings-group">
          <h2>Ventana</h2>

          <label htmlFor="window-mode">Modo de ventana</label>
          <select
            id="window-mode"
            value={windowMode}
            onChange={(event) =>
              setWindowMode(event.target.value as WindowMode)
            }
          >
            {WINDOW_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>

          <label htmlFor="window-resolution">Resolución</label>
          <select
            id="window-resolution"
            value={resolution}
            onChange={(event) =>
              setResolution(event.target.value as ResolutionOption)
            }
            disabled={windowMode !== "windowed"}
          >
            {RESOLUTION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </section>

        <section className="settings-group">
          <h2>Audio</h2>

          <label htmlFor="audio-volume">
            Volumen general: {Math.round(audioVolume * 100)}%
          </label>
          <input
            id="audio-volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audioVolume}
            onChange={(event) => setAudioVolume(Number(event.target.value))}
            disabled={audioMuted}
          />

          <button
            type="button"
            className="settings-inline-button"
            onClick={() => setAudioMuted(!audioMuted)}
          >
            {audioMuted ? "Activar sonido" : "Silenciar"}
          </button>
        </section>

        <section className="settings-group">
          <h2>Plataformas externas</h2>
          <p>{steamStatusLabel}</p>
          <div className="settings-actions-row">
            <button
              type="button"
              className="settings-inline-button"
              onClick={() => {
                void handleSteamToggle();
              }}
            >
              {user?.steamId ? "Desconectar Steam" : "Conectar Steam"}
            </button>

            <button
              type="button"
              className="settings-inline-button"
              disabled={!user?.steamId}
              onClick={handleVisitSteamProfile}
            >
              Ver perfil Steam
            </button>
          </div>
        </section>

        <section className="settings-group">
          <h2>Almacenamiento local</h2>
          <p>
            Elimina imagenes en cache y datos temporales locales para forzar una
            nueva carga de assets y progreso cacheado.
          </p>
          <div className="settings-actions-row">
            <button
              type="button"
              className="settings-inline-button settings-inline-button--warning"
              onClick={() => {
                void handleClearCache();
              }}
            >
              Borrar cache local
            </button>
          </div>
        </section>

        <section className="settings-group settings-group--danger">
          <h2>Cuenta</h2>
          <div className="settings-actions-row">
            {user ? (
              <button
                type="button"
                className="settings-inline-button settings-inline-button--danger"
                onClick={handleLogout}
              >
                Cerrar sesión
              </button>
            ) : (
              <button
                type="button"
                className="settings-inline-button"
                onClick={() => navigate("/login")}
              >
                Iniciar sesión
              </button>
            )}

            <button
              type="button"
              className="settings-inline-button settings-inline-button--danger"
              onClick={() => {
                void handleCloseApp();
              }}
            >
              Cerrar aplicación
            </button>
          </div>
          {!isTauri() ? (
            <p className="settings-hint">
              El cierre de aplicación completo funciona en la versión de
              escritorio.
            </p>
          ) : null}
        </section>

        {feedback ? <p className="settings-feedback">{feedback}</p> : null}
      </section>
    </main>
  );
}
