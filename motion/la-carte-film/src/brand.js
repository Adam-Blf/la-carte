// Palette et courbes du site (app/globals.css, composants framer-motion).
import { E, bezier } from './engine.js';

export const L = {
  paper: '#f6f0e2',
  paperDeep: '#efe6d2',
  ink: '#0e1d31',
  inkSoft: '#3c4a5e',
  brass: '#8c6c1d',
  brassBright: '#d4a437',
  line: 'rgba(14,29,49,0.28)',
  receipt: '#fdfaf2',
  receiptInk: '#1a1a18',
  night: '#0a1422',
  nightDeep: '#0e1a2c',
  cream: '#f1e8d4',
  creamSoft: '#b3ac97',
};

E.app = bezier(0.2, 0.8, 0.2, 1); // révélations du site
E.open = bezier(0.65, 0, 0.22, 1); // ouverture de la couverture
