import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LibraryHeader } from "../../components/LibraryHeader";
import "./library.css";
import LibraryGames from "../../components/LibraryGames";
import { useLibraryStore } from "../../stores/libraryStore";
import type { game } from "../../types/game";
import {
  getSteamLibrary,
  getSteamLocalLibrary,
} from "../../services/libraryService";
import { getGameAssets } from "../../services/gameService";

function Library() {
  const location = useLocation();
  const orientation = useLibraryStore((state) => state.orientation);
  const setOrientation = useLibraryStore((state) => state.setOrientation);
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<game[]>([]);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [showRipples, setShowRipples] = useState(
    (location.state as { fromHome?: boolean })?.fromHome ?? false,
  );

  const handleOrientationChange = (newOrientation: "grid" | "list") => {
    setOrientation(newOrientation);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getLocalGames = async () => {
    const localGames: game[] = await getSteamLocalLibrary();
    setGames(localGames.sort((a, b) => b.last_played - a.last_played));
  };

  const getGameLibrary = async () => {
    const gameLibrary: game[] = await getSteamLibrary();
    setGames(gameLibrary);
  };

  useEffect(() => {
    if (showRipples) {
      setTimeout(() => {
        setShowRipples(false);
      }, 1000);
    }
  }, [showRipples]);

  useEffect(() => {
    if (!hasInitialized) {
      getLocalGames();
      setHasInitialized(true);
    }
  }, []);

  return (
    <div className="library-container">
      <LibraryHeader
        onOrientationChange={handleOrientationChange}
        onSearch={handleSearch}
        currentOrientation={orientation}
      />
      <main className="library-shell">
        <div className={`library-content ${orientation}`}>
          <LibraryGames
            libraryOrientation={orientation}
            searchQuery={searchQuery}
            games={games}
          />
          <div className={`ripple-circles ${showRipples ? "visible" : ""}`}>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
          </div>
        </div>
      </main>
      <div className="ocean library-ocean">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
}

export default Library;
