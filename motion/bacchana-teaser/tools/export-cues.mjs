// Exporte les repères sonores de la timeline (même code que l'image) vers
// out/cues.json, lu par audio/synth.py.
import fs from 'node:fs';
import path from 'node:path';
import { collectCues } from '../src/film.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
fs.mkdirSync(path.join(root, 'out'), { recursive: true });
const cues = collectCues();
fs.writeFileSync(path.join(root, 'out', 'cues.json'), JSON.stringify(cues, null, 1));
const ids = {};
cues.sfx.forEach((c) => (ids[c.id] = (ids[c.id] || 0) + 1));
console.log(`${cues.sfx.length} évènements`, ids);
