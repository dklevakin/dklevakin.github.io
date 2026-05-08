# Backlog — klevakin.com

> What's open, what shipped, what's iceboxed.
> Status: `[ ]` pending · `[x]` done · `[~]` in progress · `[!]` blocked

---

## Now (open)

- [ ] **I18N-02** Translate Markdown blog posts (Ukrainian collection).
      Add `lang: 'en' | 'uk'` to post frontmatter, fork `[slug].astro` to filter by lang, write 1–2 Ukrainian posts to start.

- [ ] **I18N-03** Translate the deeply-nested page content that's still hard-coded English in the page-content components (timeline rows, project descriptions, service-detail bullets).
      Lift those strings into `en.json` / `uk.json` and replace inline copy with `t()` calls.

- [ ] **CONTENT-01** Replace placeholder case-study copy on the home page with two real wins (numbers + redacted client names).

- [ ] **OG-01** Generate a 1200×630 OG image (`public/assets/og-image.png`).
      Currently `BaseLayout` falls back to `logo-dk-2048.png` which is square — fine but not optimal for share previews.

- [ ] **A11Y-01** Audit colour contrast in dark mode against WCAG AA — especially `.muted` and `.muted-2` text on `--surface`.

- [ ] **PERF-01** Run Lighthouse against `https://klevakin.com` and capture a baseline.
      Targets: ≥ 95 perf, 100 a11y, 100 best-practices, 100 SEO.

- [ ] **CONTENT-02** Replace placeholder project-card copy with real shipped repos (or hide cards that don't have a public repo).

- [ ] **CONTENT-03** Write a real "About" voice paragraph that doesn't repeat what's already in the lead.

---

## Recently shipped

### Prototype v2 + i18n + docs (this PR)

- [x] **TOKENS-01** Add full design-token scale to `global.css` — `--fz-*`, `--lh-*`, `--sp-*`, `--shadow-*`, `--r-pill`. Match the handoff's `colors_and_type.css`.
- [x] **LOGOS-01** Extract canonical logos from `Klevakin Design System-handoff.zip` to `public/assets/`. Wire `Header.astro`, `Footer.astro`, and `BaseLayout.astro` favicon to use the extracted SVGs (no more hand-coded inline SVG).
- [x] **PROTOTYPE-V2** Implement v2 prototype hero: large `Dmytro / Klevakin.` H1, `Architecture as a lifestyle.` motto, "Trusted credentials" strip, 3-column bento (`13+ / Azure / AZ-400 + ● Now / UK·EN`).
- [x] **I18N-01** Wire EN/UA via Astro v6's built-in i18n routing.
      - `astro.config.mjs` i18n + sitemap integration both configured.
      - `src/i18n/{en,uk}.json` translation dictionaries.
      - `src/i18n/index.ts` helper (`t`, `getLang`, `altPath`).
      - 7 shared page-content components (`Home`, `About`, `Services`, `Projects`, `WritingIndex`, `Music`, `Contact`) + `NotFound`.
      - 7 EN route shells + 7 UK route shells + EN 404 + UK 404 = **19 pages** built.
      - `BaseLayout.astro` emits `<html lang>` + 3 `hreflang` link tags per page.
      - Header EN/UA is a real `<a>` that navigates to the alt-language URL.
- [x] **DOCS-01** Add `README.md` at repo root + `docs/{architecture,backlog,guide}.md`.
- [x] **HYGIENE-01** Verify `.gitignore`. Final repo polish.

### Earlier sessions

- [x] Astro v6 rewrite (commit `6ad4e97`)
- [x] Dark mode + blueprint grid + two-col hero + case studies + 3-tier services (`ec56306`)
- [x] Email swap to `dlklevakin@gmail.com`, Telegram added, phone removed (`da63aae`)
- [x] Real portrait photo + initial Solid Pivot logo (`e7937fb`)
- [x] Favicon + footer logo updated to Solid Pivot (`29078d4`)
- [x] Dark-mode text colour fixes, EN/UA visual toggle, 64×64 logo coords (`4f7f06a`)
- [x] "What this site is" blurb card under hero portrait (`09f4580`)

### Initial migration (Astro scaffold)

- [x] Phase 0 — Scaffold Astro v6 project, configure `astro.config.mjs`, copy fonts/assets, set up GitHub Actions deploy workflow.
- [x] Phase 1 — Layout components: `BaseLayout`, `Header`, `Footer`.
- [x] Phase 2 — Reusable UI components: `ProjectCard`, `ServiceCard`, `PostRow`.
- [x] Phase 3 — Page migration: index, about, services, projects, writing, music, contact, 404.
- [x] Phase 4 — Content collections: schema + 3 sample posts.
- [x] Phase 5 — SEO: sitemap, RSS, robots.txt, 404, CNAME.
- [x] Phase 6 — GitHub repo + Pages config + custom domain.

---

## Icebox (someday / maybe)

- [ ] Contact form (Astro island with Formspree or Netlify Forms handler).
- [ ] Site search via Pagefind (static search index, no server).
- [ ] Reading time on post pages.
- [ ] Tag filter on writing index.
- [ ] Privacy-friendly analytics (Plausible, Fathom, or self-hosted Umami).
- [ ] Web Mentions / IndieWeb integration.
- [ ] An RSS feed scoped per category.
- [ ] PWA manifest + offline support (probably overkill for a static site).
- [ ] Auto-generate OG card images per post via a build-time script.
