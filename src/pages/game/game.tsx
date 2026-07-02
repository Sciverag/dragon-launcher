import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {
  game_detail,
  SteamPlayerAchievementsResponse,
} from "../../types/game";
import axios from "axios";
import "./game.css";
import { useLibraryStore } from "../../stores/libraryStore";
import { useAuthStore } from "../../stores/authStore";
import VideoPlayer from "../../components/video_player";
import { ThemeContext } from "../../userContext";
import Achievements from "../../components/Achievements";
import { createPortal } from "react-dom";
import {
  getGameAssets,
  getSteamPlayerAchievements,
  hasValidSteamAchievements,
} from "../../services/gameService";
import {
  calculateTotalXpFromStoredAchievements,
  getLevelProgress,
  saveAchievementSnapshot,
} from "../../utils/leveling";

function Game() {
  const { logo, background } = useContext(ThemeContext) as {
    logo: string;
    background: string;
  };
  const { gameId, gamePlatform } = useParams();
  const orientation = useLibraryStore((state) => state.orientation);
  const libraryGames = useLibraryStore((state) => state.games);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [game, setGame] = useState<game_detail | null>(null);
  const [playerAchievements, setPlayerAchievements] = useState<number>(0);
  const [playerAchievementData, setPlayerAchievementData] =
    useState<SteamPlayerAchievementsResponse | null>(null);
  const [dominantColor, setDominantColor] = useState<string>("#8B4513");
  const [logoHasError, setLogoHasError] = useState<boolean>(false);
  const [showAchievements, setShowAchievements] = useState<boolean>(false);
  const [gameHasReleased, setGameHasReleased] = useState<boolean>(true);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const hasInitialized = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (showAchievements) {
        setShowAchievements(false);
        playShowTrophyReverseAnimations();
        containerRef.current?.focus();
        return;
      }
      handleNavigationChange();
    }
  };

  const playPlayPressedAnimations = () => {
    playTransitionAnimations();
    const name_game = document.querySelector(".name-game-detail");
    if (name_game) {
      name_game.classList.add("grid");
    }
    const logo_game = document.querySelector(".logo-game-detail");
    if (logo_game) {
      logo_game.classList.add("grid");
    }
  };

  const playShowTrophyAnimations = () => {
    playTransitionAnimations();
    const name_game = document.querySelector(".name-game-detail");
    if (name_game) {
      name_game.classList.add("to-trophy");
      name_game.classList.remove("reverse-animation");
      name_game.classList.remove("grid");
    }
    const logo_game = document.querySelector(".logo-game-detail");
    if (logo_game) {
      logo_game.classList.add("to-trophy");
      logo_game.classList.remove("reverse-animation");
      logo_game.classList.remove("grid");
    }
    const achievements = document.querySelector(".achievprogr-container");
    if (achievements) {
      achievements.classList.remove("reverse-animation");
      achievements.classList.add("cancel-animation");
    }
  };

  const playShowTrophyReverseAnimations = () => {
    playReverseTransitionAnimations();
    const name_game = document.querySelector(".name-game-detail");
    if (name_game) {
      name_game.classList.add("to-trophy");
      name_game.classList.add("reverse-animation");
    }
    const logo_game = document.querySelector(".logo-game-detail");
    if (logo_game) {
      logo_game.classList.add("to-trophy");
      logo_game.classList.add("reverse-animation");
    }
    const achievements = document.querySelector(".achievprogr-container");
    if (achievements) {
      achievements.classList.remove("reverse-animation");
      achievements.classList.add("cancel-animation");
    }
  };

  const playTransitionAnimations = () => {
    const game_container = document.querySelector(".game-container");
    if (game_container) {
      game_container.classList.add("reverse-animation");
      game_container.classList.add("hidden");
      setTimeout(() => {
        game_container.classList.remove("hidden");
      }, 1);
    }
    const name_game = document.querySelector(".name-game-detail");
    if (name_game) {
      name_game.classList.add("reverse-animation");
      name_game.classList.remove("to-trophy");
      if (orientation === "grid") {
        name_game.classList.add("grid");
      }
    }
    const logo_game = document.querySelector(".logo-game-detail");
    if (logo_game) {
      logo_game.classList.add("reverse-animation");
      logo_game.classList.remove("to-trophy");
      if (orientation === "grid") {
        logo_game.classList.add("grid");
      }
    }
    const secondaryInfo = document.querySelector(".secondary-info-container");
    if (secondaryInfo) {
      secondaryInfo.classList.add("reverse-animation");
    }
    const gameButtons = document.querySelector(".game-buttons-container");
    if (gameButtons) {
      gameButtons.classList.add("reverse-animation");
    }
    const description = document.querySelector(".description-container");
    if (description) {
      description.classList.add("reverse-animation");
    }
    const achievements = document.querySelector(".achievprogr-container");
    if (achievements) {
      achievements.classList.add("reverse-animation");
    }
    const videoContainer = document.querySelector(".video-container");
    if (videoContainer) {
      videoContainer.classList.add("reverse-animation");
    }
  };

  const playReverseTransitionAnimations = () => {
    const game_container = document.querySelector(".game-container");
    if (game_container) {
      game_container.classList.remove("reverse-animation");
      game_container.classList.add("hidden");
      setTimeout(() => {
        game_container.classList.remove("hidden");
      }, 1);
    }
    const name_game = document.querySelector(".name-game-detail");
    if (name_game) {
      name_game.classList.remove("reverse-animation");
    }
    const logo_game = document.querySelector(".logo-game-detail");
    if (logo_game) {
      logo_game.classList.remove("reverse-animation");
    }
    const secondaryInfo = document.querySelector(".secondary-info-container");
    if (secondaryInfo) {
      secondaryInfo.classList.remove("reverse-animation");
    }
    const gameButtons = document.querySelector(".game-buttons-container");
    if (gameButtons) {
      gameButtons.classList.remove("reverse-animation");
    }
    const description = document.querySelector(".description-container");
    if (description) {
      description.classList.remove("reverse-animation");
    }
    const achievements = document.querySelector(".achievprogr-container");
    if (achievements) {
      achievements.classList.remove("reverse-animation");
    }
    const videoContainer = document.querySelector(".video-container");
    if (videoContainer) {
      videoContainer.classList.remove("reverse-animation");
    }
  };

  const handlePlayPressed = () => {
    playPlayPressedAnimations();
    setTimeout(() => {
      navigate(`/playing/${gameId}/${game?.name}/${gamePlatform}`);
    }, 1000);
  };

  const handleNavigationChange = () => {
    if (showAchievements) {
      setShowAchievements(false);
      return;
    }
    playTransitionAnimations();
    setTimeout(() => {
      navigate("/library", { state: { fromGame: true, gameId: gameId } });
    }, 1000);
  };

  const handleShowThrophy = () => {
    playShowTrophyAnimations();
    setTimeout(() => {
      setShowAchievements(true);
      containerRef.current?.focus();
    }, 100);
  };

  const ensureMinimumBrightness = useCallback(
    (hex: string, minLightness: number = 60) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0,
        s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      const newL = Math.max(l, minLightness / 100);

      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = newL < 0.5 ? newL * (1 + s) : newL + s - newL * s;
      const p = 2 * newL - q;
      const newR = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
      const newG = Math.round(hue2rgb(p, q, h) * 255);
      const newB = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

      return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
    },
    [],
  );

  const extractDominantColor = useCallback(
    async (imageUrl: string) => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(
              0,
              0,
              canvas.width,
              canvas.height,
            );
            const data = imageData.data;
            let r = 0,
              g = 0,
              b = 0;
            for (let i = 0; i < data.length; i += 4) {
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
            }
            const pixelCount = data.length / 4;
            r = Math.round(r / pixelCount);
            g = Math.round(g / pixelCount);
            b = Math.round(b / pixelCount);
            let hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
            hex = ensureMinimumBrightness(hex);
            setDominantColor(hex);
          }
        };
        img.src = imageUrl;
      } catch (error) {
        console.error("Failed to extract dominant color:", error);
      }
    },
    [ensureMinimumBrightness],
  );

  const enlightenColor = useCallback((hex: string, percent: number) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);

    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    const newR = Math.max(0, Math.min(255, R));
    const newG = Math.max(0, Math.min(255, G));
    const newB = Math.max(0, Math.min(255, B));

    return `#${(0x1000000 + (newR << 16) + (newG << 8) + newB)
      .toString(16)
      .slice(1)
      .toUpperCase()}`;
  }, []);

  const formatPlayedTime = useCallback((minutes?: number) => {
    if (minutes === undefined || minutes === null) {
      return "Sin datos";
    }

    const totalMinutes = Math.max(0, Math.floor(minutes));
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (hours === 0) {
      return `${remainingMinutes} min`;
    }

    if (remainingMinutes === 0) {
      return `${hours} h`;
    }

    return `${hours} h ${remainingMinutes} min`;
  }, []);

  const fetchGameDetails = useCallback(async () => {
    try {
      const getUrlForPlatform = (
        platform: string | undefined,
        id: string | undefined,
      ) => {
        if (!id) return null;
        switch (platform) {
          case "Steam":
            return `/steam-api/api/appdetails?appids=${id}`;
          case "Epic":
            return `/api/epic/games/${id}`;
          default:
            return `/api/games/${id}`;
        }
      };

      const url = getUrlForPlatform(gamePlatform, gameId);
      if (!url) return;

      const response = await axios.get(url);
      const gameData = response.data[gameId as string].data;

      const firstMovie = gameData.movies?.[0];
      const trailerUrl =
        firstMovie?.hls_h264 ??
        firstMovie?.dash_h264 ??
        firstMovie?.dash_av1 ??
        "";

      const selectedGame = libraryGames.find(
        (entry) => String(entry.id) === String(gameId),
      );

      let resolvedBackground = background;

      if (!resolvedBackground && gameId && gamePlatform) {
        try {
          const assets = await getGameAssets(gameId, gamePlatform);
          resolvedBackground = assets.background ?? "";
        } catch {
          resolvedBackground = "";
        }
      }

      console.log(gameData);

      setGameHasReleased(gameData.release_date.coming_soon === false);
      setIsInstalled(selectedGame?.isLocal ?? false);

      const gameDetails = {
        id: gameData.steam_appid as string,
        name: gameData.name as string,
        background: resolvedBackground,
        description: gameData.detailed_description,
        developer: gameData.developers?.join(", ") || "",
        release: gameData.release_date.date,
        played_time: formatPlayedTime(selectedGame?.played_minutes),
        trailer: trailerUrl,
        trailerPoster: firstMovie?.thumbnail || "",
        achievements: gameData.achievements,
      };
      setGame(gameDetails);

      if (gameDetails.background) {
        extractDominantColor(gameDetails.background);
      }

      const hasValidAchievements = hasValidSteamAchievements(
        gameDetails.achievements,
      );

      if (gamePlatform === "Steam" && token && gameId && hasValidAchievements) {
        try {
          const playerStats = await getSteamPlayerAchievements(gameId, token);
          setPlayerAchievementData(playerStats);
          setPlayerAchievements(playerStats.unlockedCount);

          const normalizedGameId = gameId ? String(gameId) : null;
          if (normalizedGameId && typeof window !== "undefined") {
            try {
              saveAchievementSnapshot(
                normalizedGameId,
                playerStats.achievements,
              );
              const nextXp = calculateTotalXpFromStoredAchievements();
              const nextLevelProgress = getLevelProgress(nextXp);
              updateUser({ xp: nextXp, level: nextLevelProgress.level });
            } catch (storageError) {
              console.error("Failed to persist achievement XP:", storageError);
            }
          }
        } catch (error) {
          console.error("Failed to fetch player achievements:", error);
          setPlayerAchievementData(null);
          setPlayerAchievements(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch game details:", error);
    }
  }, [
    background,
    formatPlayedTime,
    gameId,
    gamePlatform,
    extractDominantColor,
    libraryGames,
    token,
    updateUser,
  ]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    fetchGameDetails();
  }, [fetchGameDetails]);

  const hasValidAchievements = hasValidSteamAchievements(game?.achievements);

  const totalAchievements =
    playerAchievementData?.totalCount ?? game?.achievements?.total ?? 0;

  const achievementPercent = totalAchievements
    ? Math.min(100, Math.round((playerAchievements / totalAchievements) * 100))
    : 0;

  const playerAchievementQuality = (() => {
    if (achievementPercent <= 0) return "neutral";
    if (achievementPercent <= 40) return "bronce";
    if (achievementPercent <= 80) return "plata";
    if (achievementPercent < 100) return "oro";
    return "platino";
  })();

  return (
    <main
      ref={containerRef}
      tabIndex={0}
      onClick={() => containerRef.current?.focus()}
      onKeyDown={handleKeyDown}
      aria-label="gameContainer"
      className="game-container"
    >
      <section className="game-details-container">
        {logo && !logoHasError ? (
          <img
            src={logo}
            className={`logo-game-detail ${orientation}`}
            onError={() => setLogoHasError(true)}
          ></img>
        ) : (
          <h1 className={`name-game-detail ${orientation}`}>{game?.name}</h1>
        )}
        <section className="secondary-info-container">
          <div className="developer-info">
            <h1>{game?.developer}</h1>
            <p>{game?.release}</p>
          </div>
          <div className="time-info">
            <h1>Tiempo Jugado</h1>
            <p>{game?.played_time}</p>
          </div>
        </section>
        <section className="game-buttons-container">
          {gameHasReleased && (
            <button onClick={handlePlayPressed} className="button">
              {isInstalled ? <>Jugar</> : <>Instalar</>}
            </button>
          )}
          {hasValidAchievements && (
            <button onClick={handleShowThrophy} className="button">
              <span className="material-symbols-outlined">trophy</span>
            </button>
          )}
          <button className="button">
            <span className="material-symbols-outlined">image</span>
          </button>
          <button className="button">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </section>
        <div
          className="description-container"
          dangerouslySetInnerHTML={{ __html: game?.description ?? "" }}
        ></div>
      </section>
      <section className="miscelania-container">
        {hasValidAchievements && (
          <div className="achievprogr-container">
            <div className="achievement-info">
              <span
                className={`material-symbols-outlined achievement-info__trophy achievement-info__trophy--${playerAchievementQuality}`}
              >
                trophy
              </span>
              <p className="achievement-count">
                {playerAchievements} / {totalAchievements}
              </p>
            </div>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={playerAchievements}
              aria-valuemax={totalAchievements}
              aria-valuetext={`${achievementPercent}% completado`}
            >
              <div
                className="progress-bar__fill"
                style={{
                  width: `${achievementPercent}%`,
                  background: `linear-gradient(to right, ${enlightenColor(dominantColor, 20)}, ${dominantColor})`,
                }}
              />
            </div>
          </div>
        )}

        {game?.trailer && (
          <VideoPlayer
            videoUrl={game.trailer}
            videoPoster={game.trailerPoster}
            gameBackground={game.background}
            accentColor={dominantColor}
          />
        )}
      </section>
      {showAchievements &&
        createPortal(
          <Achievements
            achievements={playerAchievementData?.achievements ?? []}
            gameId={gameId}
            gameName={game?.name}
          />,
          document.body,
        )}
    </main>
  );
}

export default Game;
