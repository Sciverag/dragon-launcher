import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGameDetails } from "../../services/gameService";
import { getPublicAchievementsOverview } from "../../services/userService";
import { useAuthStore } from "../../stores/authStore";
import { useLibraryStore } from "../../stores/libraryStore";
import {
  calculateXpFromAchievements,
  readAchievementSnapshots,
} from "../../utils/leveling";
import type { game } from "../../types/game";
import "./gamesXp.css";

type GameXpEntry = {
  appId: string;
  gameName: string;
  hero: string | null;
  xp: number;
  unlocked: number;
  total: number;
};

export default function GamesXp() {
  const userId = useParams<{ userId: string }>().userId;
  const currentUser = useAuthStore((state) => state.user);
  const isOwnProfile = userId != null && userId === currentUser?.id;
  const navigate = useNavigate();
  const libraryGames = useLibraryStore((state) => state.games);
  const [publicLibraryGames, setPublicLibraryGames] = useState<game[]>([]);
  const [publicSnapshots, setPublicSnapshots] = useState(
    readAchievementSnapshots(),
  );
  const [resolvedGameDetails, setResolvedGameDetails] = useState<
    Record<string, { name: string; hero: string | null }>
  >({});
  const localSnapshots = readAchievementSnapshots();
  const snapshots = isOwnProfile ? localSnapshots : publicSnapshots;
  const gamesForEntries = isOwnProfile ? libraryGames : publicLibraryGames;

  useEffect(() => {
    if (!userId || isOwnProfile) {
      setPublicLibraryGames((current) => (current.length > 0 ? [] : current));
      return;
    }

    let cancelled = false;

    const loadPublicOverview = async () => {
      try {
        const overview = await getPublicAchievementsOverview(userId);

        if (cancelled) {
          return;
        }

        setPublicLibraryGames(
          Array.isArray(overview.games) ? overview.games : [],
        );
        setPublicSnapshots(
          Array.isArray(overview.snapshots) ? overview.snapshots : [],
        );
      } catch {
        if (!cancelled) {
          setPublicLibraryGames([]);
          setPublicSnapshots([]);
        }
      }
    };

    void loadPublicOverview();

    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, userId]);

  useEffect(() => {
    const libraryById = new Map(
      gamesForEntries.map((game) => [
        String(game.id),
        {
          name: game.name,
          hero: game.header ?? game.background ?? game.cover ?? null,
        },
      ]),
    );

    const missingAppIds = Array.from(
      new Set(snapshots.map((s) => s.appId)),
    ).filter((appId) => {
      const localDetails = libraryById.get(appId);
      const hasLocalName = Boolean(localDetails?.name?.trim());
      const hasLocalHero = Boolean(localDetails?.hero);

      if (hasLocalName && hasLocalHero) {
        return false;
      }

      return !resolvedGameDetails[appId];
    });

    if (missingAppIds.length === 0) {
      return;
    }

    let cancelled = false;

    const resolveMissingNames = async () => {
      const resolvedEntries = await Promise.all(
        missingAppIds.map(async (appId) => {
          try {
            const details = await getGameDetails(appId);
            const resolvedDetails = {
              name:
                typeof details?.name === "string" &&
                details.name.trim().length > 0
                  ? details.name.trim()
                  : `Juego ${appId}`,
              hero:
                typeof details?.header_image === "string" &&
                details.header_image.trim().length > 0
                  ? details.header_image.trim()
                  : null,
            };

            return [appId, resolvedDetails] as const;
          } catch {
            return [
              appId,
              {
                name: `Juego ${appId}`,
                hero: null,
              },
            ] as const;
          }
        }),
      );

      if (cancelled) {
        return;
      }

      setResolvedGameDetails((current) => {
        const next = { ...current };
        resolvedEntries.forEach(([appId, details]) => {
          next[appId] = details;
        });
        return next;
      });
    };

    void resolveMissingNames();

    return () => {
      cancelled = true;
    };
  }, [gamesForEntries, resolvedGameDetails, snapshots]);

  const gamesWithXp = useMemo(() => {
    const gameDetailsById = new Map(
      gamesForEntries.map((game) => [
        String(game.id),
        {
          name: game.name,
          hero: game.header ?? game.background ?? game.cover ?? null,
        },
      ]),
    );

    const entries = snapshots.map<GameXpEntry>((snapshot) => {
      const unlocked = snapshot.achievements.filter(
        (achievement) => achievement.achieved,
      ).length;
      const localDetails = gameDetailsById.get(snapshot.appId);
      const remoteDetails = resolvedGameDetails[snapshot.appId];

      return {
        appId: snapshot.appId,
        gameName:
          localDetails?.name ??
          remoteDetails?.name ??
          `Juego ${snapshot.appId}`,
        hero: localDetails?.hero ?? remoteDetails?.hero ?? null,
        xp: calculateXpFromAchievements(snapshot.achievements),
        unlocked,
        total: snapshot.achievements.length,
      };
    });

    return entries.sort((a, b) => b.xp - a.xp);
  }, [gamesForEntries, resolvedGameDetails, snapshots]);

  const totalXp = gamesWithXp.reduce((acc, game) => acc + game.xp, 0);

  return (
    <main className="games-xp-page">
      <section className="games-xp-card">
        <header className="games-xp-header">
          <div>
            <p className="games-xp-label">Perfil</p>
            <h1>XP por juego</h1>
            <p className="games-xp-subtitle">
              Revisa cuanta experiencia te aporto cada juego segun los logros
              desbloqueados.
            </p>
          </div>
          <button
            type="button"
            className="games-xp-back button"
            onClick={() => navigate(`/profile/${userId}`)}
          >
            Volver al perfil
          </button>
        </header>

        <div className="games-xp-total">
          <span>XP total registrada</span>
          <strong>{totalXp} XP</strong>
        </div>

        {gamesWithXp.length > 0 ? (
          <ul className="games-xp-list">
            {gamesWithXp.map((game) => (
              <li key={game.appId}>
                <div className="games-xp-item-main">
                  {game.hero ? (
                    <img
                      src={game.hero}
                      alt={`Hero de ${game.gameName}`}
                      className="games-xp-hero"
                    />
                  ) : (
                    <div className="games-xp-hero games-xp-hero--fallback" />
                  )}
                  <div>
                    <p>{game.gameName}</p>
                    <small>
                      {game.unlocked}/{game.total} logros desbloqueados
                    </small>
                  </div>
                </div>
                <strong>{game.xp} XP</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="games-xp-empty">
            No hay datos de logros todavia. Juega o sincroniza tu biblioteca
            para generar XP por juego.
          </p>
        )}
      </section>
    </main>
  );
}
