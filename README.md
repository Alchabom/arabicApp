This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---
## Tech choices at a glance

- Next.js (App Router) and React: Enables client-side interactivity within a structured routing system (`app/`), while still benefiting from SSR/ISR for other pages. The drawing page is a client component (`"use client"`).
- Canvas 2D API: Efficient per-frame rendering for freehand drawing and guide overlays, with device pixel ratio (DPR) awareness for crisp strokes on retina screens.
- Pointer Events API: A unified input model across mouse, touch, and stylus (with pressure). This simplifies cross-device support and provides better fidelity on iPad/Apple Pencil.
- Offscreen-like masking via in-memory canvases: Two additional canvas buffers (target mask and draw mask) to compute coverage/IoU without polluting the on-screen canvas.
- requestAnimationFrame batching: Smooth drawing with coalesced updates to avoid jank and to maintain consistent stroke rendering.

## Where these appear in code

- Client component and routing: The page lives at `app/drawingPractice/page.tsx` and begins with `"use client"`. Navigation uses Next.js `useRouter()` to switch to `/` and `/flashLearning`.
- DPR scaling and canvas setup:
  - `dprRef` holds `window.devicePixelRatio`.
  - `resizeCanvas()` sets `canvas.width/height = cssSize * dpr` and `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` to ensure drawing commands use CSS pixels while the backing buffer stays sharp.
  - `renderGlyphGuide()` draws the target glyph on the target mask with the DPR transform.
- Multiple canvas layers (masks):
  - `targetMaskRef` and `drawMaskRef` are offscreen canvases used for: (1) drawing the guide path (target), and (2) the user’s strokes (drawn). The on-screen canvas composites an ambient guide and the current draw mask for live feedback in `drawGuide()`.
- Scoring (coverage and IoU):
  - `computeScore(cssWidth, cssHeight)` gets `ImageData` from both masks and examines alpha channels to compute:
    - coverage = intersection / targetOn
    - IoU = intersection / union
  - These metrics produce user feedback like “Great job!”
- Pointer events and pressure:
  - `onPointerDown`, `onPointerMove`, `onPointerUp` handlers manage drawing. The code uses `setPointerCapture`/`releasePointerCapture` and ignores non-primary pointers.
  - Pressure-aware width: when `pointerType` is `pen`, `effectiveWidth` scales with `pressure` to simulate natural pen thickness.
- Performance guardrails:
  - `requestAnimationFrame` is used to batch the latest point, limiting per-move work.
  - `touch-action: none` on the canvas prevents browser gestures from interrupting drawing.

## Why these technologies were chosen

- Next.js + React
  - Developer productivity: App Router’s file-based routing and React hooks make local UI state (color, width, modal visibility) trivial to manage.
  - Progressive enhancement: The drawing page is client-side only, while the rest of the app can still benefit from SSR.
- Canvas 2D API
  - Low-latency, pixel control for freehand strokes vs. DOM/SVG, and excellent perf on mobile when DPR is handled correctly.
  - Straightforward image data access for scoring (coverage/IoU).
- Pointer Events API
  - A single API for mouse/touch/stylus across platforms, with useful extras like `pressure`, `pointerType`, `isPrimary`, and pointer capture—ideal for iPadOS + Apple Pencil.
- Offscreen masks
  - Keeps the visible canvas clean and allows independent processing of guide and drawing. This separation is what enables fast, simple pixel math in `computeScore` without needing to re-render the visible layer from raw strokes.

## iOS and iPadOS specifics: pointers and gestures

iOS Safari historically had gaps in Pointer Events, but modern versions support them well enough for this use case—especially on iPad with Apple Pencil. The code already implements several best practices:

- Unified pointer handling
  - The `onPointerDown/Move/Up` handlers normalize all input types. This avoids duplicating logic for `touch*` and `mouse*` events.
  - `isPrimary` checks prevent multi-touch conflicts; non-primary contacts are ignored.
- Pointer capture
  - `setPointerCapture(pointerId)` on pointer down and `releasePointerCapture` on up/cancel ensure drawing continues even if the pointer leaves the canvas bounds. This is valuable on iOS where slight finger drift can otherwise end a stroke prematurely.
- Pressure sensitivity
  - When `pointerType` is `pen`, the code uses `event.pressure` to scale line width: `lineWidth * (0.5 + pressure)`. On Apple Pencil this provides natural thickness variation.
  - On some browsers or devices where `pressure` is stuck at 0 for non-pen input, the base `lineWidth` is used—no crashes.
- Prevent browser gestures
  - The CSS on the canvas includes `touch-action: none`, which tells browsers (including Mobile Safari) not to pan-zoom on touch, eliminating conflicts with drawing.
  - Event handlers call `preventDefault()` on pointer events associated with drawing to further reduce unintended scroll or text selection.
- Cancellation & edge cases
  - `onPointerCancel` and `onPointerLeave` both stop painting and release capture, avoiding stuck states when the OS cancels a gesture (e.g., incoming notification or multi-finger gesture on iPad).


## Canvas architecture and math in practice

- DPR correctness for crisp lines
  - The code sets the canvas’s internal pixel size to `CSS * dpr`, then applies a transform with `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)`. This ensures all coordinates and widths can be specified in CSS pixels, while the buffer is retina-sharp.
