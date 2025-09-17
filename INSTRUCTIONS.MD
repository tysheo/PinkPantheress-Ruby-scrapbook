# MASTER PROMPT — MAKE THIS WEBSITE GORGEOUS, DYNAMIC, AND COZY FOR RUBY

You are an elite front‑end engineer + motion designer. Build me a **single‑page love website** that looks like a **PinkPantheress × scrapbook** dream — playful, tactile, and cinematic — while staying clean, fast, and accessible.

---

## Context

* It’s a gift for my girlfriend **Ruby** (Happy 16 months!).
* Current site already has: paper texture background, blocky pink letter tiles spelling **PINK PANTHERESS × RUBY**, an audio player for one MP3, a draggable collage board, a scrapbook grid of photos, and a love‑note area.
* I want the whole thing to feel **more designed**: better type, spacing, motion, polish, and interaction. Keep the scrap/paper vibe but elevate it with modern UI details.
* Final output should be **production‑ready code** that I can copy into a project and run locally.

---

## Tech Requirements

* **Framework:** React + Vite + TypeScript.
* **Styling:** Tailwind CSS with CSS variables and a small custom theme (see Palette below).
* **Animation:** Framer Motion (preferred) or GSAP.
* **Canvas/filters:** Vanilla `<canvas>` for export + blend‑modes; optionally **PixiJS** if needed for performant layering and halftone/duotone filters.
* **Icons:** Lucide.
* **Fonts:**

  * Headline: *Recoleta* or *Cheee Variable* style (rounded/bubbly). If licensing blocks, use **Chewy** (Google) or **Lilita One** as a free alternative.
  * Body/UI: **Inter** (Google) with optical sizing.
* **Build tooling:** Vite. Provide `package.json` scripts.
* **Dependencies kept minimal.** No heavy UI kits.

---

## Files & Structure to Output (create EVERYTHING below)

```
/ (root)
  README.md
  index.html
  vite.config.ts
  tailwind.config.ts
  postcss.config.js
  tsconfig.json
  /public
    /textures/paper.jpg          (placeholder; explain where to replace)
  /src
    main.tsx
    index.css                    (Tailwind base + variables)
    /lib
      audio.ts                   (audio helpers + persist)
      storage.ts                 (localStorage helpers)
      collage.ts                 (layout + export to PNG)
      images.ts                  (import.meta.glob helpers)
    /components
      HeaderTiles.tsx            (animated PINKPANTHERESS × RUBY tiles)
      Player.tsx                 (album art + custom player + waveform/progress)
      CollageBoard.tsx           (draggable canvas + toolbar)
      ScrapbookGrid.tsx          (polaroid cards + lightbox)
      LoveNote.tsx               (typewriter note + save as PNG)
      Footer.tsx
      FullscreenButton.tsx
      DebugPanel.tsx             (optional toggle with `?debug`)
    /styles
      tokens.css                 (CSS variables: colors, radii, shadows)
    /data
      memories.ts                (array of photos + captions)
    App.tsx
```

> IMPORTANT: Use `import.meta.glob` to pull images from `src/assets/memories/*` and `src/assets/stickers/*` so I can just drop files in a folder.

---

## Asset Inputs (make it easy to swap)

* **Audio:** One track, default path: `src/assets/audio/song.mp3` (I will place my mp3 there).
* **Album art:** `src/assets/audio/cover.jpg`.
* **Collage assets (stickers, scraps, shapes):** `src/assets/stickers/*` (png/svg with transparency).
* **Memories (photos):** `src/assets/memories/*` (jpg/png). Auto‑generate captions from file name; allow optional JSON in `memories.ts` to override.
* **Textures:** `public/textures/paper.jpg` (replaceable; tile or cover smartly).

---

## Asset Autodiscovery — Use My Existing `/assets` Folder

**Do not create new asset folders. Use what already exists under `assets/` and treat names as authoritative.**

### Expected folders (examples — support spaces and hyphens)

```
assets/
  backgrounds/              # paper textures, gradients
  collage assets/           # stickers: hearts, stars, scraps, stamps (png/svg)
  photos/                   # memories
  song/                     # one mp3 + a cover image (any name containing "cover")
  style guide/              # mood refs; use only for palette extraction
  collage-manifest.json     # optional: positions/scales/tags for stickers
```

### How to load them

