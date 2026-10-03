# Ohypnozen - « Le lever »

Film motion design de 48 s (16:9 et 9:16, 60 i/s) dans la direction
artistique de [ohypnozen.com](https://ohypnozen.com) : crème chaud, encre
prune, bleu, soleil orange du logo, dégradé « coucher de soleil » du site,
Spectral (titres, italique) et Mulish (texte). Tout le texte vient du site.

| Temps | Plan | Ce qui se passe |
|---|---|---|
| 0:00 - 0:08 | Respirer | L'aube prune, un horizon se trace, un cercle respire : « Inspirez. / Expirez. » (4 s + 4 s). |
| 0:08 - 0:16 | Le lever | Le ciel passe au dégradé du site, le soleil du logo sort de l'eau et déploie ses rayons, son reflet frémit. « Aborder avec sérénité votre chemin de vie ». |
| 0:16 - 0:24 | Dénouer | Un fil porte un nœud (trochoïde allongée) qui se défait réellement en onde calme. « Dénouer ce qui pèse, retrouver votre paix intérieure. » |
| 0:24 - 0:32 | L'approche | Aider, accompagner, comprendre, clarifier, apaiser, avec les phrases du site. |
| 0:32 - 0:40 | Les objectifs | Trois galets se posent puis s'alignent : y voir plus clair, retrouver confiance, vous aligner. |
| 0:40 - 0:48 | Signature | Arc-en-ciel pastel, soleil sur l'horizon, OHYPNOZEN, Nawel Beloucif, Paris 11e et téléconsultation, ohypnozen.com, mention de complémentarité médicale. |

Rythme : 60 BPM, une mesure = une respiration (4 s). Pas de secousse, pas de
trame de points, pas de police à chasse fixe ; un grain fixe à 3 % évite les
paliers des dégradés après compression.

Bande-son (`audio/synth.py`) synthétisée en NumPy : nappes en ré majeur,
drone, piano feutré, bols chantants, cordes pincées (Karplus-Strong) pour le
fil qui se dénoue, souffles en bruit filtré.

```bash
cd motion/ohypnozen-film
npm run audio              # out/soundtrack.wav
npm run render             # out/ohypnozen.mp4 (16:9)
npm run render:vertical    # out/ohypnozen-9x16.mp4
```

Polices : Spectral et Mulish (SIL OFL 1.1), telles que servies par le site.