- Layering with masks
  - `targetMaskRef`: the glyph guide is rendered here once per size/selection. Its alpha channel represents the “ground truth” region to be covered.
  - `drawMaskRef`: every stroke segment is mirrored here so that `computeScore` can compare alpha-on pixels between the two masks.
  - `drawGuide()`: composites the current `drawMask` to the visible canvas and overlays faint fills/strokes of the glyph for visual guidance.
- Scoring
  - `computeScore` fetches `ImageData` from both masks for the current size. Iterating per 4-byte pixel, it tests `alpha > 0` to count intersection, union, and target coverage. Results feed into the UI via `setScore` and `setFeedback`.

## Performance considerations

- RAF batching: Pointer moves can fire at high frequency. By queuing the latest point and drawing inside `requestAnimationFrame`, we minimize work per frame and keep animation smooth.
- Minimal re-renders: Drawing is managed imperatively on canvas contexts; React state is used only for UI controls and metrics.
- Clearing efficiently: The code uses `clearRect` on both the visible and mask canvases; masking canvases are maintained at the proper DPR size so no scaling artifacts occur.

## Extending the feature set

- Smoothing/Interpolation: Add a small buffer of recent points and render quadratic/cubic Bézier curves for smoother lines. Because masks and visible canvas share coordinates, the change is localized to the stroke path generation.
- Eraser mode: Draw onto `drawMask` with `globalCompositeOperation = 'destination-out'` and mirror this on the visible canvas to remove ink.
- Multi-stroke target paths: Instead of a glyph, precompute vector paths and rasterize them to `targetMaskRef` with specific stroke widths. This can unlock stroke-order feedback.
- Export/share: Use `canvas.toDataURL('image/png')` to save the user’s drawing; consider compositing `drawMask` over a white background for consistent images.

## Key files

- app/drawingPractice/page.tsx — The full drawing experience, including:
  - Setup: DPR, masks, resize logic
  - Rendering: guide glyph, draw mask compositing
  - Input: pointer events with pressure, capture, and cancellation
  - Scoring: coverage and IoU
  - UI: color/width controls, clear, letter modal, navigation

# Custom RESTful API: How it is used across this codebase and REST alignment

This project exposes a small REST-style API implemented with Next.js App Router Route Handlers at `app/api/letters/route.ts`.

- Base URL: `/api`
- Primary resource: `letters`
- Media type: `application/json`
- State: stateless per-request; data is defined in-process for demo purposes.

## Endpoints implemented

- GET `/api/letters`
  - Returns the complete list of letters as an array of objects: `{ id, letter, name, transliteration?, audioUrl?, forms? }`.
  - Status: `200 OK`.
  - Implementation: The handler builds `baseLettersData` and returns `NextResponse.json(baseLettersData)`.

Note: In this repository’s current version, only the collection GET is implemented in the route file. The UI doesn’t perform mutations; therefore, create/update/delete endpoints aren’t needed yet. If you add them later, follow REST semantics (POST to collection, PUT/PATCH/DELETE to item URLs).

## Where and how the API is consumed in the app

Three pages load letters from the API and then transform/display the data in different ways:

- Home (app/page.tsx)
  - Usage: `fetch("/api/letters")` in a `useEffect` on mount.
  - Purpose: Populate a grid of letter tiles. Clicking a tile opens `LetterModal` with full details.
  - Mapping: The response is typed as `Letter[]` and stored in `letters` state. The UI reads `letter` and `name` for the grid, and the full object for the modal.

- Flashcards (app/flashLearning/page.tsx)
  - Usage: `fetch("/api/letters")` in a `useEffect` and then map into flashcards.
  - Purpose: Generate multiple-choice questions from the letter list.
  - Mapping: Constructs `Flashcard[]` by taking each letter as the correct answer and sampling `name` fields from other letters as distractors.

- Drawing Practice (app/drawingPractice/page.tsx)
  - Usage: `fetch('/api/letters')` on mount to load available letters for the selector.
  - Purpose: Drive the dropdown for selecting which letter to trace and to show details in `LetterModal`.
  - Mapping: Picks a default letter (Alif or the first item). Uses `letter`/`forms.isolated` to render a glyph guide on canvas; uses `name` for labels.

These calls are all simple GETs with no query params. They expect a stable shape for each letter, especially `id`, `letter`, `name`, and optionally `forms`.

## Why this design aligns with REST best practices

- Resource-oriented URI: The collection is modeled as `/api/letters`.
- Proper HTTP method semantics: GET is used for retrieval and is safe and idempotent. No server-side mutation occurs in these requests.
- Self-descriptive messages: JSON payload includes enough fields for clients to render multiple experiences (grid, flashcards, tracing). `Content-Type: application/json` is set by `NextResponse.json`.
- Statelessness: Each request contains all the info needed; the server does not maintain session. In this demo, data resides in the handler, but the stateless contract remains.
- Cacheability (optional): You can add cache headers or leverage Next.js route handler caching (e.g., `revalidate`) to let intermediaries or the browser cache GET `/api/letters` safely.
- Evolvability: Since consumers access a collection URL, you can add item routes later like `/api/letters/{id}` without changing current consumers.

If you have questions or want to adapt this for other scripts or shapes, open an issue or reach out.