* **Primary:** Fetch `assets/_manifest.json` at runtime and hydrate the UI from it.
* **If `_manifest.json` doesn’t exist:**

  1. Try `assets/collage-manifest.json` (if present) for stickers.
  2. Otherwise **autodiscover** by folder rules below (URLs must be `encodeURI`d to handle spaces):

     * **Audio:** first file in `assets/song/*.{mp3,ogg}`.
     * **Cover:** in `assets/song/*.{png,jpg,jpeg,webp,svg}` — prefer filename containing `cover` else first image.
     * **Stickers:** all images in `assets/collage assets/**/*.{png,svg,jpg,jpeg,webp}`.
     * **Memories:** all images in `assets/photos/**/*.{png,jpg,jpeg,webp,gif}`; caption from filename (strip extensions/underscores).
     * **Textures:** images in `assets/backgrounds/**/*.{png,jpg,jpeg,webp}` (use the first as paper base).
     * **Style Guide:** images in `assets/style guide/**/*` used **only** to compute a 5‑color palette (k‑means or median‑cut on a downscaled canvas) to theme CSS variables.

### Manifest schema to generate (and then use)

Create a tiny Node script and output this file so the browser can simply `fetch` it:

```jsonc
// assets/_manifest.json
{
  "audio": { "src": "assets/song/track.mp3", "cover": "assets/song/album_cover.jpg" },
  "stickers": [
    { "src": "assets/collage assets/heart.svg", "tags": ["heart"] },
    { "src": "assets/collage assets/star.svg", "tags": ["star"] }
  ],
  "memories": [
    { "src": "assets/photos/memory1.jpg", "caption": "Memory 1" }
  ],
  "textures": ["assets/backgrounds/paper.jpg"],
  "palette": ["#ff7aa2", "#ff4d84", "#1b1b1b", "#fff6ee", "#f7f2ee"]
}
```

### Deliver these extra files

```
/tools/generate-manifest.mjs   # Node script: scans /assets & writes /assets/_manifest.json
```

**Behavior:**

* Script recursively scans the folders above, builds the JSON (respect `collage-manifest.json` if present by merging positions/scales/z).
* The website loads `_manifest.json`; if missing, show a helpful toast: “No manifest yet — run `node tools/generate-manifest.mjs`”.
* All paths kept **relative** (e.g., `assets/...`), encoded via `encodeURI` before use in `<img>` or CSS.

> Bottom line: The build must **look through my existing `assets/` tree** and just work — no renaming, no moving.

---

## Visual Direction

* **Palette** (CSS variables; tune in tokens.css):

  * `--ink`: #1b1b1b
  * `--paper`: #f7f2ee
  * `--pink`: #ff7aa2
  * `--hot-pink`: #ff4d84
  * `--cream`: #fff6ee
  * `--shadow`: rgba(0,0,0,0.12)
* **Aesthetic:** tactile paper, halftone dots, soft drop shadows, torn edges, rounded tiles, slightly offset print look; **cute but not childish**.
* **Type & Layout:** generous line‑height, 8‑pt grid, max‑width 1100px, lots of breathing room. Mobile-first.

---

## Page Sections & Behavior (polished replacements of what exists)

### 1) Header Tiles (hero)

* Big stacked tiles that spell **PINK PANTHERESS × RUBY**.
* Each tile: soft rounded square with pink fill, white border, subtle paper noise, and a slight 3D extrude via layered shadow.
* Entrance: cascade **spring** animation (Framer Motion) with tiny rotation jitter as if hand-placed.
* Hover: micro parallax + lift.
* Responsive: Tiles wrap into 3–4 columns on mobile.

### 2) Audio Player (custom)

* Left: album cover (rounded xl, subtle gloss overlay). Right: custom control bar.
* Play/Pause, seek, mute, volume. Use a thin progress bar with dot handle.
* **Autoplay** only after first interaction; remember playback position in `localStorage`.
* Show **00:00** timecodes; nice hover scrubbing.
* Small confetti heart burst when track starts.

### 3) Collage Board (the fun part)

* A large artboard with paper texture and **blend‑modes**.
* Load 10–20 random sticker images from `src/assets/stickers/*` on first visit; persist layout in `localStorage`.
* **Interactions:**

  * Drag to move; **Shift + wheel** to rotate; **Alt + wheel** to scale.
  * **Double‑click** to bring to front.
  * Multi‑select with **Cmd/Ctrl** key.
* **Toolbar buttons** (sticky top): `Shuffle`, `Add 5`, `Filter`, `Halftone`, `Torn Edge`, `Save PNG`.

  * Implement filters via canvas shaders or CSS blend‑modes; if PixiJS is used, include fragment shaders for halftone.
  * `Save PNG` exports the current board at 2x scale (retina) with transparent corners and a soft vignette.
* **Physics:** tiny inertia on release so elements glide.
* **Edge guards:** keep content inside the board on resize.

### 4) Scrapbook Grid

* Masonry grid of “polaroid” cards (rounded corners, drop shadow, small label like *Memory 1*).
* Hover tilt (3D) + shadow deepen; click opens **Lightbox** (keyboard accessible; `Esc` closes; arrows navigate).
* Lazy‑load images; use `blur-up` placeholders.

