// ============================================================
// Lightweight i18n helper for klevakin.com
//
// Two locales: 'en' (default, served at /) and 'uk' (served at /uk/).
// Translation strings live in `en.json` / `uk.json` keyed by namespace
// (e.g. 'hero.h1_line1'). Use `t(lang, 'namespace.key')` to look up.
// ============================================================

import en from './en.json';
import uk from './uk.json';

const dicts = { en, uk } as const;
export type Lang = keyof typeof dicts;
export const LOCALES: Lang[] = ['en', 'uk'];

/** Resolve the active language from a URL. /uk and /uk/* → 'uk'; everything else → 'en'. */
export function getLang(url: URL): Lang {
  return url.pathname === '/uk' || url.pathname.startsWith('/uk/') ? 'uk' : 'en';
}

/**
 * Look up a translation string by dotted path (e.g. `'hero.h1_line1'`).
 * Falls back to the path itself if the key is missing — surfaces typos visibly.
 */
export function t(lang: Lang, path: string): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = path.split('.').reduce<any>((acc, key) => acc?.[key], dicts[lang]);
  if (typeof value === 'string') return value;
  if (typeof value === 'undefined') return path; // visible miss
  return String(value);
}

/**
 * Swap a path between languages.
 * /about         → (uk) → /uk/about
 * /uk/about      → (en) → /about
 * /              → (uk) → /uk
 * /uk            → (en) → /
 */
export function altPath(currentPath: string, targetLang: Lang): string {
  // Strip any leading /uk or /uk/ prefix to get the 'bare' English path.
  const bare = currentPath.replace(/^\/uk(?=\/|$)/, '') || '/';
  if (targetLang === 'en') return bare;
  // For uk: prepend /uk, then collapse a trailing slash on the root.
  return bare === '/' ? '/uk' : `/uk${bare}`;
}
