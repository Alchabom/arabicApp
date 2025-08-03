import React, { useState } from 'react';

interface FlashcardData {
    id: number;
    question: string;
    answer: string;
    options: string[];
}

export default function Flashcard({ flashcard }: { flashcard: FlashcardData }) {
    const [flip, setFlip] = useState(false);

    return (
        <div
            className={`card ${flip ? 'flip' : ''}`}
            onClick={() => setFlip(!flip)}
            style={{ cursor: 'pointer', padding: '1rem', border: '1px solid #ccc', marginBottom: '1rem' }}
        >
            {!flip ? (
                <div className="front">
                    <div>{flashcard.question}</div>
                    <div className="flashcard-options">
                        {flashcard.options.map((option, idx) => (
                            <div key={idx} className="flashcard-option">
                                {option}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="back">{flashcard.answer}</div>
            )}
        </div>
    );
}
