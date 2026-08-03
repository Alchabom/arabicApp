"use client";

import { useState } from "react";
import type { Letter } from "@/lib/letters";
import { LetterDetailDialog } from "@/components/letter-detail-dialog";
import { cn } from "@/lib/utils";

export function LetterCell({
  letter,
  siblings,
}: {
  letter: Letter;
  siblings?: Letter[];
}) {
  const [open, setOpen] = useState(false);
  const hasFamily = !!siblings?.length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex flex-col items-center gap-1 border border-ink/10 p-3 text-center transition-colors hover:border-vermillion/30 hover:bg-vermillion/10",
          hasFamily && "bg-muted/40"
        )}
      >
        <span className="font-arabic text-2xl text-ink sm:text-3xl">
          {letter.forms?.isolated ?? letter.letter}
        </span>
        <span className="font-display text-xs text-ink">{letter.name}</span>
        {letter.transliteration && (
          <span className="font-mono text-[0.6rem] text-muted-foreground">
            {letter.transliteration}
          </span>
        )}
      </button>

      <LetterDetailDialog
        letter={letter}
        siblings={siblings}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
