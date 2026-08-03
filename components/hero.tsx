import { TAA_GLYPH } from "@/lib/glyphs";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-3xl gap-10 px-6 pt-16 pb-4 sm:pt-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-10">
      <div className="flex flex-col items-start gap-5 text-left">
        <span className="rounded-full border border-wash/30 px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          عالِم · Alim
        </span>

        <h1 className="font-display text-4xl font-semibold leading-[1.1] text-ink sm:text-5xl">
          Trace every letter, stroke by stroke.
        </h1>

        <p className="max-w-md text-base text-muted-foreground">
          Learn the Arabic alphabet the way a scribe would: one stroke, one
          sound, one form at a time.
        </p>
      </div>

      <div
        className="relative flex items-center justify-center rounded-2xl border border-ink/10 bg-card/70 p-8 sm:p-10"
        aria-hidden="true"
      >
        <svg
          viewBox={TAA_GLYPH.viewBox}
          className="h-24 w-auto text-vermillion sm:h-32"
        >
          <path
            d={TAA_GLYPH.path}
            pathLength={1}
            className="stroke-draw-glyph"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
