# Architecture — klevakin.com

> Architecture decisions and system design for the Astro v6 personal site.
> Last updated: 2026-05-08 (v2.1 polish — Music tracks system, dark-mode legibility sweep, blueprint-grid spec alignment).

---

## Overview

```
┌─────────────────────────────────────────────────┐
│  Developer (local)                              │
│  npm run dev  →  http://localhost:4321          │
└───────────────────┬─────────────────────────────┘
                    │  git push → main
                    ▼
┌─────────────────────────────────────────────────┐
│  GitHub — dklevakin/dklevakin.github.io         │
│  GitHub Actions: build Astro → dist/            │
│  actions/deploy-pages → gh-pages                │
└───────────────────┬─────────────────────────────┘
                    │  serves static files
                    ▼
┌─────────────────────────────────────────────────┐
│  GitHub Pages (CDN)                             │
│  https://dklevakin.github.io                    │
│  https://klevakin.com  (CNAME)                  │
└─────────────────────────────────────────────────┘
```

---

## ADR-01 — Framework: Astro v6

**Status:** Accepted (upgraded from v5 → v6 during initial rollout).

**Decision:** Use Astro v6 with `output: 'static'` (full static site generation).

**Rationale:**
- Zero JavaScript shipped to browser by default (no hydration overhead).
- File-based routing replaces hash routing — enables real URLs for SEO.
- Content Collections API provides typed, validated Markdown blog posts.
- Excellent GitHub Pages compatibility (static output = folder of HTML/CSS/JS).
- `.astro` component syntax is essentially HTML with slots and frontmatter — minimal learning curve.
- No framework lock-in for CSS (plain CSS preserved 1:1 from original design).
- Built-in i18n routing in v4+ (no extra library).

**Rejected alternatives:** Jekyll (Ruby + Liquid feels dated), Hugo (Go templates alien to JS workflow), Next.js (overkill, ships React runtime), Eleventy (smaller ecosystem vs Astro).

---

## ADR-02 — Language: TypeScript strict

**Status:** Accepted.

**Decision:** TypeScript in strict mode throughout.

**Rationale:**
- Astro Content Collections require TypeScript for Zod schema type inference.
- Type-safe frontmatter prevents silent content errors (e.g. missing date).
- `strict: true` in `tsconfig.json` catches common mistakes at author time.
- Astro generates `.d.ts` types for content collections automatically.

---

## ADR-03 — Routing strategy

**Status:** Accepted.

**Decision:** File-based routing with Astro pages; dynamic `[slug].astro` for posts.

| Page | English route | Ukrainian route |
|------|---------------|-----------------|
| Home | `/` | `/uk` |
| About | `/about` | `/uk/about` |
| Services | `/services` | `/uk/services` |
| Projects | `/projects` | `/uk/projects` |
| Writing index | `/writing` | `/uk/writing` |
| Blog post | `/writing/<slug>` | _(EN-only this round)_ |
| Music | `/music` | `/uk/music` |
| Contact | `/contact` | `/uk/contact` |
| 404 | `/404` | `/uk/404` |
| RSS | `/rss.xml` | _(EN-only)_ |

Real URLs throughout — no hash routing.

---

## ADR-04 — CSS strategy

**Status:** Accepted.

**Decision:** Plain CSS with custom properties; design tokens in a single global file; component styles in scoped `<style>` blocks within each `.astro` file.

```
src/styles/global.css     ← :root design tokens, dark mode overrides, reset, base typography, blueprint grid
src/components/*.astro    ← <style> block per component (Astro scopes these)
src/pages/*.astro         ← <style> block for page-specific layout
src/page-content/*.astro  ← <style> block for shared page bodies
```

**Key features:**
- Light + dark mode via `html[data-theme="dark"]` attribute (toggle handled in `Header.astro` script).
- **Blueprint grid overlay**: `body::before` with `--blueprint` colour creates a subtle architecture-paper grid.
- Hairline borders (`1px solid var(--line)`) are the primary visual separator — shadows are rare.
- Hover: cards lift `translateY(-2px)`, buttons lift `translateY(-1px)`, transitions ~150 ms.

