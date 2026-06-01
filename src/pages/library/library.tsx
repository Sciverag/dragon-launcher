import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LibraryHeader } from "../../components/LibraryHeader";
import "./library.css";

function Library() {
  const location = useLocation();
  const [orientation, setOrientation] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRipples, setShowRipples] = useState(
    (location.state as { fromHome?: boolean })?.fromHome ?? false,
  );

  const handleOrientationChange = (newOrientation: "grid" | "list") => {
    setOrientation(newOrientation);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    console.log("Buscando:", query);
  };

  useEffect(() => {
    if (showRipples) {
      setTimeout(() => {
        setShowRipples(false);
      }, 1000);
    }
  }, [showRipples]);

  return (
    <div className="library-container">
      <LibraryHeader
        onOrientationChange={handleOrientationChange}
        onSearch={handleSearch}
        currentOrientation={orientation}
      />
      <main className="library-shell">
        <div className={`library-content ${orientation}`}>
          {searchQuery && (
            <div className="search-info">
              Buscando: <strong>{searchQuery}</strong>
            </div>
          )}
          <div className={`ripple-circles ${showRipples ? "visible" : ""}`}>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
            <div className="ripple reverse-animation"></div>
          </div>
        </div>
        <div className="ocean library-ocean">
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
      </main>
    </div>
  );
}

export default Library;
