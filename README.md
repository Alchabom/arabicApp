# عالِم · Alim

Learn the Arabic alphabet the way a scribe would: one stroke, one sound, one form at a time.

## Features

- **Alphabet overview** (`/`) — all 29 letters in traditional hijāʾī order, each opening
  a detail view with isolated/initial/medial/final forms and audio pronunciation.
- **Flashcards** (`/flashLearning`) — flip cards, multiple-choice recall.
- **Drawing practice** (`/drawingPractice`) — trace letterforms on a pressure-aware
  canvas (mouse, touch, and stylus via the Pointer Events API), scored by stroke
  coverage/IoU against a guide glyph.
- **Test mode** (`/test`) — mixed quiz: letter recognition, name recall, audio
  identification, written forms.

## Stack

- **Next.js 15** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** for the design system
- **Konva** / **Canvas 2D** for the drawing/tracing surface
- `next/font`: Amiri (Arabic display), Fraunces (Latin display), Inter (UI), IBM Plex Mono (data)

Letter data lives in `lib/letters.ts`, wrapped in React's `cache()` so Server
Components can read it without duplicating fetches. `app/api/letters/route.ts`
re-exports the same data over HTTP for the pages that still fetch client-side.

## Getting started

Package manager is pinned via Corepack (`packageManager` in `package.json`) —
run `corepack enable` once if `pnpm` isn't already on your PATH.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx                 # home: hero + alphabet grid
  flashLearning/           # flashcard mode
  drawingPractice/         # canvas tracing mode
  test/                    # quiz mode
  api/letters/              # REST endpoint over lib/letters.ts
components/
  ui/                      # shadcn primitives
  hero.tsx, alphabet-grid.tsx, letter-tile.tsx, nav-cards.tsx
lib/
  letters.ts               # alphabet data + cached accessor
public/audio/              # per-letter pronunciation clips
```

## Roadmap

A FastAPI backend is planned to add accounts and progress tracking (streaks,
per-letter mastery, quiz history) across flashcards, drawing practice, and test
mode.
