"use client"
import React from 'react';
import { Stage, Layer, Line } from 'react-konva';

// Export wrapped Konva components
// This approach helps with SSR compatibility in Next.js

export const KonvaStage: typeof Stage = Stage;
export const KonvaLayer: typeof Layer = Layer;
export const KonvaLine: typeof Line = Line;