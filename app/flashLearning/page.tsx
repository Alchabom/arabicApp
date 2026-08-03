"use client";
import React, { useEffect } from "react";
import FlashcardList from './flashcardList';
import { PageNav } from "@/components/page-nav";

interface Letter {
  id: number;
  letter: string;
  name: string;
  transliteration?: string;
  forms?: {
    isolated: string;
    initial: string;
    medial: string;
    final: string;
  };
}

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  options: string[];
}

export default function FlashLearningPage() {
  const [flashcards, setFlashcards] = React.useState<Flashcard[]>([]);

  useEffect(() => {
    const fetchLettersAndCreateFlashcards = async () => {
      try {
        const response = await fetch("/api/letters");
        if (!response.ok) {
          throw new Error("Failed to fetch letters");
        }

        const letters: Letter[] = await response.json();

        const transformedFlashcards = letters.map(letter => {
          const wrongOptions = letters
            .filter(l => l.id !== letter.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 2)
            .map(l => l.name);

          return {
            id: letter.id,
            question: letter.letter,
            answer: letter.name,
            options: [...wrongOptions, letter.name].sort(() => Math.random() - 0.5)
          };
        });

        setFlashcards(transformedFlashcards);
      } catch (error) {
        console.error("Error fetching letters:", error);
      }
    };

    fetchLettersAndCreateFlashcards();
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 pt-12 pb-24">
      <PageNav />
      <h1 className="text-center font-display text-2xl text-ink">Flashcards</h1>
      <p className="mb-8 text-center text-sm text-muted-foreground">
        Tap a card to reveal the answer
      </p>

      <FlashcardList flashcards={flashcards} />
    </main>
  );
};
