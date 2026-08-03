import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the grid layout in alphabet-grid.tsx so the loading state doesn't
// jump when the real grid mounts.
export function AlphabetGridSkeleton() {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {Array.from({ length: 29 }).map((_, i) => (
        <div key={i} className="border border-ink/10 p-3">
          <Skeleton className="mx-auto h-14 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
