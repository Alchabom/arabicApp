"use client";
import React, { useEffect } from "react";
import FlashcardList from './flashcardList';
import './app.css';
import { useRouter } from "next/navigation";

const styles = {
  container: {
    maxWidth: '900',
    margin: '0 auto',
    padding: '20px',
    boxSizing: 'border-box' as const,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    padding: '1rem',
    width: '100%',
  },
  buttonBase: {
    padding: "10px 15px",
    margin: "5px",
    fontSize: "1rem",
    color: "white",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background-color 0.3s",
  } as React.CSSProperties,
  buttonHover: {
    backgroundColor: "#0056b3",
  },
  buttonContainer: {
    textAlign: 'center' as const,
    padding: '20px 0', // Optional: Adds some space around the buttons
  }
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
          <FlashcardList flashcards={flashcards}/>
        </div>
        <div style={styles.buttonContainer}>
          <button
              style={styles.buttonBase}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor =
                  styles.buttonHover.backgroundColor)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor =
                  styles.buttonBase.backgroundColor!)}
              onClick={() => goToHome()}
          >
            Home
          </button>
          <button
              style={styles.buttonBase}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor =
                  styles.buttonHover.backgroundColor)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor =
                  styles.buttonBase.backgroundColor!)}
              onClick={() => goToDrawing()}
          >
            Drawing Practice
          </button>
          <button
              style={styles.buttonBase}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor =
                  styles.buttonHover.backgroundColor)}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor =
                  styles.buttonBase.backgroundColor!)}
          >
            Page 3
          </button>
        </div>
      </>
);
};
