import { createContext, useState, type ReactNode } from "react";

type ThemeContextValue = {
  background: string;
  logo: string;
  icon: string;
  cancelAnimation: boolean;
  setCancelAnimation: (value: boolean) => void;
  setBackground: (value: string) => void;
  setLogo: (value: string) => void;
  setIcon: (value: string) => void;
};

const defaultThemeContextValue: ThemeContextValue = {
  background: "",
  logo: "",
  icon: "",
  cancelAnimation: false,
  setCancelAnimation: () => undefined,
  setBackground: () => undefined,
  setLogo: () => undefined,
  setIcon: () => undefined,
};

export const ThemeContext = createContext<ThemeContextValue>(
  defaultThemeContextValue,
);

export function ThemeProvider({ children }: { children: ReactNode }) {
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
