"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function DrawingPracticePage() {
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    // State for drawing properties
    const [isPainting, setIsPainting] = useState(false);
    const [lineWidth, setLineWidth] = useState(5);
    const [strokeColor, setStrokeColor] = useState('#000000');

    // Effect to initialize the canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas dimensions to fill its container
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const context = canvas.getContext('2d');
        if (!context) return;

        context.lineCap = 'round';
        context.strokeStyle = strokeColor;
        context.lineWidth = lineWidth;
        contextRef.current = context;
    }, []); // Runs once on component mount

    // Effect to update context when properties change
    useEffect(() => {
        if (contextRef.current) {
            contextRef.current.strokeStyle = strokeColor;
            contextRef.current.lineWidth = lineWidth;
        }
    }, [lineWidth, strokeColor]);

    // --- Drawing Event Handlers ---

    const startPainting = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        if (contextRef.current) {
            contextRef.current.beginPath();
            contextRef.current.moveTo(offsetX, offsetY);
        }
        setIsPainting(true);
    };

    const stopPainting = () => {
        if (contextRef.current) {
            contextRef.current.closePath();
        }
        setIsPainting(false);
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isPainting) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        if (contextRef.current) {
            contextRef.current.lineTo(offsetX, offsetY);
            contextRef.current.stroke();
        }
    };

    // --- Toolbar Actions ---

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (canvas && context) {
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    // --- Navigation ---

    const goToHome = () => router.push('/');
    const goToFlash = () => router.push('/flashLearning');

    return (
        <>
            {/* We use a style tag here to inject the specific styles you had. */}
            {/* In a larger app, this would go in a global CSS file. */}
            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    overflow: hidden;
                    background-color: #f5f5f5;
                }
                .drawing-app-container {
                    height: 100vh;
                    display: flex;
                }
                #toolbar {
                    display: flex;
                    flex-direction: column;
                    padding: 10px;
                    width: 200px;
                    background-color: #202020;
                    color: white;
                }
                #toolbar > * {
                    margin-bottom: 12px;
                }
                #toolbar h1 {
                    background: -webkit-linear-gradient(to right, #91EAE4, #86A8E7, #7F7FD5);
                    background: linear-gradient(to right, #91EAE4, #86A8E7, #7F7FD5);
                    background-clip: text;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    font-size: 2rem;
                    margin-bottom: 20px;
                }
                #toolbar label {
                    font-size: 14px;
                }
                #toolbar input[type="color"] {
                    width: 100%;
                    height: 30px;
                    border: 1px solid #555;
                    border-radius: 4px;
                }
                #toolbar input[type="number"] {
                    width: 100%;
                    padding: 5px;
                    border-radius: 4px;
                    border: 1px solid #555;
                    background-color: #333;
                    color: white;
                }
                #toolbar button {
                    background-color: #1565c0;
                    border: none;
                    border-radius: 4px;
                    color: white;
                    padding: 10px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                #toolbar button:hover {
                    background-color: #1976d2;
                }
                .drawing-board-container {
                    flex-grow: 1;
                    padding: 10px;
                    background-color: #e0e0e0;
                }
                #drawing-board {
                    width: 100%;
                    height: 100%;
                    background-color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }
                .nav-button-container {
                    position: absolute;
                    bottom: 20px;
                    left: 20px;
                }
                .nav-button {
                    padding: 10px 15px;
                    margin-right: 10px;
                    font-size: 1rem;
                    color: white;
                    background-color: #007bff;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                .nav-button:hover {
                    background-color: #0056b3;
                }
            `}</style>

            <section className="drawing-app-container">
                <div id="toolbar">
                    <h1>Draw.</h1>

                    <label htmlFor="stroke">Stroke Color</label>
                    <input
                        id="stroke"
                        name='stroke'
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                    />

                    <label htmlFor="lineWidth">Line Width</label>
                    <input
                        id="lineWidth"
                        name='lineWidth'
                        type="number"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                    />

                    <button id="clear" onClick={clearCanvas}>Clear</button>

                    <div className="nav-button-container">
                        <button className="nav-button" onClick={goToHome}>Home</button>
                        <button className="nav-button" onClick={goToFlash}>Flashcards</button>
                    </div>
                </div>

                <div className="drawing-board-container">
                    <canvas
                        id="drawing-board"
                        ref={canvasRef}
                        onMouseDown={startPainting}
                        onMouseUp={stopPainting}
                        onMouseMove={draw}
                        onMouseLeave={stopPainting} // Stop drawing if mouse leaves canvas
                    />
                </div>
            </section>
        </>
    );
}
