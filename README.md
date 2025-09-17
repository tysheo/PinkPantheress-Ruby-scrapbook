## Deploying to Vercel

This is a fully static site (HTML/CSS/JS) with all files at the repo root.

### Dashboard
1. Go to https://vercel.com → New Project → Import.
2. Select this repo or drag/drop the folder.
3. Framework Preset: Other.
4. Build Command: (leave empty).
5. Output Directory: `./`
6. Deploy.

### CLI
```fish
npm i -g vercel
cd "/home/ty/Documents/Ruby 16 months anniversary"
vercel
# After the first deploy, run for production:
vercel --prod
```
# PinkPantheress × Ruby — Single‑Page Love Site

Playful, tactile, cinematic scrapbook built with React + Vite + Tailwind + Framer Motion. It autodiscovers your existing `assets/` folder via a generated `assets/_manifest.json` and falls back to in-app globs for dev.

## Quickstart

1) Install deps

```sh
pnpm i
```

2) Generate manifest from your `assets/` tree

```sh
node tools/generate-manifest.mjs
```

3) Run dev

```sh
pnpm dev
```

Open http://localhost:5173

## Autodiscovery

The site first tries to `fetch('assets/_manifest.json')`. If missing, it shows a toast and uses `import.meta.glob` fallbacks for `src/assets` during dev.

Run `node tools/generate-manifest.mjs` to scan:

- Audio: first `assets/song/*.{mp3,ogg}`
- Cover: `assets/song/*.{png,jpg,jpeg,webp,svg}` preferring filenames containing `cover`
- Stickers: all in `assets/collage assets/**/*.{png,svg,jpg,jpeg,webp}`
- Memories: all in `assets/photos/**/*.{png,jpg,jpeg,webp,gif}` with captions from filenames
- Textures: first in `assets/backgrounds/**/*.{png,jpg,jpeg,webp}`
- Palette: computed from images in `assets/style guide/**/*`

Outputs `assets/_manifest.json` which the app consumes at runtime.

## Deploy

Build and deploy to Vercel or GitHub Pages.

```sh
pnpm build
```

For Vercel: framework Vite, build `pnpm build`, output `dist/`.

For GitHub Pages:

```sh
pnpm build
# push the dist/ folder or configure a gh-pages action
```
