"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, PenTool, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/flashLearning", icon: Layers, label: "Flashcards" },
  { href: "/drawingPractice", icon: PenTool, label: "Drawing Practice" },
  { href: "/test", icon: ClipboardCheck, label: "Test Mode" },
];

export function PageNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-8 flex flex-wrap justify-center gap-2">
      {LINKS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ring-1 transition-colors",
              active
                ? "bg-vermillion/15 text-vermillion ring-vermillion/40"
                : "text-muted-foreground ring-foreground/10 hover:bg-muted hover:text-ink"
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
