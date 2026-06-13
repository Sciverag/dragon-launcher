import { createContext, useState } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [background, setBackground] = useState("");
  const [logo, setLogo] = useState("");
  const [cancelAnimation, setCancelAnimation] = useState(false);

  return (
    <ThemeContext.Provider
      value={{
        background,
        logo,
        cancelAnimation,
        setCancelAnimation,
        setBackground,
        setLogo,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
