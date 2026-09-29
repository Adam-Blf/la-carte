// Format de sortie : 16:9 (défaut) ou 9:16 vertical (?v dans l'URL, VERT=1
// côté Node). Les timings sont identiques dans les deux formats : une seule
// bande-son pour les deux.
const q = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
export const VERT = q ? q.has('v') : typeof process !== 'undefined' && process.env.VERT === '1';
export const W = VERT ? 1080 : 1920;
export const H = VERT ? 1920 : 1080;
export const CX = W / 2;
export const CY = H / 2;
// Valeur selon le format : pick(horizontal, vertical).
export const pick = (h, v) => (VERT ? v : h);
