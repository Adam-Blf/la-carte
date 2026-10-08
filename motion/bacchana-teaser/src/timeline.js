// Grille temporelle partagée par l'image et le son.
export const BPM = 120;
export const BEAT = 60 / BPM; // 0,5 s
export const BAR = 4 * BEAT; // 2 s
export const FPS = 60;
export const DURATION = 56;
export const bar = (n) => (n - 1) * BAR; // début de la mesure n (1 = 0 s)

// Découpage (secondes). pre/post : fenêtre active hors plan pour les raccords.
export const CUTS = {
  amorce: [0, 4],
  tchin: [4, 12],
  typo: [12, 16],
  app: [16, 24],
  borderland: [24, 26],
  roue: [26, 28],
  sept: [28, 30],
  quitte: [30, 32],
  prefere: [32, 34],
  pilori: [34, 36],
  criee: [36, 38],
  quidenous: [38, 40],
  rafale: [40, 42],
  grille: [42, 44],
  soiree: [44, 48],
  fin: [48, 56],
};

// Arrangement musical par mesure (lu par audio/synth.py via cues.json).
export const MUSIC = [
  { bars: [1, 2], part: 'intro' },
  { bars: [3, 4], part: 'build' },
  { bars: [5, 12], part: 'grooveA' },
  { bars: [13, 20], part: 'grooveB' },
  { bars: [21, 21], part: 'rafale' },
  { bars: [22, 22], part: 'break' },
  { bars: [23, 24], part: 'climax' },
  { bars: [25, 28], part: 'outro' },
];
