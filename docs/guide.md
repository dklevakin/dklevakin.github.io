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
│   ├── assets/logos/         ← canonical logos (from design system zip)
│   ├── assets/photo.png      ← portrait
│   ├── fonts/                ← self-hosted woff2 (Fraunces, Manrope, JetBrains Mono)
│   ├── favicon.svg           ← favicon set lives at root of public/
│   ├── favicon-{16,32}.png
│   ├── apple-touch-icon.png
│   ├── site.webmanifest
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

### Adding a track to the Music page

`src/page-content/Music.astro` — the page renders from a `tracks: Track[]` array in the frontmatter. Each entry has:

- `kind`: `'strudel' | 'youtube' | 'soundcloud'` — picks iframe attrs from the `kindMeta` map (height, `allow` perms, `aspect-ratio`, fullscreen)
- `title`: displayed verbatim, no translation (proper noun)
- `captionKey`: optional i18n key for a one-line description (e.g. `'music.carol_caption'`)
- `url`: the iframe src

```astro
const tracks: Track[] = [
  // Existing track:
  { kind: 'strudel', title: 'Carol of the Bells', captionKey: 'music.carol_caption',
    url: 'https://strudel.cc/#<base64-encoded-patch>' },

  // To add a YouTube video:
  { kind: 'youtube', title: 'Friday session #3',
    url: 'https://www.youtube.com/embed/VIDEO_ID' },

  // To add a SoundCloud track (use Share → Embed on soundcloud.com to get the URL):
  { kind: 'soundcloud', title: 'Ambient mix 01',
    url: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/TRACK_ID&color=%23c9a961&auto_play=false&hide_related=true&show_comments=false&show_user=true' },
];
```

If you want a translated caption, add the key under `music` in both `en.json` and `uk.json` and reference it as `captionKey`. No CSS or layout changes needed.

**On Strudel + AGPL:** the iframe approach is loose coupling under AGPL — Strudel's code runs in its own browser context, no licence propagation. Don't replace this with `@strudel/repl` (4.7 MB, AGPL-3.0-or-later, would be linked into the bundle). See **ADR-11** in [architecture.md](./architecture.md).

### Hiding a page from the nav (without deleting it)

`src/components/Header.astro` — comment out the relevant entry in `navLinks`:

```astro
const navLinks = [
  { href: `${prefix}/`,         key: 'home' },
  { href: `${prefix}/about`,    key: 'about' },
  // { href: `${prefix}/services`, key: 'services' },  // hidden — page reachable by URL
  { href: `${prefix}/writing`,  key: 'writing' },
  ...
];
```

Both desktop nav and mobile drawer pull from the same array. The page, route, sitemap entry, and i18n strings stay intact — only the nav link disappears. Re-enable by uncommenting one line.

If the home page also has CTAs / teaser cards pointing to the hidden page (e.g. "See all projects" → `/projects`), comment those out in `Home.astro` too.

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

### Dark-mode legibility gotcha

`--paper`, `--navy`, and `--ink` all flip between modes. That's correct for theme-following surfaces — but it silently breaks elements where the background is "always dark" regardless of mode.

The most common bug: `background: var(--navy); color: var(--paper);` reads as cream-on-navy in light mode but becomes dark-on-dark (invisible) in dark mode, because both tokens flip to near-black.

Two fix patterns (see **ADR-12** in [architecture.md](./architecture.md)):

1. **Always-dark backgrounds** (footer, Services featured tier, Services CTA) — hardcode the cream colour for text: `color: #F4F1EA;`. Do not rely on `var(--paper)` in these spots.
2. **Theme-flipping backgrounds** (default page bg, surface cards) — add a `html[data-theme="dark"]` override to swap the text token to `var(--ink)` or `var(--gold)`.

Whenever you write `color: var(--paper)` or `color: var(--navy)`, ask: "is the background also theme-flipping in the same direction?" If no, you need pattern (1) or (2).

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

The header and footer reference SVG files in `public/assets/logos/`. Naming convention: the `-dark` / `-light` suffix refers to the **badge background colour** (dark = navy badge, light = cream badge), not the theme it's used in.

- `public/assets/logos/logo-mark-transparent.svg` — header **light theme** (no badge — navy mark on cream paper)
- `public/assets/logos/logo-mark-dark.svg` — header **dark theme** + footer (navy badge `#1F2A3D` blends into both dark surfaces)
- `public/assets/logos/logo-mark-light.svg` — cream-badge variant (currently unused but available)
- `public/assets/logos/logo-mark-{dark,light}-{512,2048}.png` — raster variants for OG / share previews
- `public/assets/logos/logo-horizontal-{dark,light,transparent}.png` — wordmark variants

The favicon set lives at `public/` root: `favicon.svg`, `favicon-{16,32}.png`, `apple-touch-icon.png`, `site.webmanifest`. Referenced from `BaseLayout.astro`.

OG image fallback: `/assets/logos/logo-mark-dark-2048.png` (square — backlog OG-01 tracks the dedicated 1200×630 follow-up).

To update: re-extract from the latest design-system zip into `public/assets/logos/`. No code changes needed unless filenames shift.

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
