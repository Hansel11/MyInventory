import { useState } from "react";

export default function useTheme() {

  // const getDarkMode = () => {
  //   return Boolean(sessionStorage.getItem("theme"));
  // };

  // const [darkMode, setDarkMode] = useState(getDarkMode());

  // const savedarkMode = (theme: boolean) => {
  //   sessionStorage.setItem("darkMode", String(theme));
  //   setDarkMode(theme);
  // };

  // return {
  //   setDarkMode: savedarkMode,
  //   darkMode
  // };

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
