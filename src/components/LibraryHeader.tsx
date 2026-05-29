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
  currentOrientation = "grid",
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

  const handleOrientationToggle = () => {
    const newOrientation = currentOrientation === "grid" ? "list" : "grid";
    onOrientationChange?.(newOrientation);
  };

  const handleLoginClick = () => {
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
    if (!isLoggedIn) {
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    }
  };

  return (
    <header className="library-header">
      <button
        className="button"
        title={isLoggedIn ? "Perfil de usuario" : "Iniciar sesión"}
        aria-label="Menú de usuario"
        onClick={handleLoginClick}
      >
        {isLoggedIn ? (
          <img src="" alt="" />
        ) : (
          <span className="material-symbols-outlined">person</span>
        )}
      </button>
      <button
        className="button"
        onClick={() => setSearchOpen(true)}
        title="Buscar"
        aria-label="Búsqueda"
      >
        <span className="material-symbols-outlined">search</span>
      </button>

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
      >
        <span className="material-symbols-outlined">settings</span>
      </button>
    </header>
  );
};
