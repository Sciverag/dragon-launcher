import { useNavigate, useParams } from "react-router-dom";
import "./playing.css";
import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../userContext";
import { useLibraryStore } from "../../stores/libraryStore";

export default function Playing() {
  const { icon, logo } = useContext(ThemeContext);
  const { gameId, gameName } = useParams();
  const orientation = useLibraryStore((state) => state.orientation);
  const naviagte = useNavigate();
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [iconHasError, setIconHasError] = useState<boolean>(false);
  const [logoHasError, setLogoHasError] = useState<boolean>(false);

  const handleNavigation = () => {
    const playing_container = document.querySelector(".playing-container");
    if (playing_container) {
      playing_container.classList.add("reverse-animation");
      playing_container.classList.add("hidden");
      setTimeout(() => {
        playing_container.classList.remove("hidden");
      }, 1);
    }
    const icon_playing = document.querySelector(".icon-playing");
    if (icon_playing) {
      icon_playing.classList.add("reverse-animation");
    }
    const icon_riples = document.querySelector(".icon-riples");
    if (icon_riples) {
      icon_riples.classList.add("reverse-animation");
    }
    const return_container = document.querySelector(".return-container");
    if (return_container) {
      return_container.classList.add("reverse-animation");
    }

    setTimeout(() => {
      naviagte("/library", { state: { fromPlaying: true, gameId: gameId } });
    }, 1000);
  };

  useEffect(() => {
    if (!hasInitialized) {
      window.location.href = `steam://launch/${gameId}/dialog`;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasInitialized(true);
      console.log(icon);
    }
  }, [hasInitialized, gameId]);
  return (
    <main className="playing-container">
      {icon && !iconHasError && (
        <>
          <img
            src={icon}
            className={`icon-playing ${orientation}`}
            onError={() => setIconHasError(true)}
          ></img>
          <div className="icon-riples"></div>
        </>
      )}

      <section className="return-container">
        <h1 className="playingnow-text">
          {logo && !logoHasError ? (
            <img
              src={logo}
              className="logo-playing"
              onError={() => {
                setLogoHasError(true);
              }}
            ></img>
          ) : (
            <>{gameName}</>
          )}{" "}
          se esta ejecutando.
        </h1>
        <button onClick={handleNavigation} className="returnTo-button button">
          Volver a la libreria
        </button>
      </section>
    </main>
  );
}
