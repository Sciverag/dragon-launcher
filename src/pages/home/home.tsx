import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  function handlePlayButtonClick() {
    const rippleCircles = document.querySelector(".ripple-circles");
    if (rippleCircles) {
      rippleCircles.classList.add("visible");
      setTimeout(() => {
        rippleCircles.classList.remove("visible");
      }, 1000);
    }
    setTimeout(() => {
      navigate("/library");
    }, 1000);
  }

  return (
    <main className="launcher-shell">
      <section className="launcher-card">
        <div className="launcher-center">
          <button
            type="button"
            className="button play-button"
            onClick={handlePlayButtonClick}
          >
            <span>▶︎</span>
          </button>
          <div className="play-button-riples"></div>
        </div>
      </section>
      <h2 className="start-text">Presiona el botón para empezar</h2>

      <div className="ocean home-ocean">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>

      <div className="ripple-circles">
        <div className="ripple"></div>
        <div className="ripple"></div>
        <div className="ripple"></div>
        <div className="ripple"></div>
      </div>
    </main>
  );
}

export default Home;
