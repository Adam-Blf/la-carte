# Bacchana - « On ouvre la maison »

Film motion design de 56 s (1920 x 1080, 60 i/s) dans la direction
artistique de [bacchana.beloucif.com](https://bacchana.beloucif.com).
Image et son sont entièrement générés par du code : aucune vidéo, aucun
sample, aucune musique sous droits. Découpage plan par plan dans
[STORYBOARD.md](STORYBOARD.md).

## Comment c'est fait

- **Composition** : HTML, SVG et Canvas 2D dans une scène de 1920 x 1080.
  Chaque plan (`src/scenes/*.js`) construit son DOM une fois puis expose
  `update(t)`. Tout est fonction du temps, sans état accumulé : n'importe
  quelle image se calcule dans n'importe quel ordre.
- **Moteur** (`src/engine.js`) : easings, courbes de Bézier, ressorts amortis
  analytiques (et leur dérivée, pour le squash and stretch piloté par la
  vitesse), pistes de keyframes, bruit lissé pour les secousses caméra.
- **Particules** (`Burst`) à solution analytique (gravité + traînée) :
  reproductibles image par image.
- **Raccords** : volet diagonal, remplissage liquide, rouleau mot à mot,
  cadre de téléphone tracé au trait, zoom dans une carte du hub raccordé
  pixel pour pixel avec le plan suivant, retournement plein cadre, iris,
  persiennes, panoramique filé, bulle qui avale l'écran.
- **Rendu** (`tools/render.mjs`) : 4 Chromium en parallèle, capture PNG de
  chaque instant, flou de mouvement par sur-échantillonnage temporel
  (6 sous-images par image, obturateur à 180 degrés, moyenne dans l'espace
  RGB), encodage H.264 BT.709.
- **Son** (`audio/synth.py`) : house filtrée à 120 BPM synthétisée en
  NumPy (grosse caisse, clap, charleys, basse en octaves, accords pompés par
  sidechain, arpège avec écho pointé, montées), plus un design sonore calé
  sur les repères exportés depuis la même timeline que l'image
  (`tools/export-cues.mjs`) : tchin en synthèse additive, cliquet de la roue
  calculé sur la courbe de rotation, tic-tac, buzzer, marteau, tampons...

## Lancer

Prérequis : Node 18+, Playwright (+ Chromium), Python 3 avec
`numpy scipy numba imageio-ffmpeg`.

```bash
cd motion/bacchana-teaser
npm run preview          # lecteur temps réel : http://127.0.0.1:8080
npm run audio            # out/soundtrack.wav
npm run render           # out/bacchana.mp4 (options : --sub, --workers, --from, --to)
node tools/snap.mjs --sheet 8 12.5 24   # planche contact d'instants précis
```

Les polices (Big Shoulders Display, Chivo, Space Mono, licence SIL OFL 1.1)
sont celles servies par le site Bacchana.
