# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [Unreleased]

## [0.5.0] - 2026-10-09

### Changed

- Buttons say what the visitor gets: "Composer ma soirée", "Trouver ma phrase d'accroche", "Obtenir mon lien d'invitation", "Recevoir mes accroches", "Réserver sur WhatsApp". Table in `docs/boutons.md`.
- Contrast: light brass darkened (4.3:1 to 5.2:1 for text on paper), button borders at 3:1 or more (new `edge` token), readable hover on the order bar.
- chore(env): rename `SUPABASE_URL` to `LACARTE_SUPABASE_URL` so every key is unique across projects, and load the central secrets file `~/.secrets/projets.env` (or `CENTRAL_ENV_FILE`) from `next.config.ts` in local dev. Adds `.env.example`.

## [0.4.0] - 2026-10-07

First tagged release. Latest changes:

- docs: add colors to mermaid diagrams (#6)
- chore: licence MIT (#4)
- feat: musique de fond, PWA, générateur d'accroches IA, logo
- docs: typography pass, no em dash or middle dot (#2)
- docs: add mermaid architecture diagram to README (#1)
- fix(mail): browser-like headers for FormSubmit behind WAF
- feat(host): shareable invitation links with per-host WhatsApp delivery
- fix(ux): always-clickable bill button with guidance, session-only music pref, log mail failures
- chore: ignore local one-shot credential scripts
- chore: ignore .vercel directory
- feat(meta): monogram favicon and Open Graph image
- feat(cover): 3D menu-opening rotation on entry
- feat(ux): AA contrast, escape key, auto day-night theme and itemized totals
- feat(brand): add Ratatouille touches and la-carte.beloucif.com metadata
- feat(responsive): vertical reservation grid and compact mobile layout
