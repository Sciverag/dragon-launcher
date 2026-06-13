import {
  useContext,
  useEffect,
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
  const { logo } = useContext(ThemeContext);
  const [selectedIndexState, setSelectedIndexState] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [logoHasError, setLogoHasError] = useState<boolean>(false);
  const [changeBackgroundOnce, setChangeBackgroundOnce] = useState<number>(0);
  const [changeLogoOnce, setChangeLogoOnce] = useState<number>(0);
  const [changeIconOnce, setChangeIconOnce] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gamesListRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [cancelAnimation, setCancelAnimation] = useState(
    (location.state as { fromGame?: boolean })?.fromGame ?? false,
  );
  const lastSelId = (location.state as { gameId?: number })?.gameId ?? null;
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
    setSelectedIndexState(clickedIndex);
    playTransitionAnimations();
    setTimeout(() => {
      navigate(
        `/game/${filteredGames[activeIndex].id}/${filteredGames[activeIndex].platform}`,
      );
    }, 1000);
  };

  const selectLeftGame = () => {
    setSelectedIndexState((current) => Math.max(current - 1, 0));
  };

  const selectRightGame = () => {
    setSelectedIndexState((current) =>
      Math.min(current + 1, filteredGames.length - 1),
    );
  };

  const selectedIndex =
    filteredGames.length > 0
      ? Math.min(selectedIndexState, filteredGames.length - 1)
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
    if (
      lastSelectedIndex !== -1 &&
      filteredGames.length !== 0 &&
      !hasInitialized
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedIndexState(lastSelectedIndex);
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
    handleOrientationChange();
  }, [libraryOrientation]);

  useEffect(() => {
    const selectedItem = itemRefs.current[selectedIndex];
    const list = gamesListRef.current;
    if (!selectedItem || !list) {
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
      handleGamePageNav(selectedIndexState);
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
              Jugar
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
                key={index}
                game={game}
                index={index}
                libraryOrientation={libraryOrientation}
                selectedIndex={selectedIndex}
                changeBackgroundOnce={changeBackgroundOnce}
                changeLogoOnce={changeLogoOnce}
                changeIconOnce={changeIconOnce}
                activeIndex={activeIndex}
                itemRefs={itemRefs}
                handleGamePageNav={handleGamePageNav}
                setHoveredIndex={setHoveredIndex}
                setSelectedIndexState={setSelectedIndexState}
                setChangeBackgroundOnce={setChangeBackgroundOnce}
                setChangeLogoOnce={setChangeLogoOnce}
                setChangeIconOnce={setChangeIconOnce}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
