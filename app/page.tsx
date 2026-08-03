import { Suspense } from "react";
import { Hero } from "@/components/hero";
import { AlphabetGrid } from "@/components/alphabet-grid";
import { AlphabetGridSkeleton } from "@/components/alphabet-grid-skeleton";
import { NavCards } from "@/components/nav-cards";
import { PageNav } from "@/components/page-nav";

// Ensure this page is statically generated so Vercel always emits a route
export const dynamic = "force-static";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen flex-col gap-16 px-4 pb-24">
      <div className="mx-auto w-full max-w-3xl pt-6">
        <PageNav />
      </div>

      <Hero />

      <section className="mx-auto w-full max-w-6xl">
        <h2 className="mb-4 font-display text-2xl text-vermillion">The alphabet</h2>
        <Suspense fallback={<AlphabetGridSkeleton />}>
          <AlphabetGrid />
        </Suspense>
      </section>

      <section className="mx-auto w-full max-w-3xl">
        <h2 className="mb-4 font-display text-2xl text-vermillion">Practice</h2>
        <NavCards />
      </section>
    </main>
  );
}
