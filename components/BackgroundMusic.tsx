"use client";

import { useEffect, useRef, useState } from "react";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const tryPlay = () => {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    };

    // Try to autoplay; browsers may block it until user interaction
    tryPlay();

    const onInteraction = () => {
      if (!playing) tryPlay();
    };

    document.addEventListener("click", onInteraction, { once: true });
    document.addEventListener("keydown", onInteraction, { once: true });

    return () => {
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("keydown", onInteraction);
    };
  }, [playing]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setPlaying(true)).catch(() => {});
    } else {
      audio.pause();
      setPlaying(false);
    }
  };

  return (
    <>
      <audio ref={audioRef} src="/le-festin.mp3" loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "Couper la musique" : "Lancer la musique"}
        title={playing ? "Couper la musique" : "Lancer la musique"}
        className="fixed bottom-4 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-current opacity-40 transition-opacity hover:opacity-80"
        style={{ fontSize: "1rem" }}
      >
        {playing ? "♪" : "♩"}
      </button>
    </>
  );
}
