"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FlashcardProps {
  flashcard: {
    id: number;
    question: string;
    answer: string;
    options: string[];
  };
}

export default function Flashcard({ flashcard }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleOptionClick = (option: string) => {
    if (selected) return;
    setSelected(option);
    const ok = option === flashcard.answer;
    setResult(ok ? 'correct' : 'incorrect');
    if (!ok) {
      // auto flip to show correct after a brief delay
      setTimeout(() => setIsFlipped(true), 700);
    }
  };

  const resetCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFlipped(false);
    setSelected(null);
    setResult(null);
  };

  return (
    <div className="relative aspect-[3/2.5] overflow-hidden rounded-lg bg-card p-2 shadow-md ring-1 ring-foreground/10 transition-transform [perspective:1000px] hover:-translate-y-0.5">
      <div
        className="relative h-full w-full cursor-pointer text-center transition-transform duration-700 [transform-style:preserve-3d]"
        style={{ transform: isFlipped ? "rotateY(180deg)" : undefined }}
        onClick={handleClick}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-card p-3 [backface-visibility:hidden]">
          <div className="max-w-full truncate font-arabic text-[clamp(1.6rem,6vw,2.2rem)] text-ink">
            {flashcard.question}
          </div>
          <div
            className="grid w-full grid-cols-1 gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            {flashcard.options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = opt === flashcard.answer;
              const state =
                selected && isSelected && isCorrect
                  ? "correct"
                  : selected && isSelected && !isCorrect
                  ? "incorrect"
                  : selected && isCorrect
                  ? "reveal"
                  : "idle";

              return (
                <button
                  key={opt}
                  onClick={() => handleOptionClick(opt)}
                  aria-label={`Option ${opt}`}
                  disabled={!!selected}
                  className={cn(
                    "w-full truncate rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                    state === "idle" &&
                      "border-foreground/10 bg-muted text-ink",
                    state === "correct" &&
                      "border-gold/50 bg-gold/15 text-gold",
                    state === "incorrect" &&
                      "border-vermillion/50 bg-vermillion/15 text-vermillion",
                    state === "reveal" &&
                      "border-gold/30 bg-gold/10 text-gold",
                    selected ? "cursor-default" : "cursor-pointer"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          <div className="min-h-5">
            {selected && (
              <span
                className={cn(
                  "text-sm",
                  result === "correct" ? "text-gold" : "text-vermillion"
                )}
              >
                {result === "correct" ? "Correct!" : "Try again! Revealing answer..."}
              </span>
            )}
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg bg-card p-3 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="max-w-full truncate font-arabic text-[clamp(1.6rem,6vw,2.2rem)] text-ink">
            {flashcard.question}
          </div>
          <div className="font-display text-3xl text-ink">{flashcard.answer}</div>
          <Button variant="outline" className="mt-4" onClick={resetCard}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
