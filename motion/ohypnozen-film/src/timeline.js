// 60 BPM : un temps = 1 s, une mesure = 4 s (une respiration : 2 s
// d'inspiration, 2 s d'expiration). 12 mesures, 48 s.
export const BPM = 60;
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;
export const FPS = 60;
export const DURATION = 48;
export const bar = (n) => (n - 1) * BAR;

export const CUTS = {
  souffle: [0, 8],
  lever: [8, 16],
  denouer: [16, 24],
  approche: [24, 32],
  galets: [32, 40],
  signature: [40, 48],
};

export const MUSIC = [
  { bars: [1, 2], part: 'aube' },
  { bars: [3, 4], part: 'lever' },
  { bars: [5, 10], part: 'corps' },
  { bars: [11, 12], part: 'fin' },
];
