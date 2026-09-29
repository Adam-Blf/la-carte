# La Carte - « L'addition est réglée »

Film motion design de 50 s (16:9 et 9:16, 60 i/s) dans la direction artistique
de [la-carte.beloucif.com](https://la-carte.beloucif.com). Les couleurs viennent de
`app/globals.css` : papier crème, encre marine, laiton, nuit du thème « soir ».
Les titres sont en Fraunces italique light, le texte en EB Garamond avec des
petites capitales espacées. Les textes sont ceux de l'app (`data/menu.ts`,
`Cover.tsx`, `Receipt.tsx`…). Le film suit le parcours réel d'un invité.

| Temps | Plan | Ce qui se passe |
|---|---|---|
| 0:00 - 0:06 | La couverture | Le double cadre se trace et les étoiles d'angle pivotent. « La Carte » s'écrit avec ses ornements. On touche « Consulter la carte » et la couverture pivote sur sa tranche gauche. |
| 0:06 - 0:18 | La carte | Les services I à IV défilent : chiffre romain, titre, trois plats. On en choisit un par service : la pastille se remplit de laiton et le prix (en moments) s'envole vers la barre de commande. |
| 0:18 - 0:26 | Le carnet | La page défile et la grille 7 jours × 3 services se dresse. On coche cinq créneaux au rythme de la musique et on écrit « Camille ». Le bouton devient « L'addition, s'il vous plaît ». |
| 0:26 - 0:38 | L'addition | La nuit se fait depuis le bouton. L'imprimante thermique sort le ticket par à-coups. Le total défile sur ses rouleaux et se pose sur 0,00 € (sonnette de caisse). Le tampon « Réservation confirmée » tombe, puis le ticket est détaché. |
| 0:38 - 0:42 | La carte est à vous | Une feuille crème monte avec le bord déchiré du ticket. On copie son lien d'invitation. |
| 0:42 - 0:50 | Signature | La couverture se referme. Puis « Composez le rendez-vous idéal. L'addition est déjà réglée. », la-carte.beloucif.com souligné de laiton, et « Table pour deux - service unique ». |

Contraintes de style :

- pas de police à chasse fixe : le ticket est composé en EB Garamond, chiffres alignés ;
- pas de trame de points : les filets de conduite sont des traits fins ;
- pas de halo flou : les touchers sont un anneau net ;
- un grain fixe à 4,5 % rappelle le grain papier du site.

La bande-son (`audio/synth.py`) est originale et synthétisée en NumPy, sans
aucun sample ni emprunt à une musique existante. C'est un petit swing « de
bistrot » à 120 BPM en ré majeur :

- guitare en pompe et contrebasse en cordes pincées (Karplus-Strong) ;
- mélodie au vibraphone, nappe d'accordéon discrète, balais ;
- bruitages calés sur la timeline : papier, touchers, imprimante thermique, rouleaux, sonnette de caisse, tampon, déchirure.

```bash
cd motion/la-carte-film
npm run audio              # out/soundtrack.wav
npm run render             # out/la-carte.mp4 (16:9)
npm run render:vertical    # out/la-carte-9x16.mp4
```

Polices : Fraunces et EB Garamond (SIL OFL 1.1).
