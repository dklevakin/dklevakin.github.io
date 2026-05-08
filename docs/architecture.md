# Architecture — klevakin.com

> Architecture decisions and system design for the Astro v6 personal site.
> Last updated: 2026-05-08.

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
- Logo files: extracted to `public/assets/` — `logo-mark-{dark,light,tp}.svg`, `logo-mark-{dark,light}.png`, `logo-horizontal-{dark,light,tp}.svg`, `favicon-512.png`, `logo-dk-2048.png`.
- Brand voice: `BRAND_AUDIT.md` and `DK Brand Book.html`.

Header logo, footer logo and favicon all reference the extracted SVG files directly — no hand-coded SVG copies.

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

## Component architecture

```
BaseLayout.astro          ← wraps every page: <head>, <Header>, <slot />, <Footer>
                            takes lang prop, emits hreflang + <html lang>
├── Header.astro          ← sticky nav, logo (canonical SVG), EN/UA anchor, theme toggle, hamburger drawer
└── Footer.astro          ← brand mark + tagline + legal — all i18n'd

Reusable UI components (under src/components/):
├── ProjectCard.astro     ← repo path + title + description + stack tags + featured variant
├── ServiceCard.astro     ← icon + title + description + bullet list
└── PostRow.astro         ← date + title + category — a single line in the writing index

Shared page bodies (under src/page-content/):
├── Home.astro            ← hero (Dmytro / Klevakin. + motto), bento, case studies, service teasers
├── About.astro           ← portrait + bio + timeline + credentials
├── Services.astro        ← 3-tier pricing + 4 service-detail cards + CTA strip
├── Projects.astro        ← featured + 4 regular ProjectCards
├── WritingIndex.astro    ← series cards + recent posts (from collection)
├── Music.astro           ← navy section + Strudel REPL preview
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
