import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import "./login.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login({ email, password });
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error durante el login");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (route: string) => {
    const ocean_top = document.querySelector(".login-ocean-top");
    const ocean_bottom = document.querySelector(".login-ocean-bottom");
    const registerButton = document.querySelector(".login-register-button");
    const returnButton = document.querySelector(".return-button");
    const loginCard = document.querySelector(".login-card");
    if (ocean_top) {
      ocean_top.classList.add("reverse-animation");
      ocean_top.classList.add("hidden");
      setTimeout(() => {
        ocean_top.classList.remove("hidden");
      }, 1);
    }
    if (ocean_bottom) {
      ocean_bottom.classList.add("reverse-animation");
      ocean_bottom.classList.add("hidden");
      setTimeout(() => {
        ocean_bottom.classList.remove("hidden");
      }, 1);
    }
    if (registerButton) {
      registerButton.classList.add("reverse-animation");
      registerButton.classList.add("hidden");
      setTimeout(() => {
        registerButton.classList.remove("hidden");
      }, 1);
    }
    if (returnButton) {
      returnButton.classList.add("reverse-animation");
      returnButton.classList.add("hidden");
      setTimeout(() => {
        returnButton.classList.remove("hidden");
      }, 1);
    }
    if (loginCard) {
      loginCard.classList.add("reverse-animation");
      loginCard.classList.add("hidden");
      setTimeout(() => {
        loginCard.classList.remove("hidden");
      }, 1);
    }

    setTimeout(() => {
      navigate(route);
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="ocean login-ocean-top">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
      <button
        className="button login-register-button"
        onClick={() => handleNavigation("/register")}
      >
        <span className="material-symbols-outlined">person_add</span>{" "}
        Registrarse
      </button>
      <div className="login-card">
        <h1 className="login-title">Iniciar Sesión</h1>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">
              {" "}
              <span className="material-symbols-outlined">mail</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              {" "}
              <span className="material-symbols-outlined">password</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
      <button
        className="button return-button"
        onClick={() => handleNavigation("/library")}
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      <div className="ocean login-ocean-bottom">
        <div className="wave"></div>
        <div className="wave"></div>
      </div>
    </div>
  );
}
