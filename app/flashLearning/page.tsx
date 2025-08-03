"use client";
import React from "react";
import FlashcardList from './flashcardList'

export default function FlashLearningPage() {
   const [flashcards, setFlashcards] = React.useState(SAMPLE_CARDS);
    return (
         <FlashcardList flashcards={flashcards} />
    );

}

const SAMPLE_CARDS = [
    {
        id: 1,
        question: "Whats 9+10?",
        answer: "21",
        options: ['19', '10', '21']
    }
]


