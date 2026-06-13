import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import "./LibraryHeader.css";
import { useNavigate } from "react-router-dom";

interface LibraryHeaderProps {
  onOrientationChange?: (orientation: "grid" | "list") => void;
  onSearch?: (query: string) => void;
  currentOrientation?: "grid" | "list";
}

export const LibraryHeader = ({
  onOrientationChange,
  onSearch,
  currentOrientation = "list",
}: LibraryHeaderProps) => {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleOpenSearch = () => {
    const search_container = document.querySelector(".search-container");

    if (searchOpen) {
      if (search_container) {
        search_container.classList.add("reverse-animation");
        search_container.classList.add("hidden");
        setTimeout(() => {
          search_container.classList.remove("hidden");
        }, 0);
      }

      setTimeout(() => {
        setSearchOpen(false);
      }, 200);
    } else {
      setSearchOpen(true);
      if (search_container) {
        search_container.classList.remove("reverse-animation");
      }
    }
  };

  const handleOrientationToggle = () => {
    const newOrientation = currentOrientation === "grid" ? "list" : "grid";
    onOrientationChange?.(newOrientation);
  };

  const handleRouteChange = (route: string) => {
    const ocean = document.querySelector(".library-ocean");
    if (ocean) {
      ocean.classList.add("hidden");
      setTimeout(() => {
        ocean.classList.remove("hidden");
        ocean.classList.add("visible");
        ocean.classList.add("reverse-animation");
      }, 1);
    }
    const libraryHeader = document.querySelector(".library-header");
    if (libraryHeader) {
      libraryHeader.classList.add("hidden");
      setTimeout(() => {
        libraryHeader.classList.remove("hidden");
        libraryHeader.classList.add("visible");
        libraryHeader.classList.add("reverse-animation");
      }, 1);
    }
    const scroll_buttons = document.querySelectorAll(".scroll-button");
    if (scroll_buttons) {
      scroll_buttons.forEach((scroll_button) => {
        scroll_button.classList.add("reverse-animation");
      });
    }
    const libraryGames = document.querySelector(".library-games");
    if (libraryGames) {
      libraryGames.classList.add("reverse-animation");
      libraryGames.classList.add("hidden");
      setTimeout(() => {
        libraryGames.classList.remove("hidden");
      }, 1);
    }
    const game_button = document.querySelector(".game-button");
    if (game_button) {
      game_button.classList.add("reverse-animation");
    }
    const game_background = document.querySelector(".game-background");
    if (game_background) {
      game_background.classList.add("reverse-animation");
      game_background.classList.add("hidden");
      setTimeout(() => {
        game_background.classList.remove("hidden");
      }, 0);
    }
    const game_logo = document.querySelector(".game-logo");
    const game_name = document.querySelector(".game-name");
    if (game_logo) {
      game_logo.classList.add("reverse-animation");
    }
    if (game_name) {
      game_name.classList.add("reverse-animation");
    }
    setTimeout(() => {
      navigate(route);
    }, 1000);
  };

  return (
    <header className="library-header">
      <button
        className="button"
        title={isLoggedIn ? "Perfil de usuario" : "Iniciar sesión"}
        aria-label="Menú de usuario"
        onClick={() =>
          !isLoggedIn
            ? handleRouteChange("/login")
            : handleRouteChange("/profile")
        }
      >
        {isLoggedIn ? (
          <img src="" alt="" />
        ) : (
          <span className="material-symbols-outlined">person</span>
        )}
      </button>
      <button
        className="button"
        onClick={handleOpenSearch}
        title="Buscar"
        aria-label="Búsqueda"
      >
        <span className="material-symbols-outlined">search</span>
      </button>

      <div hidden={!searchOpen} className="search-container">
        <div className="form-group">
          <label htmlFor="text">
            {" "}
            <span className="material-symbols-outlined">search</span>
          </label>
          <input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <button
        className="button"
        onClick={handleOrientationToggle}
        title={`Cambiar orientación`}
        aria-label="Cambiar orientación"
      >
        {currentOrientation === "grid" ? (
          <span className="material-symbols-outlined">menu</span>
        ) : (
          <span className="material-symbols-outlined">grid_view</span>
        )}
      </button>

      <button
        className="button"
        title="Ajustes"
        aria-label="Ajustes de la aplicación"
        onClick={() => handleRouteChange("/settings")}
      >
        <span className="material-symbols-outlined">settings</span>
      </button>
    </header>
  );
};
