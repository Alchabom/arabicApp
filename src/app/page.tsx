"use client";

import React from "react";

// Data array with letter and name
const squareData = [
  { letter: "أ", name: "Alif" }, { letter: "ب", name: "Ba" }, { letter: "ت", name: "Ta" },
  { letter: "ث", name: "Tha" }, { letter: "ج", name: "Jim" }, { letter: "ح", name: "Ha" },
  { letter: "خ", name: "Kha" }, { letter: "د", name: "Dal" }, { letter: "ذ", name: "Dhal" },
  { letter: "ر", name: "Ra" }, { letter: "ز", name: "Zain" }, { letter: "س", name: "Sin" },
  { letter: "ش", name: "Shin" }, { letter: "ص", name: "Sad" }, { letter: "ض", name: "Dad" },
  { letter: "ط", name: "Ta'" }, { letter: "ظ", name: "Dha'" }, { letter: "ع", name: "Ayn" },
  { letter: "غ", name: "Ghayn" }, { letter: "ف", name: "Fa" }, { letter: "ق", name: "Qaf" },
  { letter: "ك", name: "Kaf" }, { letter: "ل", name: "Lam" }, { letter: "م", name: "Mim" },
  { letter: "ن", name: "Nun" }, { letter: "ه", name: "Ha'" }, { letter: "و", name: "Waw" },
  { letter: "ي", name: "Ya" }
];

const HomePage: React.FC = () => {
  return (
    <div style={styles.pageContainer}>
      <header style={styles.header}>
        Arabic App
      </header>

      <div style={styles.gridContainer}>
        {/* Render squares */}
        {Array.from({ length: 28 }).map((_, index) => {
          // Get data for the square, provide default empty values
          const { letter, name } = squareData[index] ?? { letter: '', name: '' };

          return (
            <div
              key={index}
              style={styles.squareBase} // Base styles for the square
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = styles.squareHover.backgroundColor;
                e.currentTarget.style.borderColor = styles.squareHover.borderColor;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = styles.squareBase.backgroundColor!;
                e.currentTarget.style.borderColor = styles.squareBase.borderColor!;
              }}
            >
              {/* Arabic Letter */}
              <span style={styles.arabicLetter}>
                {letter}
              </span>
              {/* Letter Name */}
              {name && ( // Only render name span if name exists
                <span style={styles.letterName}>
                  {name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Button Container */}
      <div style={styles.footerContainer}>
         {/* Buttons remain the same... */}
         <button style={styles.buttonBase} onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.buttonBase.backgroundColor!}>Page 1</button>
         <button style={styles.buttonBase} onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.buttonBase.backgroundColor!}>Page 2</button>
         <button style={styles.buttonBase} onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor} onMouseOut={(e) => e.currentTarget.style.backgroundColor = styles.buttonBase.backgroundColor!}>Page 3</button>
      </div>
    </div>
  );
};

// Group styles together for better readability
const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100vh",
    padding: "20px",
    boxSizing: 'border-box',
  } as React.CSSProperties, // Added type assertion for clarity
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
    width: 'fit-content',
    margin: '0 auto 20px auto',
  } as React.CSSProperties,
  squareBase: {
    width: "70px",
    height: "70px",
    backgroundColor: "#f0f0f0",
    border: "2px solid #ccc",
    display: "flex",
    flexDirection: "column", // Stack items vertically
    alignItems: "center", // Center items horizontally
    justifyContent: "center", // Center items vertically
    cursor: "pointer",
    transition: "background-color 0.3s, border-color 0.3s",
    fontFamily: "Arial, sans-serif",
    boxSizing: 'border-box',
    padding: '5px 0', // Add some vertical padding inside the box
    userSelect: 'none',
    pointerEvents: 'auto',
  } as React.CSSProperties,
  squareHover: {
     backgroundColor: "#e0e0e0",
     borderColor: "#999",
  },
  arabicLetter: {
    fontSize: "1.8rem", // Size for the Arabic letter
    fontWeight: "bold",
    color: "#444",
    lineHeight: '1.1', // Adjust line height if needed
  } as React.CSSProperties,
  letterName: {
    fontSize: "0.65rem", // Smaller font size for the name
    color: "#666",
    marginTop: "4px", // Space between letter and name
    textAlign: 'center' as const, // Ensure name is centered if it wraps
  } as React.CSSProperties,
  footerContainer: {
    marginTop: "auto",
    paddingTop: "20px",
    marginBottom: "20px",
  } as React.CSSProperties,
   buttonBase: {
    padding: "10px 15px", margin: "5px", fontSize: "1rem", color: "white",
    backgroundColor: "#007bff", border: "none", borderRadius: "5px",
    cursor: "pointer", transition: "background-color 0.3s",
  } as React.CSSProperties,
  buttonHover: {
      backgroundColor: "#0056b3"
  }
};

export default HomePage;