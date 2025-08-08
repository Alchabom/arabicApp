"use client";

import React, { useEffect, useState } from "react";
import LetterModal from "./LetterModal";
import { useRouter } from "next/navigation";

interface Letter {
  id: number;
  letter: string;
  name: string;
  transliteration?: string;
  audioUrl?: string;
  forms?: {
    isolated: string;
    initial: string;
    medial: string;
    final: string;
  };
}

// Group styles together for better readability
const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    boxSizing: "border-box",
  } as React.CSSProperties,
  header: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "20px 0 40px 0",
    color: "#333",
  } as React.CSSProperties,
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 70px)",
    gap: "15px",
    justifyContent: "center",
    width: "fit-content",
    margin: "0 auto 20px auto",
  } as React.CSSProperties,
  squareBase: {
    width: "70px",
    height: "70px",
    backgroundColor: "#f0f0f0",
    border: "2px solid #ccc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background-color 0.3s, border-color 0.3s",
    fontFamily: "Arial, sans-serif",
    boxSizing: "border-box",
    padding: "5px 0",
    userSelect: "none",
    pointerEvents: "auto",
  } as React.CSSProperties,
  squareHover: {
    backgroundColor: "#e0e0e0",
    borderColor: "#999",
  },
  arabicLetter: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    color: "#444",
    lineHeight: "1.1",
  } as React.CSSProperties,
  letterName: {
    fontSize: "0.65rem",
    color: "#666",
    marginTop: "4px",
    textAlign: "center" as const,
  } as React.CSSProperties,
  footerContainer: {
    marginTop: "auto",
    paddingTop: "20px",
    marginBottom: "20px",
  } as React.CSSProperties,
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
};

const HomePage: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();

  const goToFlash = () => {
    router.push('/flashLearning');
  }

  const goToDrawing = () => {
    router.push('/drawingPractice');
  }

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const response = await fetch("/api/letters");
        if (!response.ok) {
          throw new Error("Failed to fetch letters.");
        }
        const data: Letter[] = await response.json();
        setLetters(data);
      } catch (error) {
        console.error("Error fetching letters: ", error);
      }
    };

    fetchLetters();
  }, []);

  const handleLetterClick = (letter: Letter) => {
    setSelectedLetter(letter);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedLetter(null);
    setShowModal(false);
  };

  return (
      <>
        <div style={styles.pageContainer}>
          <header style={styles.header}>Arabic App</header>

          <div style={styles.gridContainer}>
            {letters.map((data, index) => (
                <div
                    key={data.id || index}
                    style={styles.squareBase}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor =
                          styles.squareHover.backgroundColor;
                      e.currentTarget.style.borderColor =
                          styles.squareHover.borderColor;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor =
                          styles.squareBase.backgroundColor!;
                      e.currentTarget.style.borderColor =
                          styles.squareBase.border as string;
                    }}
                    onClick={() => handleLetterClick(data)}
                >
                  <span style={styles.arabicLetter}>{data.letter}</span>
                  {data.name && (
                      <span style={styles.letterName}>{data.name}</span>
                  )}
                </div>
            ))}
          </div>

          <div style={styles.footerContainer}>
            <button
                style={styles.buttonBase}
                onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        styles.buttonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        styles.buttonBase.backgroundColor!)
                }
                onClick={() => goToFlash()}
            >
              Flashcards
            </button>
            <button
                style={styles.buttonBase}
                onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        styles.buttonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        styles.buttonBase.backgroundColor!)
                }
                onClick={() => goToDrawing()}
            >
             Drawing Practice
            </button>
            <button
                style={styles.buttonBase}
                onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        styles.buttonHover.backgroundColor)
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor =
                        styles.buttonBase.backgroundColor!)
                }
            >
              Page 3
            </button>
          </div>
        </div>


        {showModal && selectedLetter && (
            <LetterModal letter={selectedLetter} onClose={handleCloseModal} />
        )}
      </>
  );
};


export default HomePage;
