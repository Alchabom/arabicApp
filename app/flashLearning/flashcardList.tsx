import React from 'react';
import Flashcard from "@/app/flashLearning/flashcard";

interface FlashcardListProps {
    flashcards?: { id: number; question: string; answer: string; options: string[] }[]
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
    return (
        <div className="grid items-stretch gap-6 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
            {flashcards?.map(flashcard => (
                <Flashcard key={flashcard.id} flashcard={flashcard} />
            ))}
        </div>
    );
}
