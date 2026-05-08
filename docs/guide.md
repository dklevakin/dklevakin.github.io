# Developer Guide — klevakin.com

> How to develop, add content, translate, and deploy.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 22.12.0 (LTS) |
| npm | ≥ 9.x (bundled with Node) |
| git | any recent version |

---

## Local development

```bash
git clone https://github.com/dklevakin/dklevakin.github.io.git
cd dklevakin.github.io
npm install
npm run dev          # → http://localhost:4321
```

The dev server hot-reloads on every save. All routes (English + Ukrainian) are reachable at their real URLs.

| Command | What it does |
|---|---|
| `npm run dev` | Dev server, hot reload, source maps |
| `npm run build` | Build static site → `dist/` (must complete with 0 errors) |
| `npm run preview` | Preview the built `dist/` from `http://localhost:4321` |
| `npm run astro check` | TypeScript + Astro diagnostics (no runtime) |

---

## Project structure

```
.
├── public/                   ← copied as-is to dist/
│   ├── assets/               ← canonical logos (from design system zip), photo, favicon-512
│   ├── fonts/                ← self-hosted woff2 (Fraunces, Manrope, JetBrains Mono)
│   ├── CNAME                 ← klevakin.com (custom domain)
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── BaseLayout.astro  ← <head> + Header + slot + Footer wrapper
│   │   ├── Header.astro      ← sticky nav, logo, EN/UA, theme toggle, mobile drawer
│   │   ├── Footer.astro
│   │   ├── ProjectCard.astro
│   │   ├── ServiceCard.astro
│   │   └── PostRow.astro
│   ├── content/
│   │   ├── posts/            ← Markdown blog posts (one .md = one post)
│   │   └── (config in src/content.config.ts)
│   ├── i18n/
│   │   ├── en.json           ← English translation dictionary
│   │   ├── uk.json           ← Ukrainian translation dictionary
│   │   └── index.ts          ← t(), getLang(), altPath() helpers
│   ├── page-content/
│   │   ├── Home.astro        ← shared hero/bento/cases/teasers
│   │   ├── About.astro
│   │   ├── Services.astro
│   │   ├── Projects.astro
│   │   ├── WritingIndex.astro
│   │   ├── Music.astro
│   │   ├── Contact.astro
│   │   └── NotFound.astro
│   ├── pages/                ← English route files (thin shells: <Home lang="en" />)
│   │   ├── index.astro       → /
│   │   ├── about.astro       → /about
│   │   ├── services.astro    → /services
│   │   ├── projects.astro    → /projects
│   │   ├── writing/
│   │   │   ├── index.astro   → /writing
│   │   │   └── [slug].astro  → /writing/<slug>
│   │   ├── music.astro       → /music
│   │   ├── contact.astro     → /contact
│   │   ├── 404.astro
│   │   ├── rss.xml.js        → /rss.xml
│   │   └── uk/               ← Ukrainian route files (thin shells: <Home lang="uk" />)
│   │       ├── index.astro   → /uk
│   │       ├── about.astro   → /uk/about
│   │       ├── services.astro
│   │       ├── projects.astro
│   │       ├── writing.astro
│   │       ├── music.astro
│   │       ├── contact.astro
│   │       └── 404.astro
│   ├── styles/
│   │   └── global.css        ← :root tokens, dark mode, blueprint grid, base typography
│   └── content.config.ts     ← Astro Content Collections schema (Zod)
├── .github/workflows/
│   └── deploy.yml            ← GitHub Actions: build + deploy to Pages
├── docs/                     ← architecture.md, backlog.md, guide.md
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

---

## Adding a blog post

1. Create a new file in `src/content/posts/`:
   ```
   src/content/posts/2026-05-10-my-post-title.md
   ```
   Filename format: `YYYY-MM-DD-slug.md` (date prefix is for filesystem sorting; slug is what appears in the URL).

2. Add the required frontmatter:
   ```markdown
   ---
   title: "My post title"
   date: 2026-05-10
   description: "One or two sentences summarising the post."
   category: "Cloud & DevOps"
   ---

   Your post content here in Markdown…
   ```

   **Valid categories:** `Cloud & DevOps` · `AI & vibe coding` · `Automation` · `Career`.

3. To keep a draft hidden from the site/RSS:
   ```yaml
   draft: true
   ```

4. Save — the dev server picks it up instantly. Push to `main` to publish.

> Note: blog posts are currently English-only. Ukrainian post translations are tracked as **I18N-02** in [docs/backlog.md](./backlog.md).

---

## Editing existing pages

Each page's body lives in `src/page-content/X.astro`. To edit copy or layout, edit there once and both EN + UK route files inherit the change.

### Adding / editing a project

`src/page-content/Projects.astro` — add a `<ProjectCard>` entry:
```astro
<ProjectCard
  repo="github.com / dklevakin / my-project"
  title="Project name"
  description="What it does in 1–2 sentences."
  stack={['Terraform', 'Azure', 'Python']}
  href="https://github.com/dklevakin/my-project"
/>
```
For the featured (full-width) card, add `featured={true}`.

### Updating the About timeline

`src/page-content/About.astro` — timeline rows follow this pattern:
```html
<div class="tl-row">
  <div class="y">2025 — now</div>
  <div class="b">
    <strong>Role Title · Company</strong>
    <span>Short description of the role.</span>
  </div>
