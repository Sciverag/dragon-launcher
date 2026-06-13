import { useContext } from "react";
import { ThemeContext } from "../userContext";

export default function GameBackground() {
  const { background, cancelAnimation } = useContext(ThemeContext);

  return (
    <div
      className={`game-background ${background === "" ? "hidden" : ""} ${cancelAnimation ? "cancel-animation" : ""}`}
      style={{
        backgroundImage: `url(${background})`,
      }}
    ></div>
  );
}
