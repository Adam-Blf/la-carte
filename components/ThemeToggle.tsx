"use client";

import { useEffect, useState } from "react";

type Theme = "jour" | "soir";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("jour");

  // Le script d'init du layout a déjà posé le thème (choix manuel ou heure du service)
  useEffect(() => {
    if (document.documentElement.dataset.theme === "soir") setTheme("soir");
  }, []);

  function toggle() {
    const next: Theme = theme === "jour" ? "soir" : "jour";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("carte-theme", next);
    } catch {
      // stockage privé bloqué · le thème vivra le temps de la page
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "jour" ? "Passer en service du soir" : "Passer en service de jour"
      }
      className="smallcaps fixed top-5 right-5 z-[60] min-h-11 cursor-pointer border border-line bg-paper/80 px-4 py-2 text-xs text-ink-soft backdrop-blur transition-colors duration-300 hover:border-brass hover:text-ink"
    >
      {theme === "jour" ? "Service du soir" : "Service de jour"}
    </button>
  );
}
