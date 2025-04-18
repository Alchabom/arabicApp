"use client";

import React from "react";

/**
 * HomePage is a functional React component that renders the main layout of the Arabic App.
 *
 * Features:
 * - A vertically centered structure using flexbox to manage the overall layout.
 * - A styled header displaying the title "Arabic App".
 * - A grid of 28 interactive squares displayed in a 7-column by 3-row layout.
 *   Each square changes background color when hovered and reverts when the mouse moves away.
 * - A footer section containing three interactive buttons to represent navigation pages.
 *   Buttons change their background color on hover and revert to the original color on mouse out.
 *
 * Styling:
 * - The component includes inline styles for layout and design, including responsiveness
 *   for proper alignment and spacing of elements.
 *
 *   TODO
 *    * Put arabic letters in boxes
 *    * Clean up spacing/Style
 *    *Implement functional buttons
 *
 */
const HomePage: React.FC = () => {
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                height: "100vh",
            }}
        >
            <header
                style={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                    margin: "20px 0",
                }}
            >
                Arabic App
            </header>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)", // 7 columns
                    gridTemplateRows: "repeat(3, 100px)", // 3 rows
                    gap: "20px", // Spacing between squares
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                {/* Render 28 squares */}
                {Array.from({ length: 28 }).map((_, index) => (
                    <div
                        key={index}
                        style={{
                            width: "70px",
                            height: "70px",
                            backgroundColor: "#f0f0f0",
                            border: "2px solid #ccc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.3s",
                        }}
                        onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor = "#e0e0e0")
                        }
                        onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f0f0f0")
                        }
                    ></div>
                ))}
            </div>
            <div
                style={{
                    marginTop: "auto",
                    marginBottom: "20px",
                }}
            >
                <button
                    style={{
                        padding: "10px 15px",
                        margin: "5px",
                        fontSize: "1rem",
                        color: "white",
                        backgroundColor: "#007bff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#0056b3")
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#007bff")
                    }
                >
                    Page 1
                </button>
                <button
                    style={{
                        padding: "10px 15px",
                        margin: "5px",
                        fontSize: "1rem",
                        color: "white",
                        backgroundColor: "#007bff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#0056b3")
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#007bff")
                    }
                >
                    Page 2
                </button>
                <button
                    style={{
                        padding: "10px 15px",
                        margin: "5px",
                        fontSize: "1rem",
                        color: "white",
                        backgroundColor: "#007bff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        transition: "background-color 0.3s",
                    }}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor = "#0056b3")
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "#007bff")
                    }
                >
                    Page 3
                </button>
            </div>
        </div>
    );
};

export default HomePage;