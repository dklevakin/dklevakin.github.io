# klevakin.com

[![Deploy to GitHub Pages](https://github.com/dklevakin/dklevakin.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/dklevakin/dklevakin.github.io/actions/workflows/deploy.yml)
[![Live site](https://img.shields.io/badge/live-klevakin.com-1F2A3D?style=flat)](https://klevakin.com)

> Personal site for **Dmytro Klevakin** — Cloud Solution Architect, DevOps, live-coding music.
> Architect by day, automator by evening, live-coder at night.

Live at **[klevakin.com](https://klevakin.com)** · mirror at [dklevakin.github.io](https://dklevakin.github.io).

---

## What this is

A static site built with **Astro v6** and deployed automatically to GitHub Pages from `main`.

- 7 pages: Home, About, Services, Projects, Writing, Music, Contact (Services + Projects currently hidden from nav, reachable by URL)
- Markdown blog posts via Astro Content Collections (RSS + sitemap auto-generated)
- Two languages: **English** (`/`) and **Ukrainian** (`/uk/`) — full i18n via Astro v6's built-in routing
- **Letterpress Indigo** design system: paper `#F4F1EA`, navy `#1F2A3D`, gold `#C9A961`
- Light + dark theme toggle (preference saved in `localStorage`)
- Self-hosted Fraunces / Manrope / JetBrains Mono — no Google Fonts
- **Music page** with a data-driven embed system (Strudel REPL / YouTube / SoundCloud) — first track: live-coded *Carol of the Bells*

## Tech

| Layer | Choice |
|---|---|
| Framework | [Astro v6](https://astro.build) — `output: 'static'` |
| Language | TypeScript (strict) |
| Content | Astro Content Collections (Zod-validated frontmatter) |
| i18n | Astro v6 built-in routing + JSON dictionaries |
| Fonts | Self-hosted woff2 (Fraunces, Manrope, JetBrains Mono) |
| Hosting | GitHub Pages |
| CI | GitHub Actions (`.github/workflows/deploy.yml`) |
| Domain | `klevakin.com` via `CNAME` |

Zero JavaScript framework, zero CSS framework. Ships ~0 KB of client JS by default.

## Local development

Requires Node ≥ 22.12.0 and npm ≥ 9.

```bash
git clone https://github.com/dklevakin/dklevakin.github.io.git
cd dklevakin.github.io
npm install
npm run dev          # → http://localhost:4321
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Build static site → `dist/` |
| `npm run preview` | Preview the built `dist/` locally |

## Adding a blog post

Drop a Markdown file into `src/content/posts/` named `YYYY-MM-DD-slug.md` with the required frontmatter — see **[docs/guide.md](./docs/guide.md)** for the full schema and a template.

## Documentation

| File | What it covers |
|---|---|
| **[docs/architecture.md](./docs/architecture.md)** | Architecture decisions (ADRs), tech choices, component model, deploy pipeline |
| **[docs/backlog.md](./docs/backlog.md)** | What shipped, what's open, what's iceboxed |
| **[docs/guide.md](./docs/guide.md)** | Developer guide — how to add posts, projects, pages, translations |

## Project structure

```
.
├── public/
│   ├── assets/logos/      ← canonical logos (extracted from design system zip)
│   ├── assets/photo.png   ← portrait used by Home + About
│   ├── favicon.svg etc.   ← favicon set at root of public/
│   └── fonts/             ← self-hosted woff2 variable fonts
├── src/
│   ├── components/        ← BaseLayout, Header, Footer, ProjectCard, PostRow
│   ├── content/posts/     ← Markdown blog posts (Astro Content Collections)
│   ├── i18n/              ← en.json, uk.json + t() / getLang() / altPath() helpers
│   ├── page-content/      ← shared page bodies — one per page, takes `lang` prop
│   ├── pages/             ← English routes (/, /about, /services, ...)
│   ├── pages/uk/          ← Ukrainian routes (/uk, /uk/about, ...)
│   └── styles/global.css  ← :root tokens, dark-mode overrides, blueprint grid (z-index:0 + content z-index:1)
├── astro.config.mjs       ← site, i18n, sitemap integration
└── docs/                  ← architecture, backlog, guide
```

## Deployment

Push to `main` → GitHub Actions builds and deploys automatically (~60 s).

The workflow lives at `.github/workflows/deploy.yml`. Custom domain (`klevakin.com`) is configured via `public/CNAME`.

## License

Source code: MIT. Content (text, images, photo): © Dmytro Klevakin — please don't republish without asking.
