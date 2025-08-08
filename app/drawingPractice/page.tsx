
"use client"
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';


const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        padding: '20px',
        background: '#f5f5f5',
        minHeight: '100vh',
    },
    buttonContainer: {
        marginTop: '20px',
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
    },
    buttonHover: {
        backgroundColor: "#0056b3",
    },
};
export default function DrawingPracticePage() {


    const router = useRouter();

    const goToHome = () => {
        router.push('/');
    };

    const goToFlash = () => {
        router.push('/flashLearning');
    };

    return (

        <div style={styles.buttonContainer}>
            <button
                style={styles.buttonBase}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.buttonBase.backgroundColor)}
                onClick={goToHome}
            >
                Home
            </button>
            <button
                style={styles.buttonBase}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.buttonBase.backgroundColor)}
                onClick={goToFlash}
            >
                Flashcards
            </button>
            <button
                style={styles.buttonBase}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor)}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = styles.buttonBase.backgroundColor)}
            >
                Page 3
            </button>
        </div>


    );
}