### 5) Love Note

* Heading: **LOVE NOTE** in a stamped text style.
* Text area with **typewriter effect** (auto-typing the default message I provide, with a *Skip typing* button).
* Character counter; heart emoji picker.
* **Save as PNG** renders a pretty card (paper texture, pink border) from the note content via canvas; downloadable.
* Persist content in `localStorage`.

### 6) Footer & Extras

* Small line: *Made for Ruby by Ty — PinkPantheress forever* ♥︎
* **Fullscreen toggle** button.
* **Easter eggs:**

  * Press **R** = sprinkle stars; **P** = spawn a pink heart sticker.
  * On scrolling to the bottom, a tiny *“I love you more than 16 months worth”* marquee winks for 2s.

---

## Accessibility & Performance

* Semantic HTML; labels/ARIA for controls; keyboard controls for player + lightbox + board.
* Respect `prefers-reduced-motion`; fallback animations minimal.
* Keep CLS low; pre-size hero tiles and images.
* Use modern image formats (webp/avif if available) with fallbacks.

---

## State & Persistence

* `localStorage` keys:

  * `ruby.collage.layout` (positions/scales/zIdx)
  * `ruby.audio.position` (seconds)
  * `ruby.note.content`
* Provide `Reset all` in DebugPanel (hidden behind `?debug`).

---

## Implementation Notes

* **Image loading:**

```ts
// images.ts
export const stickers = Object.values(import.meta.glob('/src/assets/stickers/*', { eager: true, as: 'url' }));
export const memories = Object.values(import.meta.glob('/src/assets/memories/*', { eager: true, as: 'url' }));
```

* **Drag/rotate/scale:** use your own pointer handlers with CSS transforms (no heavy DnD lib). Keep transforms in component state and commit to storage on pointerup.
* **Export PNG:** Render a hidden canvas; draw texture bg + each sticker layer with current transforms; use `toDataURL` and trigger download.
* **Filters:** Simple CSS filters (grayscale/contrast) + optional canvas halftone shader (if PixiJS present). Keep it tasteful.

---

## Copy (defaults you may prefill)

* **Love note default:** “Happy 16 months, Ruby — I love you forever 💖\nEvery day with you is my favorite song.”
* **Section labels:** *SCRAPBOOK*, *LOVE NOTE*.

---

## Nice Motion Details

* Use **spring** easing for tiles and stickers (low stiffness) so everything feels plush.
* Subtle paper wobble on hover (1–2 degrees).
* Audio play causes a tiny pulse around the cover art.

---

## Acceptance Criteria (don’t skip)

1. Builds with `pnpm i` and `pnpm dev` on Vite.
2. Looks polished on **mobile and desktop**.
3. **Header tiles**, **custom audio player**, **collage board with toolbar & PNG export**, **scrapbook with lightbox**, and **love note with typewriter + PNG export** all working.
4. No layout shift; images lazy‑load.
5. All states persist and reset via hidden DebugPanel.
6. Code is clean, commented, and easy for me to tweak.

---

## What to Output to Me (exact order)

1. Short overview (1–2 paragraphs) of how your build achieves the brief **and** how it autodiscovers from `/assets`.
2. **Complete file tree** and **all code files** in copy‑pasteable blocks, starting with `package.json`, `index.html`, then TS/TSX files, **plus** `/tools/generate-manifest.mjs` and an example of `assets/_manifest.json` output.
3. A **section explaining how the autodiscovery works**, including the folder rules and how to regenerate the manifest.
4. Instructions to run locally and to deploy on **Vercel** or GitHub Pages.
5. Optional: tiny notes on how to add more stickers and memories later.

---

## Extra: Styling Cheatsheet

* Radii: `--radius-card: 22px; --radius-tile: 14px;`
* Shadows: `--shadow-1: 0 6px 30px rgba(0,0,0,.08); --shadow-2: 0 10px 40px rgba(0,0,0,.12);`
* Tile: pink fill, white inset border (2px), inner paper noise.
* Polaroid: white frame, bottom caption strip, drop shadow.
* Buttons: pill, medium weight, micro shadow; active state presses 1px.

---

## Notes about Assets You’ll See

I’ll provide (already placed under `/assets`):

* 1 MP3 (in `assets/song/`), 1 cover image (same folder).
* A folder of cute **stickers** in `assets/collage assets/`.
* **Memories** images in `assets/photos/`.
* Paper **textures** in `assets/backgrounds/`.

Design for **imperfect images** (mixed sizes/crops) — the layout should still look adorable.

---

## Tone & Vibe

Soft, playful, flirty, and warm — **never** tacky. If in doubt, remove clutter and give the content space to shine.

> Ship the full solution in one response. No pseudo-code. ❤️
