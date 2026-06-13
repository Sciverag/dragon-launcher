import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./userContext.tsx";
import GameBackground from "./layouts/gameBackground.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0"
    />
    <BrowserRouter>
      <ThemeProvider>
        <GameBackground />
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
