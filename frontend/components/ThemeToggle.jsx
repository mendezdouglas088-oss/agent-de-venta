"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { RailIcon } from "./ui-primitives";

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    setTheme(localStorage.getItem("theme") === "dark" ? "dark" : "light");
  }, []);

  function applyTheme(next) {
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <RailIcon
      icon={theme === "light" ? Moon : Sun}
      onClick={() => applyTheme(theme === "light" ? "dark" : "light")}
      label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    />
  );
}