**Rationale:**
- The Letterpress Indigo design has a clean, battle-tested CSS — no Tailwind/Bootstrap noise.
- Astro scopes `<style>` blocks per component automatically.
- Design tokens in `:root` are globally available to all scoped styles.

---

## ADR-05 — Content Collections for blog posts

**Status:** Accepted.

**Decision:** Use Astro Content Collections (Zod schema, `getCollection`, `render`).

Schema in `src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/posts' }),
  schema: z.object({
    title:       z.string(),
    date:        z.coerce.date(),
    description: z.string(),
    category:    z.enum(['Cloud & DevOps', 'AI & vibe coding', 'Automation', 'Career']),
    draft:       z.boolean().default(false),
  }),
});

export const collections = { posts };
```

Filename convention: `YYYY-MM-DD-slug.md`.

---

## ADR-06 — Font hosting strategy

**Status:** Accepted.

**Decision:** Self-host all fonts as woff2 variable fonts from `public/fonts/`. No Google Fonts CDN.

```
public/fonts/
├── Fraunces-VariableFont.woff2
├── Fraunces-Italic-VariableFont.woff2
├── Manrope-VariableFont.woff2
├── JetBrainsMono-VariableFont.woff2
└── JetBrainsMono-Italic-VariableFont.woff2
```

`@font-face` declarations in `global.css` with `font-display: swap`.

**Rationale:** privacy/GDPR-friendly, no DNS lookup latency, no FOUT-then-FOIT, variable fonts reduce face-declaration count.

---

## ADR-07 — Deployment: GitHub Actions + GitHub Pages

**Status:** Accepted.

**Decision:** GitHub Actions workflow on push to `main` → `actions/deploy-pages`.

**Workflow steps** (`.github/workflows/deploy.yml`):
1. `actions/checkout@v4` — get source.
2. `actions/setup-node@v4` (Node 22 LTS) — install deps.
3. `npm ci && npm run build` — produce `dist/`.
4. `actions/upload-pages-artifact@v3` — stage artifact.
5. `actions/deploy-pages@v4` — publish to GitHub Pages environment.

**Custom domain:** `CNAME` file in `public/` contains `klevakin.com`. GitHub Pages reads this and sets the custom domain automatically.

---

## ADR-08 — Theme strategy (light / dark)

**Status:** Accepted (added during prototype v3 rollout).

**Decision:** Dark mode via the `data-theme` attribute on `<html>`. Preference saved in `localStorage["klv_theme"]`. An inline `<script is:inline>` runs in the `<head>` *before paint* to set the attribute, preventing FOUC.

```html
<script is:inline>
  (function () {
    try {
      var saved = localStorage.getItem('klv_theme');
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch (e) {}
  })();
</script>
```

The toggle button in `Header.astro` swaps the attribute and persists to `localStorage`. Default behaviour: respect `prefers-color-scheme`.

---

## ADR-09 — Design system source of truth

**Status:** Accepted.

**Decision:** The canonical source for tokens, type scale, brand marks and component patterns is the **Klevakin Design System handoff** (`D:\CLAUDE\Artifacts\Klevakin Design System-handoff.zip`).

- Primary spec: `Klevakin Site Prototype v2.html` (single-file HTML — pixel-precise reference).
- Token file: `colors_and_type.css` (mirrored into `src/styles/global.css`).
- Logo files: extracted to `public/assets/logos/` — `logo-mark-{dark,light,transparent}.svg`, `logo-mark-{dark,light}-{512,2048}.png`, `logo-horizontal-{dark,light,transparent}.png`. Favicon set lives at `public/` root: `favicon.svg`, `favicon-{16,32}.png`, `apple-touch-icon.png`, `site.webmanifest`.
- Brand voice: `BRAND_AUDIT.md` and `DK Brand Book.html`.

Header logo, footer logo and favicon all reference the extracted SVG files directly — no hand-coded SVG copies. The `-dark` / `-light` suffixes refer to the **badge background colour** (dark = navy badge, light = cream badge), not the theme they're meant for. The `-transparent` variant has no badge — just the mark.

