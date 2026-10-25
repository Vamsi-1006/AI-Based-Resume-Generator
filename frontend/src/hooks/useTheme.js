import { useEffect, useState } from "react";

export const THEMES = ["light", "dark", "corporate", "emerald", "night", "cupcake"];

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("airesume.theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("airesume.theme", theme);
  }, [theme]);
  return [theme, setTheme];
}
