import { useState, useEffect } from "react";
import { LibraryHeader } from "../../components/LibraryHeader";
import "./library.css";

function Library() {
  const [orientation, setOrientation] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const handleOrientationChange = (newOrientation: "grid" | "list") => {
    setOrientation(newOrientation);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    console.log("Buscando:", query);
  };

  const hideRipples = () => {
    const rippleCircles = document.querySelector(".ripple-circles");
    if (rippleCircles) {
      setTimeout(() => {
        rippleCircles.classList.remove("visible");
      }, 1000);
    }
  };

  useEffect(() => {
    hideRipples();
  });

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
          <div className="ripple-circles visible">
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
