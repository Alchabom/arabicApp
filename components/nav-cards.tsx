import Link from "next/link";
import { Layers, PenTool, ClipboardCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TAA_GLYPH } from "@/lib/glyphs";

export function NavCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-[2fr_1fr] sm:grid-rows-2">
      <Link href="/drawingPractice" className="group sm:col-start-1 sm:row-span-2">
        <Card className="relative h-full transition-colors group-hover:bg-vermillion/10 group-hover:ring-vermillion/40">
          <svg
            viewBox={TAA_GLYPH.viewBox}
            className="pointer-events-none absolute -bottom-6 -right-6 h-36 w-auto text-ink/[0.06]"
            aria-hidden="true"
          >
            <path d={TAA_GLYPH.path} fill="currentColor" />
          </svg>
          <CardHeader>
            <PenTool className="mb-2 size-6 text-vermillion" aria-hidden="true" />
            <CardTitle className="font-display text-lg">
              Drawing Practice
            </CardTitle>
            <CardDescription>
              Trace letterforms stroke by stroke.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/flashLearning" className="group sm:col-start-2 sm:row-start-1">
        <Card className="h-full transition-colors group-hover:bg-vermillion/10 group-hover:ring-vermillion/40">
          <CardHeader>
            <Layers className="mb-2 size-6 text-vermillion" aria-hidden="true" />
            <CardTitle className="font-display text-base">
              Flashcards
            </CardTitle>
            <CardDescription>
              Flip through letters and test recall.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>

      <Link href="/test" className="group sm:col-start-2 sm:row-start-2">
        <Card className="h-full transition-colors group-hover:bg-vermillion/10 group-hover:ring-vermillion/40">
          <CardHeader>
            <ClipboardCheck className="mb-2 size-6 text-vermillion" aria-hidden="true" />
            <CardTitle className="font-display text-base">
              Test Mode
            </CardTitle>
            <CardDescription>
              Quiz yourself on the full alphabet.
            </CardDescription>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}
