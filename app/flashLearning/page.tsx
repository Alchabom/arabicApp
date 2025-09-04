"use client";
import React, { useEffect } from "react";
import FlashcardList from './flashcardList';
import './app.css';
import { useRouter } from "next/navigation";

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box' as const,
  },
  topNav: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '12px',
    flexWrap: 'wrap' as const,
  },
  btn: {
    padding: '10px 15px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fafafa',
    cursor: 'pointer',
  } as React.CSSProperties,
};


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

  const router = useRouter();

  const goToHome = () => {
    router.push('/');
  }

  const goToDrawing = () => {
    router.push('/drawingPractice');
  }



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
      <>
        <div style={styles.container}>
          <h1 style={{textAlign:'center', marginBottom:'10px'}}>Flashcards</h1>
          <p style={{textAlign:'center', color:'#555', marginTop:0}}>Tap a card to reveal the answer</p>

          <div style={styles.topNav}>
            <button style={styles.btn} onClick={goToHome}>Home</button>
            <button style={styles.btn} onClick={goToDrawing}>Drawing Practice</button>
            <button style={styles.btn} onClick={() => router.push('/test')}>Test Mode</button>
          </div>

          <FlashcardList flashcards={flashcards}/>
        </div>
      </>
);
};
