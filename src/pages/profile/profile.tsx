import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getGameDetails } from "../../services/gameService";
import {
  getPublicAchievementsOverview,
  getUserProfile,
} from "../../services/userService";
import { useAuthStore } from "../../stores/authStore";
import { useLibraryStore } from "../../stores/libraryStore";
import {
  dedupeTitles,
  getAchievementQuality,
  getAchievementXp,
  getLevelProgress,
  readAchievementSnapshots,
} from "../../utils/leveling";
import type { game } from "../../types/game";
import type { User } from "../../types/user";
import "./profile.css";

export default function Profile() {
  const userId = useParams<{ userId: string }>().userId;
  const currentUser = useAuthStore((state) => state.user);
  const recalculateUserLevelFromAchievements = useAuthStore(
    (state) => state.recalculateUserLevelFromAchievements,
  );
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hasLoadedLibraryGames = useLibraryStore(
    (state) => state.hasLoadedGames,
  );
  const libraryGames = useLibraryStore((state) => state.games);
  const [resolvedGameDetails, setResolvedGameDetails] = useState<
    Record<string, { name: string; hero: string | null }>
  >({});
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [publicSnapshots, setPublicSnapshots] = useState(
    readAchievementSnapshots(),
  );
  const [publicLibraryGames, setPublicLibraryGames] = useState<game[]>([]);

  const localSnapshots = readAchievementSnapshots();
  const isOwnProfile = userId != null && userId === currentUser?.id;
  const snapshots = isOwnProfile ? localSnapshots : publicSnapshots;
  const gamesForAchievements = isOwnProfile ? libraryGames : publicLibraryGames;

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!userId) {
      setProfileUser(null);
      setProfileError("No se pudo resolver el perfil solicitado.");
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const userProfile = await getUserProfile(userId);

        if (!cancelled) {
          setProfileUser(userProfile);
        }
      } catch {
        if (!cancelled) {
          setProfileUser(null);
          setProfileError("No se pudo cargar el perfil.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingProfile(false);
        }
      }
    };

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setPublicSnapshots([]);
      setPublicLibraryGames([]);
      return;
    }

    if (isOwnProfile) {
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

        setPublicSnapshots(
          Array.isArray(overview.snapshots) ? overview.snapshots : [],
        );
        setPublicLibraryGames(
          Array.isArray(overview.games) ? overview.games : [],
        );
      } catch {
        if (!cancelled) {
          setPublicSnapshots([]);
          setPublicLibraryGames([]);
          setProfileError(
            "No se pudo cargar el progreso de logros del perfil público.",
          );
        }
      }
    };

    void loadPublicOverview();

    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, userId]);

  useEffect(() => {
    const libraryDetailsById = new Map(
      gamesForAchievements.map((game) => [
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
      const localDetails = libraryDetailsById.get(appId);
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

    const resolveMissingDetails = async () => {
      const resolvedEntries = await Promise.all(
        missingAppIds.map(async (appId) => {
          try {
            const details = await getGameDetails(appId);
            return [
              appId,
              {
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
              },
            ] as const;
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
        resolvedEntries.forEach(([appId, gameDetails]) => {
          next[appId] = gameDetails;
        });
        return next;
      });
    };

    void resolveMissingDetails();

    return () => {
      cancelled = true;
    };
  }, [gamesForAchievements, snapshots, resolvedGameDetails]);

  useEffect(() => {
    if (!hasLoadedLibraryGames || !isOwnProfile) {
      return;
    }

    let cancelled = false;

    const syncProfile = async () => {
      await recalculateUserLevelFromAchievements();

      if (!cancelled && userId) {
        try {
          const refreshedProfile = await getUserProfile(userId);
          setProfileUser(refreshedProfile);
        } catch {
          setProfileError("No se pudo refrescar el perfil.");
        }
      }
    };

    void syncProfile();

    return () => {
      cancelled = true;
    };
  }, [
    hasLoadedLibraryGames,
    isOwnProfile,
    recalculateUserLevelFromAchievements,
    userId,
  ]);

  const profileData = profileUser;

  const handleBackToLibrary = () => {
    navigate("/library");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      handleBackToLibrary();
    }
  };

  const levelProgress = useMemo(() => {
    const rawXp = profileData?.xp ?? 0;
    const computedProgress = getLevelProgress(rawXp);

    return {
      ...computedProgress,
      level: profileData?.level ?? computedProgress.level,
    };
  }, [profileData?.level, profileData?.xp]);

  const achievementOverview = useMemo(() => {
    const gameDetailsById = new Map(
      gamesForAchievements.map((game) => [String(game.id), game.name]),
    );
    const gameHeroById = new Map(
      gamesForAchievements.map((game) => [
        String(game.id),
        game.header ?? game.background ?? game.cover ?? null,
      ]),
    );

    const totalAchievements = snapshots.reduce(
      (total, snapshot) => total + snapshot.achievements.length,
      0,
    );

    const unlockedAchievements = snapshots.reduce(
      (total, snapshot) =>
        total +
        snapshot.achievements.filter((achievement) => achievement.achieved)
          .length,
      0,
    );

    const latestUnlocked = snapshots
      .flatMap((snapshot) => {
        const unlockedForGame = snapshot.achievements.filter(
          (achievement) => achievement.achieved,
        );

        return unlockedForGame.map((achievement) => ({
          appId: snapshot.appId,
          gameName:
            gameDetailsById.get(snapshot.appId) ??
            resolvedGameDetails[snapshot.appId]?.name ??
            `Juego ${snapshot.appId}`,
          name: achievement.name,
          icon: achievement.icon,
          quality: getAchievementQuality(
            achievement.globalPercent,
            snapshot.achievements,
          ),
          unlockTime: achievement.unlockTime,
          xp: getAchievementXp(achievement, snapshot.achievements),
        }));
      })
      .sort((a, b) => (b.unlockTime ?? 0) - (a.unlockTime ?? 0))
      .slice(0, 10);

    const completedGames = snapshots
      .filter(
        (snapshot) =>
          snapshot.achievements.length > 0 &&
          snapshot.achievements.every((achievement) => achievement.achieved),
      )
      .map((snapshot) => ({
        appId: snapshot.appId,
        gameName:
          gameDetailsById.get(snapshot.appId) ??
          resolvedGameDetails[snapshot.appId]?.name ??
          `Juego ${snapshot.appId}`,
        hero:
          gameHeroById.get(snapshot.appId) ??
          resolvedGameDetails[snapshot.appId]?.hero ??
          null,
        completedAt: Math.max(
          ...snapshot.achievements.map(
            (achievement) => achievement.unlockTime ?? 0,
          ),
        ),
        totalAchievements: snapshot.achievements.length,
      }))
      .sort((a, b) => b.completedAt - a.completedAt)
      .slice(0, 10);

    return {
      totalAchievements,
      unlockedAchievements,
      latestUnlocked,
      completedGames,
      unlockedPercentage:
        totalAchievements > 0
          ? Math.round((unlockedAchievements / totalAchievements) * 100)
          : 0,
    };
  }, [gamesForAchievements, resolvedGameDetails, snapshots]);

  return (
    <main
      tabIndex={0}
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="profile-container"
    >
      <section className="custom-section">
        <div className="hero-container">
          <img className="hero" src="" alt="" />
        </div>
        <div className="avatar-container">
          <img className="avatar" src={profileData?.avatar} alt="" />
          <div className="name-title-container">
            <h1 className="user-name">
              {isLoadingProfile ? "Cargando perfil..." : profileData?.username}
            </h1>
            <h2 className="user-title">
              {profileData?.equippedTitle ?? "Sin título equipado"}
            </h2>
          </div>
          {profileError ? (
            <p className="profile-achievements-empty">{profileError}</p>
          ) : null}
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

        <>
          <section className="profile-achievements-card">
            <header className="profile-achievements-header">
              <div>
                <h3 className="profile-achievements-title">Logros</h3>
              </div>
              <button
                className="profile-achievements-button"
                type="button"
                onClick={() => navigate(`/profile/${userId}/games-xp`)}
              >
                Ver XP por juego
              </button>
            </header>

            <div className="profile-achievements-stats">
              <article>
                <span>Logros desbloqueados</span>
                <strong>{achievementOverview.unlockedAchievements}</strong>
              </article>
              <article>
                <span>Porcentaje de logros desbloqueados</span>
                <strong>{achievementOverview.unlockedPercentage}%</strong>
              </article>
            </div>

            <div className="profile-latest-achievements">
              <h4>Ultimos logros obtenidos</h4>
              {achievementOverview.latestUnlocked.length > 0 ? (
                <ul className="profile-latest-achievements-icons">
                  {achievementOverview.latestUnlocked.map((achievement) => (
                    <li
                      key={`${achievement.appId}-${achievement.name}-${achievement.unlockTime ?? "na"}`}
                    >
                      <div
                        title={`${achievement.name} · ${achievement.gameName}`}
                        className="profile-achievement-icon-item"
                      >
                        <img
                          src={achievement.icon}
                          alt={achievement.name}
                          className={`profile-achievement-icon profile-achievement-icon--${achievement.quality}`}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="profile-achievements-empty">
                  Todavia no hay logros desbloqueados para mostrar.
                </p>
              )}
            </div>
          </section>

          <section className="profile-completed-games-card">
            <header className="profile-achievements-header">
              <div>
                <h3 className="profile-achievements-title">
                  Juegos completados al 100%
                </h3>
              </div>
            </header>

            {achievementOverview.completedGames.length > 0 ? (
              <ul className="profile-completed-games-list">
                {achievementOverview.completedGames.map((game) => (
                  <li
                    title={game.gameName}
                    key={game.appId}
                    className="profile-completed-games-item"
                  >
                    {game.hero ? (
                      <img
                        src={game.hero}
                        alt={`Hero de ${game.gameName}`}
                        className="profile-completed-game-hero"
                      />
                    ) : (
                      <div
                        title={game.gameName}
                        className="profile-completed-game-hero profile-completed-game-hero--fallback"
                      />
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-achievements-empty">
                Todavia no hay juegos completados al 100%.
              </p>
            )}
          </section>
        </>
      </section>
    </main>
  );
}
