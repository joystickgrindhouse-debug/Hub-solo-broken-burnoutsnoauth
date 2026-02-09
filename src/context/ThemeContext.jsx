import React, { createContext, useContext } from "react";

const THEMES = {
  "red-black": {
    accent: "#ff3050",
    text: "#fff",
    bg: "#000000",
    cardBg: "rgba(0, 0, 0, 0.6)",
    border: "#ff3050",
    shadow: "rgba(255, 48, 80, 0.8)",
    shadowMd: "rgba(255, 48, 80, 0.5)",
    shadowSm: "rgba(255, 48, 80, 0.3)",
    shadowXs: "rgba(255, 48, 80, 0.1)",
    shadowXxs: "rgba(255, 48, 80, 0.05)",
    hoverBg: "rgba(255, 50, 80, 0.1)",
    dot: "#ff003c",
    dotShadow: "rgba(255,0,60,0.9)",
    tileBorder: "rgba(255,0,60,0.25)",
    muted: "rgba(255,255,255,0.6)",
    mutedMore: "rgba(255,255,255,0.4)",
    imgFilter: "none",
  },
  "white-black": {
    accent: "#ffffff",
    text: "#fff",
    bg: "#000000",
    cardBg: "rgba(20, 20, 20, 0.8)",
    border: "#ffffff",
    shadow: "rgba(255, 255, 255, 0.8)",
    shadowMd: "rgba(255, 255, 255, 0.5)",
    shadowSm: "rgba(255, 255, 255, 0.3)",
    shadowXs: "rgba(255, 255, 255, 0.1)",
    shadowXxs: "rgba(255, 255, 255, 0.05)",
    hoverBg: "rgba(255, 255, 255, 0.1)",
    dot: "#ffffff",
    dotShadow: "rgba(255,255,255,0.9)",
    tileBorder: "rgba(255,255,255,0.25)",
    muted: "rgba(255,255,255,0.6)",
    mutedMore: "rgba(255,255,255,0.4)",
    imgFilter: "none",
  },
};

const ThemeContext = createContext(THEMES["red-black"]);

export function ThemeProvider({ theme, children }) {
  const colors = THEMES[theme] || THEMES["red-black"];
  return (
    <ThemeContext.Provider value={colors}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