</div>
```
Add new rows at the top (newest first).

### Updating the home bento

`src/page-content/Home.astro` — the bento is a 3-column grid. Each `<div class="card">` is a cell. Variants: `.navy` (navy bg), `.gold` (gold bg), `.span-2` (takes two columns).

---

## Translating copy (i18n)

### Add a new translation key

1. Add the key to `src/i18n/en.json` — pick a namespace (e.g. `services.new_thing`).
2. Add the same key with the Ukrainian value to `src/i18n/uk.json`. Keep the shape identical.
3. Use it in a page-content component: `{t(lang, 'services.new_thing')}`.

### Keys with embedded HTML

For strings that contain `<strong>`, `<em>`, etc., name the key `*_html` and render with `set:html`:
```astro
<p set:html={t(lang, 'hero.lead_html')}></p>
```

### Add a new language

1. Add it to `src/i18n/index.ts` (`dicts`, `LOCALES`, `getLang`, `altPath`).
2. Add it to `astro.config.mjs` (`i18n.locales` and the sitemap integration's `i18n.locales`).
3. Create the translation JSON: `src/i18n/<lang>.json`.
4. Create the route shells under `src/pages/<lang>/` — one per main page.
5. Update `Header.astro` so the language toggle handles three locales.

---

## Themes (dark mode)

The toggle button (`☀ ☾`) in the header swaps the `data-theme` attribute on `<html>` and persists to `localStorage["klv_theme"]`.

To change defaults, edit the inline init script in `BaseLayout.astro`:
```js
// Default behaviour: respect prefers-color-scheme.
// To force a theme, replace this script with:
//   document.documentElement.setAttribute('data-theme', 'dark');
```

To adjust colours, edit `src/styles/global.css`:
- Light-mode tokens live in `:root`.
- Dark-mode overrides live in `html[data-theme="dark"]`.

---

## Adjusting design tokens

All tokens live in `src/styles/global.css` `:root`. Categories:
- Surfaces (`--paper`, `--paper-2`, `--surface`)
- Navy scale (`--navy`, `--navy-2`, `--navy-soft`)
- Text (`--ink`, `--muted`, `--muted-2`)
- Accents (`--gold`, `--gold-deep`, `--terra`)
- Borders & code (`--line`, `--code`)
- Type scale (`--fz-*`)
- Line heights (`--lh-*`)
- Spacing (`--sp-1` … `--sp-9`)
- Radii (`--r-sm`, `--r-md`, `--r-lg`, `--r-pill`)
- Shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`)
- Typefaces (`--serif`, `--sans`, `--mono`)

The canonical source is `colors_and_type.css` inside the design system handoff zip (`D:\CLAUDE\Artifacts\Klevakin Design System-handoff.zip`). When the design system updates, mirror the changes here.

---

## Swapping the home portrait

1. Replace `public/assets/photo.png` with the new image.
2. The `Home.astro` page already uses `object-fit: cover; object-position: center 22%;` — adjust `object-position` if the face isn't centred.
3. The same photo is also used by `About.astro` — verify it works at a smaller frame too.

---

## Updating logos

The header, footer and favicon all reference SVG files extracted from the design system zip:
- `public/assets/logo-mark-tp.svg` — header (light theme), favicon source
- `public/assets/logo-mark-dark.svg` — header (dark theme), favicon
- `public/assets/logo-mark-light.svg` — footer (paper-on-navy stamp)
- `public/assets/favicon-512.png` — apple-touch-icon

To update: re-extract from the latest zip, place in `public/assets/`, no code changes needed.

---

## Deployment

### Automatic (recommended)

Push to `main`:
```bash
git add .
git commit -m "Update something"
git push
```
GitHub Actions builds and deploys to Pages in ~60 s. Watch progress at:
`https://github.com/dklevakin/dklevakin.github.io/actions`.

### Manual trigger

In GitHub → Actions → "Deploy to GitHub Pages" → "Run workflow" → Run.

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---|---|---|
| Build fails with `Cannot find module '../i18n/en.json'` | Wrong relative path from a page-content file | Page-content is `src/page-content/X.astro` → import `../i18n` (one `..` is enough). |
| `t()` returns the literal key instead of a translation | Missing key in `en.json`/`uk.json` | Add the key. The fallback returns the path so misses are visible during dev. |
| Dark mode flashes light briefly on load | Inline init script removed or moved | Verify the `<script is:inline>` is still in `<head>` of `BaseLayout.astro` *before* the `<title>` tag. |
| Favicon shows old design after deploy | Browser cache | Hard reload (Cmd/Ctrl + Shift + R). The favicon URL is stable so this is purely client cache. |
| `/uk/foo` returns 404 | Missing route shell at `src/pages/uk/foo.astro` | Create the shell (one-line `<Foo lang="uk" />`). |

---

## Useful commands

```bash
# Inspect what each token resolves to in the built CSS
grep -E "var\(--" dist/_astro/*.css | head -40

# List every asset path referenced from src/
grep -rEh "/assets/[a-zA-Z0-9_-]+\.(svg|png|jpg)" src/ | sort -u

# Find pages still using English literals (potential i18n misses)
grep -rE ">[A-Z][a-z]+ [a-z]+ [a-z]+ [a-z]+<" src/page-content/

# Re-extract design assets from the handoff zip
unzip -j -o "D:/CLAUDE/Artifacts/Klevakin Design System-handoff.zip" \
  "klevakin-design-system/project/assets/logo-*" \
  "klevakin-design-system/project/assets/favicon-*" \
  -d public/assets/
```
