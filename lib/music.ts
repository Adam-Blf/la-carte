// Ambiance sonore de la salle · Le Festin, en boucle à partir de la 20e seconde.
// Singleton module-level pour pouvoir lancer la lecture depuis le geste
// utilisateur (ouverture de la carte) et la piloter depuis le toggle.

const TRACK = "/le-festin.mp3";
const START_AT = 20;
const VOLUME = 0.4;

let audio: HTMLAudioElement | null = null;

function ensure(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(TRACK);
    audio.volume = VOLUME;
    audio.preload = "auto";
    audio.addEventListener("ended", () => {
      if (!audio) return;
      audio.currentTime = START_AT;
      void audio.play().catch(() => {});
    });
  }
  return audio;
}

export function startMusic() {
  const a = ensure();
  const seek = () => {
    if (a.currentTime < START_AT) a.currentTime = START_AT;
  };
  if (a.readyState >= 1) seek();
  else a.addEventListener("loadedmetadata", seek, { once: true });
  void a.play().catch(() => {
    // autoplay refusé · le toggle musique reste disponible
  });
}

export function pauseMusic() {
  audio?.pause();
}

export function resumeMusic() {
  if (audio) void audio.play().catch(() => {});
  else startMusic();
}

export function musicPrefOff(): boolean {
  try {
    return localStorage.getItem("carte-musique") === "off";
  } catch {
    return false;
  }
}

export function setMusicPref(off: boolean) {
  try {
    localStorage.setItem("carte-musique", off ? "off" : "on");
  } catch {
    // stockage privé bloqué · préférence non persistée
  }
}