**Current bindings:**

- Header light mode → `logo-mark-transparent.svg` (navy mark sits directly on cream paper)
- Header dark mode → `logo-mark-dark.svg` (navy badge blends into the dark surface, leaves only the cream marks visible)
- Footer (always navy bg) → `logo-mark-dark.svg` (badge bg `#1F2A3D` matches `--navy` exactly so only the marks show)
- OG image fallback → `logo-mark-dark-2048.png` (square — see backlog OG-01 for the dedicated 1200×630 follow-up)

---

## ADR-10 — Internationalisation

**Status:** Accepted.

**Decision:** Astro v6's built-in i18n with two locales — English (default, served at `/`) and Ukrainian (served at `/uk/`).

```js
// astro.config.mjs
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'uk'],
  routing: { prefixDefaultLocale: false },
}
```

**Translation strategy:**
- Strings live in JSON dictionaries: `src/i18n/en.json`, `src/i18n/uk.json`.
- Tiny helper `src/i18n/index.ts` exports `t(lang, 'namespace.key')`, `getLang(url)`, and `altPath(path, targetLang)`.
- **Page bodies are factored into shared components** under `src/page-content/` — each takes `lang: 'en' | 'uk'` as an explicit prop.
- Route files in `src/pages/X.astro` and `src/pages/uk/X.astro` are one-line shells that render the page-content component with the right `lang`.

**Header EN/UA toggle** is a real `<a>` that navigates to the alt-language URL via `altPath()`.

**SEO:** `BaseLayout.astro` emits `<html lang>` per page plus `<link rel="alternate" hreflang>` for both languages and `x-default`. Sitemap integration explicitly configured with `i18n: { defaultLocale, locales: { en: 'en-US', uk: 'uk-UA' } }` so the generated `sitemap-index.xml` includes hreflang annotations.

**Out of scope (this round):** translating Markdown blog posts. Posts stay English-only; the Ukrainian `/uk/writing` index shows the same posts with a notice. Tracked as **I18N-02** in the backlog.

---

## ADR-11 — Music page: data-driven embed system

**Status:** Accepted (added 2026-05-08).

**Decision:** Music page renders from a `tracks: Track[]` array in `Music.astro`'s frontmatter. Each track has `kind: 'strudel' | 'youtube' | 'soundcloud'`, `title`, optional `captionKey`, and `url`. A `kindMeta` map holds per-kind iframe metadata (label, `min-height`, `allow` permissions, `aspect-ratio`, `allowFullscreen`). The body maps over `tracks` and emits one `<iframe>` per item with the right attributes.

**Rationale:**

- Adding a new track is one line — append to the array. No layout, no new components, no new CSS.
- Per-kind defaults stay in one place (`kindMeta`), so iframe attribute drift is impossible.
- Avoids `@strudel/repl` (4.7 MB AGPL-3.0-or-later npm package). Iframe to `strudel.cc` is **loose coupling** under AGPL — Strudel runs in its own browser context, no linking, no licence propagation. Confirmed by reading `@strudel/embed` source: it builds `https://strudel.cc/#${encodeURIComponent(btoa(code))}` and stuffs it in an iframe — nothing more, no documented read-only/embed mode.
- Strudel patches are encoded in the URL hash, so refresh always restores the original (no localStorage merge for hash-loaded sessions).
- Track titles aren't i18n'd (proper nouns); captions are i18n'd via `captionKey` so descriptive prose still translates.

**To extend later:** add a fourth `kind` (e.g. `vimeo`, `bandcamp`), add an entry to `kindMeta`, drop a track in the array. If a fourth kind is added, consider extracting an `<EmbedFrame>` component (currently inline — premature abstraction at one kind in active use).

---

## ADR-12 — Dark-mode legibility on always-dark surfaces

**Status:** Accepted (added 2026-05-08, refined during the legibility sweep).

**Context:** The design system flips `--paper`, `--navy`, and `--ink` between modes. That's correct for theme-following surfaces (page bg) — but it silently breaks any element where the background is "always dark" regardless of mode.

