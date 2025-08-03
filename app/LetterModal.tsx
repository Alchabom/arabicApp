"use client";
import React, { useState } from "react";

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

    formAudioUrls?: {
        isolated?: string;
        initial?: string;
        medial?: string;
        final?: string;
    };
}

interface LetterModalProps {
    letter: Letter | null;
    onClose: () => void;
}

const modalStyles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    content: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        textAlign: "center",
        minWidth: "300px",
        maxWidth: "90%",
        position: "relative",
    },
    letterDisplay: {
        fontSize: "4.5rem",
        fontWeight: "bold",
        margin: "15px 0",
        color: "#333",
    },
    infoText: {
        fontSize: "1.3rem",
        margin: "8px 0",
        color: "#555",
    },
    formsContainer: {
        display: "flex",
        justifyContent: "space-around",
        margin: "20px 0",
        padding: "15px",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
    },
    formItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    formLetter: {
        fontSize: "2.5rem",
        fontWeight: "bold",
        color: "#333",
        margin: "5px 0",
    },
    formLabel: {
        fontSize: "0.9rem",
        color: "#666",
    },
    transliterationText: {
        fontSize: "0.8rem",
        color: "#666",
        margin: "5px 0",
        textAlign: "center",
    },
    transliterationInput: {
        width: "60px",
        fontSize: "0.8rem",
        padding: "4px",
        margin: "5px 0",
        textAlign: "center",
        border: "1px solid #ccc",
        borderRadius: "4px",
    },
    audioButton: {
        padding: "10px 20px",
        margin: "15px 5px 10px 5px",
        fontSize: "1rem",
        color: "white",
        backgroundColor: "#28a745",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    closeButton: {
        padding: "10px 20px",
        marginTop: "20px",
        fontSize: "1rem",
        color: "white",
        backgroundColor: "#6c757d",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
};

const LetterModal: React.FC<LetterModalProps> = ({ letter, onClose }) => {
    if (!letter) return null;



    const playAudio = (audioUrl?: string) => {
        if (audioUrl) {
            // Audio files are in the public directory and accessed directly
            const audio = new Audio(audioUrl);
            audio.play().catch((e) => console.error("Error playing audio:", e));
        }
    };

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.content} onClick={(e) => e.stopPropagation()}>
                <div style={modalStyles.letterDisplay}>{letter.letter}</div>
                <div style={modalStyles.infoText}>Name: {letter.name}</div>
                {letter.transliteration && (
                    <div style={modalStyles.infoText}>
                        Transliteration: {letter.transliteration}
                    </div>
                )}

                {letter.forms && (
                    <div style={modalStyles.formsContainer}>
                        <div style={modalStyles.formItem}>
                            <div style={modalStyles.formLetter}>{letter.forms.isolated}</div>
                            <div style={modalStyles.formLabel}>Isolated</div>
                            {letter.formAudioUrls?.isolated && (
                                <button 
                                    onClick={() => playAudio(letter.formAudioUrls!.isolated!)}
                                    style={{
                                        ...modalStyles.audioButton,
                                        padding: '5px 10px',
                                        fontSize: '0.8rem',
                                        margin: '5px 0'
                                    }}
                                >
                                    Play
                                </button>
                            )}
                        </div>
                        <div style={modalStyles.formItem}>
                            <div style={modalStyles.formLetter}>{letter.forms.initial}</div>
                            <div style={modalStyles.formLabel}>Initial</div>
                            {letter.formAudioUrls?.initial && (
                                <button 
                                    onClick={() => playAudio(letter.formAudioUrls!.initial!)}
                                    style={{
                                        ...modalStyles.audioButton,
                                        padding: '5px 10px',
                                        fontSize: '0.8rem',
                                        margin: '5px 0'
                                    }}
                                >
                                    Play
                                </button>
                            )}
                        </div>
                        <div style={modalStyles.formItem}>
                            <div style={modalStyles.formLetter}>{letter.forms.medial}</div>
                            <div style={modalStyles.formLabel}>Medial</div>
                            {letter.formAudioUrls?.medial && (
                                <button 
                                    onClick={() => playAudio(letter.formAudioUrls!.medial!)}
                                    style={{
                                        ...modalStyles.audioButton,
                                        padding: '5px 10px',
                                        fontSize: '0.8rem',
                                        margin: '5px 0'
                                    }}
                                >
                                    Play
                                </button>
                            )}
                        </div>
                        <div style={modalStyles.formItem}>
                            <div style={modalStyles.formLetter}>{letter.forms.final}</div>
                            <div style={modalStyles.formLabel}>Final</div>
                            {letter.formAudioUrls?.final && (
                                <button 
                                    onClick={() => playAudio(letter.formAudioUrls!.final!)}
                                    style={{
                                        ...modalStyles.audioButton,
                                        padding: '5px 10px',
                                        fontSize: '0.8rem',
                                        margin: '5px 0'
                                    }}
                                >
                                    Play
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {letter.audioUrl && (
                    <button onClick={() => playAudio(letter.audioUrl)} style={modalStyles.audioButton}>
                        Play Sound
                    </button>
                )}
                <button onClick={onClose} style={modalStyles.closeButton}>
                    Close
                </button>
            </div>
        </div>
    );
};

export default LetterModal;
