import React from 'react';
import Flashcard from "@/app/flashLearning/flashcard";

interface FlashcardListProps {
    flashcards?: { id: number; question: string; answer: string; options: string[] }[]
}

export default function FlashcardList({ flashcards }: FlashcardListProps) {
    return (
        <div className="card-grid">
            {flashcards?.map(flashcard => (
                <Flashcard key={flashcard.id} flashcard={flashcard} />
            ))}
        </div>
    );
}
