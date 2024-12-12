import { useState } from "react";

export default function useTheme() {

  const getTheme = () => {
    return sessionStorage.getItem("theme");
  };

  const [theme, setTheme] = useState(getTheme());

  const savetheme = (theme: string) => {
    sessionStorage.setItem("theme", theme);
    setTheme(theme);
  };

  return {
    setTheme: savetheme,
    theme
  };
}
