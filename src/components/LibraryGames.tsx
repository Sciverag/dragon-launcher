import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./LibraryGames.css";
import type { game } from "../types/game";
import LibraryCard from "./LibraryCard";
import { ThemeContext } from "../userContext";

interface LibraryGamesProps {
  libraryOrientation: "grid" | "list";
  searchQuery: string;
  games: game[];
}

export default function LibraryGames({
  libraryOrientation,
  searchQuery,
  games,
}: LibraryGamesProps) {
  const location = useLocation();
  const { logo } = useContext(ThemeContext) as {
    logo: string;
  };
  const [selectedIndexState, setSelectedIndexState] = useState(0);
  const [selectedGameId, setSelectedGameId] = useState<string | number | null>(
    null,
  );
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [logoHasError, setLogoHasError] = useState<boolean>(false);
  const [changeBackgroundOnce, setChangeBackgroundOnce] = useState<number>(0);
  const [changeLogoOnce, setChangeLogoOnce] = useState<number>(0);
  const [changeIconOnce, setChangeIconOnce] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gamesListRef = useRef<HTMLUListElement | null>(null);
  const navigate = useNavigate();
  const [cancelAnimation, setCancelAnimation] = useState(
    (location.state as { fromGame?: boolean })?.fromGame ?? false,
  );
  const lastSelId = (location.state as { gameId?: number })?.gameId ?? null;

  useEffect(() => {
    setSelectedGameId(lastSelId);
  }, [lastSelId]);
  useEffect(() => {
    if (cancelAnimation) {
      setTimeout(() => {
        setCancelAnimation(false);
      }, 1000);
    }
  }, [cancelAnimation]);

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const loadOrder = useMemo(() => {
    const orderedIndexes = filteredGames.map((_, index) => index);

    const priorityIndex = filteredGames.findIndex(
      (game) => game.id == lastSelId,
    );

    if (priorityIndex > 0) {
      orderedIndexes.splice(priorityIndex, 1);
      orderedIndexes.unshift(priorityIndex);
    }

    return orderedIndexes;
  }, [filteredGames, lastSelId]);

  const loadRankByIndex = useMemo(() => {
    const rankMap = new Map<number, number>();

    loadOrder.forEach((index, rank) => {
      rankMap.set(index, rank);
    });

    return rankMap;
  }, [loadOrder]);

  const [loadStep, setLoadStep] = useState(0);

  const handleSelectedChange = () => {
    setLogoHasError(false);
    setChangeBackgroundOnce(0);
    setChangeLogoOnce(0);
    setChangeIconOnce(0);
    const game_logo = document.querySelector(".game-logo");
    const game_name = document.querySelector(".game-name");
    if (game_logo) {
      game_logo.classList.add("hidden");
      setTimeout(() => {
        game_logo.classList.remove("hidden");
      }, 1);
    }

    if (game_name) {
      game_name.classList.add("hidden");
      setTimeout(() => {
        game_name.classList.remove("hidden");
      }, 1);
    }
  };

  const handleOrientationChange = () => {
    const games_list = document.querySelector(".games-list");
    if (games_list) {
      games_list.classList.add("hidden");
      setTimeout(() => {
        games_list.classList.remove("hidden");
      }, 1);
    }
  };

  const playPlatingAnimations = () => {
    playTransitionAnimations();
    const game_logo = document.querySelector(".game-logo");
    const game_name = document.querySelector(".game-name");
    if (game_logo) {
      game_logo.classList.add("reverse-animation");
      game_logo.classList.add("hidden");
      setTimeout(() => {
        game_logo.classList.remove("hidden");
      }, 1);
    }
    if (game_name) {
      game_name.classList.add("reverse-animation");
      game_name.classList.add("hidden");
      setTimeout(() => {
        game_logo?.classList.remove("hidden");
      }, 1);
    }
  };

  const playTransitionAnimations = () => {
    const library_header = document.querySelector(".library-header");
    if (library_header) {
      library_header.classList.add("reverse-animation");
      library_header.classList.add("hidden");
      setTimeout(() => {
        library_header.classList.remove("hidden");
      }, 1);
    }
    const games_list = document.querySelector(".games-list");
    if (games_list) {
      games_list.classList.add("reverse-animation");
      games_list.classList.add("hidden");
      setTimeout(() => {
        games_list.classList.remove("hidden");
      }, 1);
    }
    const scroll_buttons = document.querySelectorAll(".scroll-button");
    if (scroll_buttons) {
      scroll_buttons.forEach((scroll_button) => {
        scroll_button.classList.add("reverse-animation");
        scroll_button.classList.add("hidden");
        setTimeout(() => {
          scroll_button.classList.remove("hidden");
        }, 1);
      });
    }
    const library_ocean = document.querySelector(".library-ocean");
    if (library_ocean) {
      library_ocean.classList.add("reverse-animation");
      library_ocean.classList.add("hidden");
      setTimeout(() => {
        library_ocean.classList.remove("hidden");
      }, 1);
    }
    const game_button = document.querySelector(".game-button");
    if (game_button) {
      game_button.classList.add("reverse-animation");
      game_button.classList.add("hidden");
      setTimeout(() => {
        game_button.classList.remove("hidden");
      }, 1);
    }
  };

  const handlePlay = () => {
    playPlatingAnimations();
    setTimeout(() => {
      navigate(
        `/playing/${filteredGames[activeIndex].id}/${filteredGames[activeIndex].name}/${filteredGames[activeIndex].platform}`,
      );
    }, 1000);
  };

  const handleGamePageNav = (clickedIndex: number) => {
    const targetGame = filteredGames[clickedIndex];

    if (!targetGame) {
      return;
    }

    setSelectedIndexState(clickedIndex);
    setSelectedGameId(targetGame.id);
    playTransitionAnimations();
    setTimeout(() => {
      navigate(`/game/${targetGame.id}/${targetGame.platform}`);
    }, 1000);
  };

  const selectLeftGame = () => {
    setSelectedIndexState((current) => {
      const nextIndex = Math.max(current - 1, 0);
      setSelectedGameId(filteredGames[nextIndex]?.id ?? null);
      return nextIndex;
    });
  };

  const selectRightGame = () => {
    setSelectedIndexState((current) => {
      const nextIndex = Math.min(current + 1, filteredGames.length - 1);
      setSelectedGameId(filteredGames[nextIndex]?.id ?? null);
      return nextIndex;
    });
  };

  const selectedIndexFromId = filteredGames.findIndex(
    (game) => String(game.id) === String(selectedGameId),
  );
  const selectedIndex =
    filteredGames.length > 0
      ? selectedIndexFromId !== -1
        ? selectedIndexFromId
        : Math.min(selectedIndexState, filteredGames.length - 1)
      : 0;
  const normalizedHoveredIndex =
    hoveredIndex !== null && hoveredIndex < filteredGames.length
      ? hoveredIndex
      : null;

  const lastSelectedIndex = filteredGames.findIndex(
    (game) => game.id == lastSelId,
  );

  const activeIndex =
    normalizedHoveredIndex !== null
      ? normalizedHoveredIndex
      : lastSelectedIndex !== selectedIndex &&
          !hasInitialized &&
          lastSelectedIndex !== -1
        ? lastSelectedIndex
        : selectedIndex;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadStep(0);
  }, [loadOrder.length, searchQuery]);

  useEffect(() => {
    if (filteredGames.length <= 1 || loadStep >= filteredGames.length - 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setLoadStep((current) => {
        if (current >= filteredGames.length - 1) {
          window.clearInterval(intervalId);
          return current;
        }

        return current + 1;
      });
    }, 120);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [filteredGames.length, loadStep]);

  useEffect(() => {
    if (
      lastSelectedIndex !== -1 &&
      filteredGames.length !== 0 &&
      !hasInitialized
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndexState(lastSelectedIndex);
      setSelectedGameId(filteredGames[lastSelectedIndex]?.id ?? lastSelId);
      setChangeBackgroundOnce(1);
      setChangeLogoOnce(1);
      setChangeIconOnce(1);
      setHasInitialized(true);
    } else {
      return;
    }
  }, [lastSelectedIndex]);

  useEffect(() => {
    containerRef.current?.focus();
    const game_background = document.querySelector(".game-background");
    if (
      game_background &&
      game_background.classList.contains("reverse-animation")
    ) {
      game_background.classList.add("hidden");
      game_background.classList.remove("reverse-animation");

      setTimeout(() => {
        game_background.classList.remove("hidden");
      }, 100);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleSelectedChange();
  }, [activeIndex]);

  useEffect(() => {
    // A newly loaded logo should always get a fresh render attempt.
    if (logo) {
      setLogoHasError(false);
    }
  }, [logo]);

  useEffect(() => {
    containerRef.current?.focus();
    handleOrientationChange();
  }, [libraryOrientation]);

  useEffect(() => {
    const list = gamesListRef.current;
    if (!list) {
      return;
    }

    const selectedItem = list.querySelector(
      `[data-index=\"${selectedIndex}\"]`,
    ) as HTMLLIElement | null;

    if (!selectedItem) {
      return;
    }

    const itemLeft = selectedItem.offsetLeft;
    const itemWidth = selectedItem.offsetWidth;
    const containerWidth = list.clientWidth;
    const targetScrollLeft = Math.max(
      0,
      itemLeft - (containerWidth - itemWidth) / 2,
    );

    list.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, [selectedIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (filteredGames.length === 0) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectRightGame();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectLeftGame();
    }

    if (event.key === "Enter") {
      event.preventDefault();
      handleGamePageNav(selectedIndex);
    }
  };

  return (
    <div
      className="library-games"
      ref={containerRef}
      tabIndex={0}
      onClick={() => containerRef.current?.focus()}
      onKeyDown={handleKeyDown}
      aria-label="Lista de juegos"
    >
      {filteredGames.length === 0 ? (
        <p className="notfound-text">No se encontraron juegos.</p>
      ) : (
        <>
          {filteredGames[activeIndex] && (
            <>
              {logo && !logoHasError ? (
                <img
                  className={`game-logo ${cancelAnimation ? "cancel-animation" : ""}`}
                  src={logo}
                  onError={() => {
                    setLogoHasError(true);
                  }}
                />
              ) : (
                <h2
                  className={`game-name ${cancelAnimation ? "cancel-animation" : ""}`}
                >
                  {filteredGames[activeIndex].name}
                </h2>
              )}
            </>
          )}
          {filteredGames[activeIndex] && (
            <button onClick={handlePlay} className="button game-button">
              {filteredGames[activeIndex].isLocal ? "Jugar" : "Instalar"}
            </button>
          )}
          <div className="scrollbutton-container">
            <button className="scroll-button button" onClick={selectLeftGame}>
              <span className="material-symbols-outlined">arrow_left</span>
            </button>
            <button className="scroll-button button" onClick={selectRightGame}>
              <span className="material-symbols-outlined">arrow_right</span>
            </button>
          </div>
          <ul ref={gamesListRef} className={`games-list ${libraryOrientation}`}>
            {filteredGames.map((game, index) => (
              <LibraryCard
                key={`${game.id}-${game.platform}`}
                aria-label={game.name}
                game={game}
                index={index}
                libraryOrientation={libraryOrientation}
                selectedIndex={selectedIndex}
                changeBackgroundOnce={changeBackgroundOnce}
                changeLogoOnce={changeLogoOnce}
                changeIconOnce={changeIconOnce}
                activeIndex={activeIndex}
                handleGamePageNav={handleGamePageNav}
                setHoveredIndex={setHoveredIndex}
                setSelectedIndexState={setSelectedIndexState}
                setSelectedGameId={setSelectedGameId}
                setChangeBackgroundOnce={setChangeBackgroundOnce}
                setChangeLogoOnce={setChangeLogoOnce}
                setChangeIconOnce={setChangeIconOnce}
                shouldLoadAssets={
                  activeIndex === index ||
                  (loadRankByIndex.get(index) ?? Number.MAX_SAFE_INTEGER) <=
                    loadStep
                }
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
