"use client";

import { Volume2 } from "lucide-react";
import type { Letter, LetterForms } from "@/lib/letters";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function playAudio(url?: string) {
  if (!url) return;
  new Audio(url).play().catch((error) => console.error("Error playing audio:", error));
}

const FORM_LABELS: { key: keyof LetterForms; label: string }[] = [
  { key: "isolated", label: "Isolated" },
  { key: "initial", label: "Initial" },
  { key: "medial", label: "Medial" },
  { key: "final", label: "Final" },
];

interface LetterDetailDialogProps {
  letter: Letter | null;
  siblings?: Letter[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LetterDetailDialog({
  letter,
  siblings,
  open,
  onOpenChange,
}: LetterDetailDialogProps) {
  if (!letter) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-baseline gap-3">
            <span className="font-arabic text-4xl text-vermillion">{letter.letter}</span>
            <span className="font-display">{letter.name}</span>
          </DialogTitle>
          {letter.transliteration && (
            <DialogDescription className="font-mono">
              transliteration: {letter.transliteration}
            </DialogDescription>
          )}
        </DialogHeader>

        {siblings && siblings.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Same shape as{" "}
            <span className="font-arabic text-sm text-ink">
              {siblings.map((sibling) => sibling.letter).join(" ")}
            </span>
            , differing only by dots.
          </p>
        )}

        {letter.forms && (
          <div className="grid grid-cols-4 gap-2 rounded-lg bg-muted p-3">
            {FORM_LABELS.map(({ key, label }) => (
              <div key={key} className="flex flex-col items-center gap-1">
                <span className="font-arabic text-xl text-ink">
                  {letter.forms![key]}
                </span>
                <span className="text-[0.65rem] text-muted-foreground">{label}</span>
                {letter.formAudioUrls?.[key] && (
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => playAudio(letter.formAudioUrls?.[key])}
                    aria-label={`Play ${label} form`}
                  >
                    <Volume2 />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {letter.audioUrl && (
          <Button onClick={() => playAudio(letter.audioUrl)} className="w-full">
            <Volume2 /> Play sound
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
