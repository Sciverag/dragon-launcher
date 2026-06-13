import { createContext, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [background, setBackground] = useState("");
  const [logo, setLogo] = useState("");
  const [icon, setIcon] = useState("");
  const [cancelAnimation, setCancelAnimation] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        background,
        logo,
        icon,
        cancelAnimation,
        setCancelAnimation,
        setBackground,
        setLogo,
        setIcon,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
