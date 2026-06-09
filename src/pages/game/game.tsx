import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { game_detail } from "../../types/game";
import axios from "axios";
import "./game.css";
import { useLibraryStore } from "../../stores/libraryStore";
import VideoPlayer from "../../components/video_player";

function Game() {
  const { gameId, gamePlatform } = useParams();
  const orientation = useLibraryStore((state) => state.orientation);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [game, setGame] = useState<game_detail | null>(null);
  const [gameLogo, setGameLogo] = useState<string | null>(null);
  const [playerAchievements, setPlayerAchievements] = useState<number>(10);
  const [dominantColor, setDominantColor] = useState<string>("#8B4513");
  const hasInitialized = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      handleNavigationChange();
    }
  };

  const handleNavigationChange = () => {
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
    }
    const logo_game = document.querySelector(".logo-game-detail");
    if (logo_game) {
      logo_game.classList.add("reverse-animation");
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
    setTimeout(() => {
      navigate("/library", { state: { fromGame: true, gameId: gameId } });
    }, 1000);
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

  const getLogo = useCallback(async () => {
    const url = `https://cdn.cloudflare.steamstatic.com/steam/apps/${gameId}/logo.png`;

    try {
      const response = await fetch(url);
      if (response.ok) {
        setGameLogo(url);
      } else {
        setGameLogo(null);
      }
    } catch {
      setGameLogo(null);
    }
  }, [gameId]);

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

      const gameDetails = {
        id: gameData.steam_appid as string,
        name: gameData.name as string,
        background: `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/library_hero.jpg`,
        description: gameData.detailed_description,
        developer: gameData.developers?.join(", ") || "",
        release: gameData.release_date.date,
        played_time: "12h",
        trailer: trailerUrl,
        trailerPoster: firstMovie?.thumbnail || "",
        achievements: gameData.achievements,
      };
      setGame(gameDetails);
      console.log(gameData);
      const backgroundUrl = `https://cdn.akamai.steamstatic.com/steam/apps/${gameId}/library_hero.jpg`;
      extractDominantColor(backgroundUrl);
    } catch (error) {
      console.error("Failed to fetch game details:", error);
    }
  }, [gameId, gamePlatform, extractDominantColor]);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    getLogo();
    fetchGameDetails();
  }, [gameId, gamePlatform]);

  const achievementPercent = game?.achievements?.total
    ? Math.min(
        100,
        Math.round((playerAchievements / game.achievements.total) * 100),
      )
    : 0;

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
        <div
          className="background-game-detail"
          style={{
            backgroundImage: `url(${game?.background})`,
          }}
        ></div>
        {gameLogo ? (
          <img
            src={gameLogo}
            className={`logo-game-detail ${orientation}`}
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
          <button className="button">Jugar</button>
          <button className="button">
            <span className="material-symbols-outlined">trophy</span>
          </button>
          <button className="button">
            <span className="material-symbols-outlined">image</span>
          </button>
          <button className="button">
            <span className="material-symbols-outlined">settings</span>
          </button>
        </section>
        <div
          className="description-container"
          dangerouslySetInnerHTML={{ __html: game?.description }}
        ></div>
      </section>
      <section className="miscelania-container">
        {game?.achievements && (
          <div className="achievprogr-container">
            <div className="achievement-info">
              <span className="material-symbols-outlined">trophy</span>
              <p className="achievement-count">
                {playerAchievements} / {game?.achievements?.total}
              </p>
            </div>
            <div
              className="progress-bar"
              role="progressbar"
              aria-valuenow={playerAchievements}
              aria-valuemax={game?.achievements?.total ?? 0}
              aria-valuetext={`${achievementPercent}% completado`}
            >
              <div
                className="progress-bar__fill"
                style={{
                  width: `${achievementPercent}%`,
                  backgroundColor: dominantColor,
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
          />
        )}
      </section>
    </main>
  );
}

export default Game;
