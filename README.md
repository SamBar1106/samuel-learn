# samuel-learn

Samuel Barrios personal bilingual (Spanish/English) learning website.

Spanish and English are both first-class. Home is still the placeholder page. The first lesson, where the word "component" comes from, is at `/lessons/component`.

## Languages

Translations live in `src/i18n/es.json` and `src/i18n/en.json`. The visitor's choice is stored in `localStorage` under `samuel-learn-lang`, and the `lang` attribute on `<html>` stays in sync. On a first visit, the browser language picks `es` or `en`. Anything else starts in Spanish.

Every new item ships in both languages.

`npm run i18n:check` fails when a key exists in one language but not the other. It also fails when a page's `textKey`, `titleKey`, `sourceKey`, or `sectionKeys` entry in `src/data/content.json` is missing from either language file.

## Scripts

- `npm run dev` — dev server. Open `/samuel-learn/`
- `npm run build` — checks translations, then builds
- `npm run preview` — serves the production build
- `npm run i18n:check` — checks Spanish/English key parity
- `npm test` — data adapter selection and language choice
- `npm run screenshots` — Playwright screenshots (the preview server must already be running)

## Data

`src/lib/data.js` reads local JSON from `src/data/content.json`. The Supabase adapter is a stub: it does not create a client and it does not send the keys anywhere. It is selected only when both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set. Copy `.env.example` to `.env` and leave the values empty to keep the local adapter. Do not commit `.env`.

## Motion

Lenis smooth scroll is driven by GSAP's ticker. The sample page fades in with Framer Motion, including when the language changes. Both stay off when `prefers-reduced-motion: reduce` is set.

## GitHub Pages

`.github/workflows/pages.yml` deploys pushes to `main`. The Vite base path is `/samuel-learn/`. The build copies `index.html` to `404.html` so GitHub Pages can serve the client-side app for unknown paths. There is no custom domain.

https://sambar1106.github.io/samuel-learn/
