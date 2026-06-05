import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import "./LibraryGames.css";
import type { game } from "../types/game";

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
  const [selectedIndexState, setSelectedIndexState] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const gamesListRef = useRef<HTMLUListElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const navigate = useNavigate();

  const filteredGames = games.filter((game) =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectedChange = () => {
    const game_logo = document.querySelector(".game-logo");
    if (game_logo) {
      game_logo.classList.add("hidden");
      setTimeout(() => {
        game_logo.classList.remove("hidden");
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

  const handleGamePageNav = (clickedIndex: number) => {
    setSelectedIndexState(clickedIndex);
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
    setTimeout(() => {
      navigate("/game");
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

  const activeIndex =
    normalizedHoveredIndex !== null ? normalizedHoveredIndex : selectedIndex;

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  useEffect(() => {
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
              {filteredGames[activeIndex].logo ? (
                <img
                  className="game-logo"
                  src={filteredGames[activeIndex].logo}
                  alt={`${filteredGames[activeIndex].name}`}
                />
              ) : (
                <h2 className="game-name">{filteredGames[activeIndex].name}</h2>
              )}
              {filteredGames[activeIndex].background && (
                <div
                  className="game-background"
                  style={{
                    backgroundImage: `url(${filteredGames[activeIndex].background})`,
                  }}
                ></div>
              )}
            </>
          )}
          {filteredGames[activeIndex] && (
            <button className="button game-button">Jugar</button>
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
              <li
                key={`${game.id}-${index}`}
                onClick={() => handleGamePageNav(index)}
                className={`game-card glass ${activeIndex === index ? "selected" : ""}`}
                style={{ animationDelay: `${index * 0.08}s` }}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                role="option"
                aria-selected={selectedIndex === index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() =>
                  libraryOrientation === "list"
                    ? setHoveredIndex(null)
                    : setSelectedIndexState(index)
                }
              >
                <img className="game-cover" src={game.cover} alt={game.name} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
