// 120 BPM, swing : un temps = 0,5 s, une mesure = 2 s. 25 mesures, 50 s.
export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;
export const FPS = 60;
export const DURATION = 50;
export const bar = (n) => (n - 1) * BAR;

// Fenêtres d'affichage des scènes (elles se chevauchent pendant les raccords).
export const CUTS = {
  couverture: [0, 6.5],
  carte: [4.9, 18.8],
  carnet: [17.4, 26.2],
  commande: [7, 26.2],
  addition: [25.1, 38.9],
  invite: [37.5, 43.3],
  fin: [41.7, 50],
};

export const MUSIC = [
  { bars: [1, 3], part: 'intro' },
  { bars: [4, 9], part: 'carte' },
  { bars: [10, 13], part: 'carnet' },
  { bars: [14, 19], part: 'addition' },
  { bars: [20, 21], part: 'invite' },
  { bars: [22, 25], part: 'fin' },
];
