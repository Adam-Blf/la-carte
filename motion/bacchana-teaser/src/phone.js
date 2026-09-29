// Géométrie du téléphone, partagée par la typo (le cadre qui se dessine),
// la démo de l'app et la vignette Borderland (le zoom qui s'enchaîne).
export const PHONE = {
  x: 735, y: 86, w: 450, h: 918, r: 74, // corps
  bezel: 18,
  off: 24, // ombre pleine
};
export const SCREEN = {
  x: PHONE.x + PHONE.bezel,
  y: PHONE.y + PHONE.bezel,
  w: PHONE.w - 2 * PHONE.bezel, // 414
  h: PHONE.h - 2 * PHONE.bezel, // 882
  r: 56,
};
// L'interface est dessinée en « px d'app » (viewport 430 de large, comme les
// captures du site), puis mise à l'échelle dans l'écran.
export const APPW = 430;
export const S = SCREEN.w / APPW;
export const APPH = SCREEN.h / S;

// Carte Borderland dans le hub (px d'app, relatif au haut du contenu du hub).
export const BCARD = { x: 17, y: 329, w: 396, h: 227 };
// Défilement du hub au moment du zoom (px d'app).
export const HUB_SCROLL_AT_ZOOM = 0;
// Rectangle écran de la carte au moment du zoom.
export function bcardStage() {
  return {
    x: SCREEN.x + BCARD.x * S,
    y: SCREEN.y + (BCARD.y - HUB_SCROLL_AT_ZOOM) * S,
    w: BCARD.w * S,
    h: BCARD.h * S,
  };
}
// Zoom final : la carte déborde légèrement du cadre (filets hors champ).
export function bcardZoom() {
  const r = bcardStage();
  const Z = Math.max(1936 / r.w, 1100 / r.h);
  return { Z, cx: r.x + r.w / 2, cy: r.y + r.h / 2, r };
}
