# La Carte · Maison A.

<!-- adam-badges:start -->
[![commits](https://img.shields.io/github/commit-activity/t/Adam-Blf/la-carte?color=001329&label=commits&style=flat-square)](https://github.com/Adam-Blf/la-carte/commits)
[![visites](https://hits.sh/github.com/Adam-Blf/la-carte.svg?style=flat-square&label=visites&color=001329)](https://hits.sh/github.com/Adam-Blf/la-carte/)
[![last commit](https://img.shields.io/github/last-commit/Adam-Blf/la-carte?color=D4A437&style=flat-square&label=dernier%20push)](https://github.com/Adam-Blf/la-carte/commits)
[![top language](https://img.shields.io/github/languages/top/Adam-Blf/la-carte?style=flat-square)](https://github.com/Adam-Blf/la-carte)
[![version](https://img.shields.io/badge/version-0.2.0-D4A437?style=flat-square)](package.json)
<!-- adam-badges:end -->

Une invitation à un rendez-vous présentée comme la carte d'un restaurant
gastronomique. L'invitée compose son menu (mise en bouche, plat, dessert,
accords), coche ses disponibilités dans le carnet de réservations, puis
demande l'addition · un ticket de caisse thermique s'imprime à l'écran,
tamponné « Réservation confirmée », total 0,00 € réglé d'avance par la maison.

En production sur [la-carte.beloucif.com](https://la-carte.beloucif.com).

## Features

- [x] Couverture de carte animée (révélation séquencée, double filet, ornements)
- [x] 26 activités réparties en 4 services · Mises en bouche, Plats, Desserts, Accords & suppléments
- [x] Ambiance sonore · Le Festin (Ratatouille) en boucle à partir de la 20e seconde, toggle musique
- [x] Clins d'œil Ratatouille · citation Gusteau, ratatouille du film à la carte, petit chef sur le reçu
- [x] Prix fantaisistes avec points de conduite typographiques
- [x] Sélection interactive multi-services (au moins un plat requis)
- [x] Carnet de réservations · grille 7 jours × 3 services, animations en cascade
- [x] Responsive et adaptatif · grille verticale mobile, prix repliables, barre de commande compacte
- [x] Thèmes Service de jour / Service du soir (papier crème ↔ encre navy), persistés
- [x] Reçu thermique animé · avance papier saccadée, bord déchiré, code-barres CSS, tampon laiton
- [x] Notification email automatique au chef à chaque addition (route API + FormSubmit)
- [x] Envoi WhatsApp du récapitulatif + copie presse-papiers
- [x] Accessibilité · aria-pressed, focus visible, prefers-reduced-motion

## Stack

| Couche | Choix |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 · Tailwind CSS 4 |
| Animations | framer-motion 12 |
| Typographie | Fraunces · EB Garamond · IBM Plex Mono |
| Email | FormSubmit (via route handler, adresse jamais exposée au client) |
| Déploiement cible | Vercel |

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de production
```

Aucune variable d'environnement requise. L'adresse de notification vit dans
`app/api/reservation/route.ts` côté serveur. Au premier envoi, FormSubmit
expédie un email d'activation à cette adresse · cliquer « Activate » une fois.

## Architecture

```
app/
  layout.tsx              fonts, thème, métadonnées
  page.tsx                orchestration · couverture → carte → réservation → addition
  api/reservation/        notification email du chef
components/
  Cover.tsx               couverture de la carte
  Carte.tsx               sections du menu + items sélectionnables
  Reservation.tsx         grille de disponibilités + prénom
  CommandBar.tsx          barre de commande flottante
  Receipt.tsx             ticket thermique animé + envoi
  ThemeToggle.tsx         bascule jour / soir
data/menu.ts              contenu de la carte (activités, prix, services)
lib/version.ts            singleton de version (source · package.json)
```

## Licence

Projet personnel · tous droits réservés.
