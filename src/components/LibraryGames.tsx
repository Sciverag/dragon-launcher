import { useEffect, useRef, useState, type KeyboardEvent } from "react";
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
      setSelectedIndexState((current) =>
        Math.min(current + 1, filteredGames.length - 1),
      );
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setSelectedIndexState((current) => Math.max(current - 1, 0));
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
          <ul ref={gamesListRef} className={`games-list ${libraryOrientation}`}>
            {filteredGames.map((game, index) => (
              <li
                key={`${game.id}-${index}`}
                className={`game-card glass ${activeIndex === index ? "selected" : ""}`}
                style={{ animationDelay: `${index * 0.08}s` }}
                ref={(element) => {
                  itemRefs.current[index] = element;
                }}
                role="option"
                aria-selected={selectedIndex === index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
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
