import React, { useState, useEffect, useRef } from 'react';

interface FlashcardProps {
  flashcard: {
    id: number;
    question: string;
    answer: string;
    options: string[];
  };
}

const styles = {
  card: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    perspective: '1000px',
    aspectRatio: '3/2.5',
  },
  cardInner: (isFlipped: boolean) => ({
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    textAlign: 'center' as const,
    transition: 'transform 0.8s',
    transformStyle: 'preserve-3d' as const,
    cursor: 'pointer',
    transform: isFlipped ? 'rotateY(180deg)' : '',
  }),
  cardFace: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    padding: '20px',
  },
  front: {
    transform: 'rotateY(0deg)',
  },
  back: {
    transform: 'rotateY(180deg)',
  },
  arabicLetter: {
    fontSize: '4rem',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  answer: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginTop: '20px',
  }
};

export default function Flashcard({ flashcard }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
      <div style={styles.card}>
        <div style={styles.cardInner(isFlipped)} onClick={handleClick}>
          <div style={{ ...styles.cardFace, ...styles.front }}>
            <div style={styles.arabicLetter}>{flashcard.question}</div>
            <div>What is this letter?</div>
          </div>
          <div style={{ ...styles.cardFace, ...styles.back }}>
            <div style={styles.arabicLetter}>{flashcard.question}</div>
            <div style={styles.answer}>{flashcard.answer}</div>
          </div>
        </div>
      </div>
  );
}