The most common offender: `background: var(--navy); color: var(--paper);`. In light mode this is cream-on-navy (legible). In dark mode `--navy` becomes `#0A0E14` _and_ `--paper` becomes `#0E1116` — both near-black, dark-on-dark, invisible.

**Decision:** Two patterns, picked by what the bg is doing:

1. **Always-dark backgrounds → hardcode `#F4F1EA` for text.** Use this when the surface is meant to stay dark in both themes (footer, Services featured tier, Services CTA strip). Do not rely on `var(--paper)` — it flips. Example: `Footer.astro .brand-name { color: #F4F1EA; }`.
2. **Theme-flipping backgrounds → add a `html[data-theme="dark"]` override.** Use this when both bg and text follow the theme but the text token (e.g. `var(--navy)`) becomes dark-on-dark in one mode. Example: `html[data-theme="dark"] .bento .num { color: var(--ink); }`.

**Lint rule (informal):** any time you write `color: var(--paper)` or `color: var(--navy)`, ask: "is the background also theme-flipping in the same direction?" If no, you need pattern (1) or (2).

The "Dark mode corrections" section in `global.css` (lines ~341–370) is the catch-all for cross-cutting fixes (`.btn.solid`, `.btn.ghost`, `.pill`). Per-component overrides live in each component's scoped `<style>` block.

---

## ADR-13 — Blueprint grid: z-index pattern

**Status:** Accepted (added 2026-05-08).

**Decision:** Grid is `body::before` with `position: fixed`, `z-index: 0`, two crossed `linear-gradient` images, 48×48 cells, 1px lines. Content sits above the grid via `main, header, footer { position: relative; z-index: 1; }` in `global.css`.

**Why not `z-index: -1`:** it's tempting to drop the grid behind everything with a negative z-index, but a transformed ancestor anywhere on the page creates a new stacking context that captures the negative z-index — the grid would suddenly appear in front of content. The explicit `z-index: 0` for the grid + `z-index: 1` for content avoids that whole class of bug.

**Why not `background-attachment: fixed`:** known performance issues on iOS Safari. The fixed pseudo-element approach is smoother.

**Theme-aware via `--blueprint`:**

- Light: `rgba(31, 42, 61, 0.075)` — subtle navy on paper
- Dark: `rgba(212, 179, 106, 0.10)` — subtle gold on dark

Sections with their own backgrounds (case-study cards, bento tiles, navy footer, services tiers) hide the grid in their patches — that's expected.

---

## Component architecture

```
BaseLayout.astro          ← wraps every page: <head>, <Header>, <slot />, <Footer>
                            takes lang prop, emits hreflang + <html lang>
├── Header.astro          ← sticky nav, logo (canonical SVG), EN/UA anchor, theme toggle, hamburger drawer
└── Footer.astro          ← brand mark + tagline + legal — all i18n'd

Reusable UI components (under src/components/):
├── ProjectCard.astro     ← repo path + title + description + stack tags + featured variant
└── PostRow.astro         ← date + title + category — a single line in the writing index

Shared page bodies (under src/page-content/):
├── Home.astro            ← hero (Dmytro / Klevakin. + motto), bento, case studies, service teasers
├── About.astro           ← portrait + bio + timeline + credentials
├── Services.astro        ← 3-tier pricing + 4 service-detail cards + CTA strip
├── Projects.astro        ← featured + 4 regular ProjectCards
├── WritingIndex.astro    ← series cards + recent posts (from collection)
├── Music.astro           ← intro + data-driven `tracks[]` array (Strudel / YouTube / SoundCloud iframes — see ADR-11)
├── Contact.astro         ← email block + Telegram + Calendly + social grid + response badges
└── NotFound.astro        ← 404 page (used by both /404 and /uk/404)
```

---

## Performance targets

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 95 |
| LCP | < 1.5 s (self-hosted fonts, no third-party blocking) |
| CLS | 0 (no layout shift — fonts use `font-display: swap`) |
| Client JS | 0 KB by default (only theme toggle + mobile drawer) |
| HTML per page | < 50 KB |
