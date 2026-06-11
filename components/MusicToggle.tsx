"use client";

import { useEffect, useState } from "react";
import { musicPrefOff, pauseMusic, resumeMusic, setMusicPref } from "@/lib/music";

export default function MusicToggle() {
  const [off, setOff] = useState(false);

  useEffect(() => {
    setOff(musicPrefOff());
  }, []);

  function toggle() {
    const next = !off;
    setOff(next);
    setMusicPref(next);
    if (next) pauseMusic();
    else resumeMusic();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={off ? "Remettre la musique" : "Couper la musique"}
      aria-pressed={!off}
      className="smallcaps fixed top-5 left-5 z-[60] cursor-pointer border border-line bg-paper/80 px-4 py-2 text-xs text-ink-soft backdrop-blur transition-colors duration-300 hover:border-brass hover:text-ink"
    >
      <span aria-hidden>♪</span> {off ? "musique coupée" : "musique"}
    </button>
  );
}
