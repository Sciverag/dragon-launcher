import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LibraryHeader } from "../../components/LibraryHeader";
import "./library.css";
import LibraryGames from "../../components/LibraryGames";
import { useLibraryStore } from "../../stores/libraryStore";
import { useAuthStore } from "../../stores/authStore";
import {
  getSteamLibrary,
  getSteamLocalLibrary,
  mergeLibraries,
} from "../../services/libraryService";

function Library() {
  const location = useLocation();
  const orientation = useLibraryStore((state) => state.orientation);
  const setOrientation = useLibraryStore((state) => state.setOrientation);
  const games = useLibraryStore((state) => state.games);
  const hasLoadedGames = useLibraryStore((state) => state.hasLoadedGames);
  const setGames = useLibraryStore((state) => state.setGames);
  const user = useAuthStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const fromPlaying =
    (location.state as { fromPlaying?: boolean })?.fromPlaying ?? false;
  const shouldReloadLibrary = !hasLoadedGames || fromPlaying;
  const [loading, setLoading] = useState<boolean>(shouldReloadLibrary);
  const [showRipples, setShowRipples] = useState(
    (location.state as { fromHome?: boolean })?.fromHome ?? false,
  );

  const handleOrientationChange = (newOrientation: "grid" | "list") => {
    setOrientation(newOrientation);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    if (showRipples) {
      setTimeout(() => {
        setShowRipples(false);
      }, 1000);
    }
  }, [showRipples]);

  useEffect(() => {
    if (!shouldReloadLibrary) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const loadGames = async () => {
      const localGames = await getSteamLocalLibrary();

      if (cancelled) {
        setLoading(false);
        return;
      }

      if (!user?.steamId) {
        setGames(localGames);
        setLoading(false);
        return;
      }

      try {
        const remoteGames = await getSteamLibrary();

        if (cancelled) {
          setLoading(false);
          return;
        }

        const mergedGames = await mergeLibraries(localGames, remoteGames);
        setGames(mergedGames);
      } catch {
        setGames(localGames);
      } finally {
        setLoading(false);
      }
    };

    loadGames();

    return () => {
      cancelled = true;
      setLoading(false);
    };
  }, [setGames, shouldReloadLibrary, user?.steamId]);

  return (
    <div className="library-container">
      <LibraryHeader
        onOrientationChange={handleOrientationChange}
        onSearch={handleSearch}
        currentOrientation={orientation}
      />
      <main className="library-shell">
        <div className={`library-content ${orientation}`}>
          {!loading && games.length !== 0 && (
            <LibraryGames
              libraryOrientation={orientation}
              searchQuery={searchQuery}
              games={games}
            />
          )}

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
