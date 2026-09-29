# Bacchana - « On ouvre la maison »

Film motion design de 56 secondes, 1920 x 1080, 60 i/s, dans la DA de
[bacchana.beloucif.com](https://bacchana.beloucif.com). Tout est du code :
composition HTML/SVG/Canvas pilotée par une horloge déterministe, rendue image
par image dans Chromium, bande-son synthétisée note par note (aucun sample,
aucune musique sous droits).

## Direction artistique (relevée sur le site)

| Rôle | Valeur |
|---|---|
| Crème (fond clair) | `#FFF9F0` |
| Encre pourpre (texte, filets) | `#2A1140` |
| Pourpre Bacchana (fond sombre, CTA) | `#5B2C87` |
| Nuit (appareil) | `#150A20` |
| Aplats jaunes | `#FFD029` `#FFB020` `#FFE07A` `#E8B81C` |
| Orange du logo | `#FF5C00` |
| Noir du logo | `#111111` |

- Titrage : Big Shoulders Display 900, capitales serrées.
- Texte courant : Chivo 400/500/700.
- Étiquettes : Space Mono capitales, approche 0.22em (« ON OUVRE LA MAISON »).
- Néo-brutalisme : aplats francs, filets épais, ombres portées pleines
  décalées (comme les verres du logo), coins 8 px, boutons carrés ou pilules.
- Texture : trame de points (le `bg-grain` du site).
- Ton : le comptoir. La tablée, pousser la porte, une chaise de plus,
  0 pitié, servis sans modération de mauvaise foi.

## Grille temporelle

120 BPM : un temps = 0,5 s, une mesure = 2 s. Chaque coupe, impact et
apparition tombe sur la grille (temps, croches, doubles croches).

## Découpage

| Mesures | Temps | Plan | Ce qui se passe |
|---|---|---|---|
| 1-2 | 0:00 - 0:04 | **L'amorce** | Nuit. Les 5 points du loader s'allument un par un, « ON OUVRE LA MAISON » se tape en Space Mono, l'éclat jaune apparaît et pulse sur la grosse caisse. |
| 3-4 | 0:04 - 0:08 | **Pousser la porte** | L'éclat tourne et traverse l'écran (zoom-through), deux battants de saloon s'ouvrent avec rebond sur la salle pourpre. Les deux verres du logo glissent l'un vers l'autre, prise d'élan à 7,5 s. |
| 5-6 | 0:08 - 0:12 | **Tchin** | Choc des verres pile sur le drop : flash, éclat qui explose, bulles, onde dans la trame, secousse caméra. Le logo se forme, BACCHANA tombe lettre par lettre (squash and stretch), accroche en Chivo. |
| 7-8 | 0:12 - 0:16 | **Typo cinétique** | LES MEILLEURS / JEUX / DE SOIRÉE puis RÉUNIS DANS / UNE SEULE / APP. Le mot APP se fait encadrer par un téléphone qui se dessine au trait. |
| 9-12 | 0:16 - 0:24 | **L'app** | Téléphone néo-brutaliste. La tablée se remplit (Léa, Hugo, Inès, Malik) avec stickers qui claquent autour, tap sur « Pousser la porte », le menu défile, zoom dans la carte Borderland. |
| 13 | 0:24 - 0:26 | **Borderland** | 52 cartes - 4 règles - 0 pitié. Éventail de cartes qui se retournent une à une, compteur 52. Sortie : l'écran entier se retourne comme une carte. |
| 14 | 0:26 - 0:28 | **La roue du destin** | La roue tourne, ralentit, le cliquet claque à chaque case, arrêt sur GAGE. Sortie : le moyeu s'ouvre en iris. |
| 15 | 0:28 - 0:30 | **7 secondes** | Compte à rebours 7 à 1 en croches, sablier qui se vide grain par grain, buzzer. |
| 16 | 0:30 - 0:32 | **Quitte ou double** | Question, bonne réponse, le score double sur chaque croche. Sortie : la ligne de partage de l'écran suivant. |
| 17 | 0:32 - 0:34 | **Tu préfères** | Écran partagé, votes 3 contre 1, tampon PÉNALITÉ sur la minorité. |
| 18 | 0:34 - 0:36 | **Le pilori** | Le marteau tombe sur le temps, tampon COUPABLE sur HUGO, poussière et secousse. |
| 19 | 0:36 - 0:38 | **La criée** | Les enchères montent en bulles (3 ! 5 ! 8 ! 12 !), explosion « TU MENS ! » qui avale l'écran. |
| 20 | 0:38 - 0:40 | **Qui de nous** | Trois flèches pivotent vers MALIK, projecteur, iris qui se ferme. |
| 21 | 0:40 - 0:42 | **Rafale** | Les 7 autres jeux en croches, puis toutes les cartes s'envolent vers leur place. |
| 22 | 0:42 - 0:44 | **15 jeux** | La grille du menu, « 15 JEUX » qui claque, la grille se replie en un seul bouton. Silence d'un quart de temps. |
| 23-24 | 0:44 - 0:48 | **Lance la soirée** | Le doigt appuie, le bouton s'enfonce dans son ombre, explosion de confettis de marque, bandeaux diagonaux qui défilent (ZÉRO PUB, HORS LIGNE, TA TABLE DÉCIDE). Implosion vers le centre. |
| 25-28 | 0:48 - 0:56 | **Signature** | Logo, BACCHANA, accroche, pilule bacchana.beloucif.com, dernier tchin, mentions légales (18+, avec ou sans alcool, modération). |

## Bande-son

House filtrée « French touch » à 120 BPM, synthétisée en Python/NumPy :
grosse caisse, clap, charleys, basse en octaves, accords pompés par
sidechain, arpège pendant le montage des jeux, montées de bruit et impacts.
Le design sonore est calé sur les mêmes repères que l'image (tchin en
synthèse additive, bulles, cliquet de roue, tic-tac, buzzer, marteau,
tampons, pops d'interface, frappe clavier).

## Principes d'animation mis en jeu

Anticipation (prise d'élan des verres), squash and stretch (lettres,
bouton), overshoot et ressorts amortis, décalages en cascade, follow-through,
arcs, raccords de forme (APP devient téléphone, carte devient écran, bulle
devient fond), secousses caméra amorties, flou de mouvement par
sur-échantillonnage temporel à l'obturateur 180 degrés.
