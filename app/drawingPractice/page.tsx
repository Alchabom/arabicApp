"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LetterModal from '../LetterModal';

export default function DrawingPracticePage() {
  const router = useRouter();

  // Canvas + contexts
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  // Offscreen canvases for masks (for IoU/coverage scoring)
  const targetMaskRef = useRef<HTMLCanvasElement | null>(null);
  const drawMaskRef = useRef<HTMLCanvasElement | null>(null);

  // DPR
  const dprRef = useRef<number>(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  // UI state
  const [isPainting, setIsPainting] = useState(false);
  const [lineWidth, setLineWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState('#1f2937');
  interface Letter { id: number; letter: string; name: string; transliteration?: string; audioUrl?: string; forms?: { isolated: string; initial: string; medial: string; final: string; }; }
  type ArabicLetter = 'alif' | 'ba' | 'ta' | 'tha' | 'jeem' | 'ha' | 'kha' | 'dal' | 'thal' | 'ra' | 'zay' | 'seen' | 'sheen' | 'sad' | 'dad' | 'ta2' | 'za' | 'ain' | 'ghain' | 'fa' | 'qaf' | 'kaf' | 'lam' | 'meem' | 'noon' | 'ha2' | 'waw' | 'ya' | 'hamza';
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter>('alif');
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedLetterObj, setSelectedLetterObj] = useState<Letter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState<{ coverage: number; iou: number } | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  // Guide path
  const guidePathRef = useRef<Path2D | null>(null);

  // Position tracking
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const getSize = useCallback(() => {
    const parent = canvasRef.current?.parentElement;
    if (!parent) return { width: 800, height: 600 };
    const styles = window.getComputedStyle(parent);
    const paddingX = parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const width = Math.max(300, parent.clientWidth - paddingX);
    const height = Math.max(300, parent.clientHeight - paddingY);
    return { width, height };
  }, []);

  // Build a visual guide by rendering the selected flashcard glyph into a Path2D-like mask.
  // Instead of mathematically constructing every letter path, we paint the flashcard glyph text
  // to an offscreen canvas and use that as the tracing target. The drawn guide on the main canvas
  // is then a faint image of that glyph (stroke-like), while users can still only draw on this page.
  const buildGuidePath = useCallback((w: number, h: number, letter: ArabicLetter): Path2D => {
    const p = new Path2D();
    const centerX = w * 0.55;
    const centerY = h * 0.55;
    const baselineY = h * 0.65;

    const circle = (cx: number, cy: number, r: number) => {
      const c = new Path2D();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      return c;
    };

    switch (letter) {
      case 'alif': {
        const x = Math.round(w * 0.7);
        const top = Math.round(h * 0.15);
        const bottom = Math.round(h * 0.85);
        p.moveTo(x, top);
        p.lineTo(x, bottom);
        break;
      }
      case 'ba': {
        // ب isolated: shallow bowl along baseline, tail to the right, dot below left of center
        const y = baselineY - h * 0.03;
        const sx = w * 0.20;
        p.moveTo(sx, y);
        p.bezierCurveTo(w * 0.34, y - h * 0.08, w * 0.56, y - h * 0.06, w * 0.68, y);
        p.quadraticCurveTo(w * 0.78, y + h * 0.04, w * 0.80, y);
        // dot below bowl
        p.addPath(circle(w * 0.40, baselineY + h * 0.06, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'ta': {
        // similar to ba with two dots above
        const sx = w * 0.2, sy = baselineY - h * 0.05;
        p.moveTo(sx, sy);
        p.bezierCurveTo(w * 0.45, h * 0.35, w * 0.75, h * 0.85, w * 0.82, baselineY - h * 0.05);
        p.addPath(circle(w * 0.62, baselineY - h * 0.18, Math.max(3, Math.min(w, h) * 0.012)));
        p.addPath(circle(w * 0.68, baselineY - h * 0.24, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'tha': {
        // similar curve with three dots above
        const sx = w * 0.2, sy = baselineY - h * 0.05;
        p.moveTo(sx, sy);
        p.bezierCurveTo(w * 0.45, h * 0.35, w * 0.75, h * 0.85, w * 0.82, baselineY - h * 0.05);
        const r = Math.max(3, Math.min(w, h) * 0.010);
        p.addPath(circle(w * 0.60, baselineY - h * 0.22, r));
        p.addPath(circle(w * 0.66, baselineY - h * 0.26, r));
        p.addPath(circle(w * 0.72, baselineY - h * 0.22, r));
        break;
      }
      case 'jeem': {
        // bowl with tail and dot below
        p.moveTo(centerX + w * 0.18, baselineY - h * 0.18);
        p.bezierCurveTo(centerX - w * 0.05, baselineY - h * 0.35, centerX - w * 0.2, baselineY, centerX + w * 0.05, baselineY + h * 0.05);
        p.bezierCurveTo(centerX + w * 0.2, baselineY + h * 0.12, centerX + w * 0.18, baselineY - h * 0.08, centerX - w * 0.02, baselineY - h * 0.1);
        // dot below
        p.addPath(circle(centerX + w * 0.05, baselineY + h * 0.12, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'ha': {
        // open bowl (ح)
        p.moveTo(centerX + w * 0.18, baselineY - h * 0.18);
        p.bezierCurveTo(centerX - w * 0.05, baselineY - h * 0.35, centerX - w * 0.22, baselineY - h * 0.02, centerX + w * 0.02, baselineY + h * 0.02);
        p.bezierCurveTo(centerX + w * 0.18, baselineY + h * 0.10, centerX + w * 0.16, baselineY - h * 0.02, centerX + w * 0.04, baselineY - h * 0.06);
        break;
      }
      case 'kha': {
        // like jeem with a dot above
        p.moveTo(centerX + w * 0.18, baselineY - h * 0.18);
        p.bezierCurveTo(centerX - w * 0.05, baselineY - h * 0.35, centerX - w * 0.2, baselineY, centerX + w * 0.05, baselineY + h * 0.05);
        p.bezierCurveTo(centerX + w * 0.2, baselineY + h * 0.12, centerX + w * 0.18, baselineY - h * 0.08, centerX - w * 0.02, baselineY - h * 0.1);
        p.addPath(circle(centerX + w * 0.06, baselineY - h * 0.24, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'dal': {
        // simple downward curve (د)
        p.moveTo(w * 0.25, baselineY - h * 0.1);
        p.quadraticCurveTo(w * 0.55, baselineY - h * 0.25, w * 0.78, baselineY);
        break;
      }
      case 'thal': {
        // like dal with a dot above (ذ)
        p.moveTo(w * 0.25, baselineY - h * 0.1);
        p.quadraticCurveTo(w * 0.55, baselineY - h * 0.25, w * 0.78, baselineY);
        p.addPath(circle(w * 0.7, baselineY - h * 0.22, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'ra': {
        // curved ra (ر)
        p.moveTo(w * 0.3, baselineY - h * 0.05);
        p.quadraticCurveTo(w * 0.55, baselineY - h * 0.25, w * 0.8, baselineY - h * 0.02);
        break;
      }
      case 'zay': {
        // like ra with dot above (ز)
        p.moveTo(w * 0.3, baselineY - h * 0.05);
        p.quadraticCurveTo(w * 0.55, baselineY - h * 0.25, w * 0.8, baselineY - h * 0.02);
        p.addPath(circle(w * 0.7, baselineY - h * 0.22, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'seen': {
        // three teeth baseline
        const y = baselineY - h * 0.04;
        p.moveTo(w * 0.18, y);
        p.quadraticCurveTo(w * 0.28, y - h * 0.08, w * 0.38, y);
        p.quadraticCurveTo(w * 0.48, y - h * 0.08, w * 0.58, y);
        p.quadraticCurveTo(w * 0.68, y - h * 0.08, w * 0.78, y);
        break;
      }
      case 'sheen': {
        // seen + three dots above middle
        const y = baselineY - h * 0.04;
        p.moveTo(w * 0.18, y);
        p.quadraticCurveTo(w * 0.28, y - h * 0.08, w * 0.38, y);
        p.quadraticCurveTo(w * 0.48, y - h * 0.08, w * 0.58, y);
        p.quadraticCurveTo(w * 0.68, y - h * 0.08, w * 0.78, y);
        const r = Math.max(3, Math.min(w, h) * 0.010);
        p.addPath(circle(w * 0.40, y - h * 0.16, r));
        p.addPath(circle(w * 0.46, y - h * 0.20, r));
        p.addPath(circle(w * 0.52, y - h * 0.16, r));
        break;
      }
      case 'sad': {
        // emphatic seen with deeper curves
        const y = baselineY - h * 0.05;
        p.moveTo(w * 0.16, y);
        p.quadraticCurveTo(w * 0.3, y - h * 0.12, w * 0.42, y);
        p.quadraticCurveTo(w * 0.56, y - h * 0.12, w * 0.7, y);
        break;
      }
      case 'dad': {
        // sad + dot above at end
        const y = baselineY - h * 0.05;
        p.moveTo(w * 0.16, y);
        p.quadraticCurveTo(w * 0.3, y - h * 0.12, w * 0.42, y);
        p.quadraticCurveTo(w * 0.56, y - h * 0.12, w * 0.7, y);
        p.addPath(circle(w * 0.64, y - h * 0.16, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'ta2': {
        // ط isolated: vertical then bowl
        p.moveTo(w * 0.62, baselineY - h * 0.35);
        p.lineTo(w * 0.62, baselineY + h * 0.05);
        p.bezierCurveTo(w * 0.62, baselineY + h * 0.10, w * 0.46, baselineY + h * 0.10, w * 0.42, baselineY);
        p.bezierCurveTo(w * 0.40, baselineY - h * 0.12, w * 0.52, baselineY - h * 0.20, w * 0.62, baselineY - h * 0.10);
        p.addPath(circle(w * 0.66, baselineY - h * 0.42, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'za': {
        // ظ like ط with dot above
        p.moveTo(w * 0.62, baselineY - h * 0.35);
        p.lineTo(w * 0.62, baselineY + h * 0.05);
        p.bezierCurveTo(w * 0.62, baselineY + h * 0.10, w * 0.46, baselineY + h * 0.10, w * 0.42, baselineY);
        p.bezierCurveTo(w * 0.40, baselineY - h * 0.12, w * 0.52, baselineY - h * 0.20, w * 0.62, baselineY - h * 0.10);
        p.addPath(circle(w * 0.66, baselineY - h * 0.48, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'ain': {
        // ع shape: loop then tail
        p.moveTo(w * 0.72, baselineY - h * 0.18);
        p.bezierCurveTo(w * 0.62, baselineY - h * 0.36, w * 0.38, baselineY - h * 0.36, w * 0.36, baselineY - h * 0.10);
        p.bezierCurveTo(w * 0.34, baselineY + h * 0.05, w * 0.54, baselineY + h * 0.10, w * 0.66, baselineY + h * 0.02);
        break;
      }
      case 'ghain': {
        // غ like ain with two dots above
        p.moveTo(w * 0.72, baselineY - h * 0.18);
        p.bezierCurveTo(w * 0.62, baselineY - h * 0.36, w * 0.38, baselineY - h * 0.36, w * 0.36, baselineY - h * 0.10);
        p.bezierCurveTo(w * 0.34, baselineY + h * 0.05, w * 0.54, baselineY + h * 0.10, w * 0.66, baselineY + h * 0.02);
        p.addPath(circle(w * 0.56, baselineY - h * 0.26, Math.max(3, Math.min(w, h) * 0.012)));
        p.addPath(circle(w * 0.62, baselineY - h * 0.32, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'fa': {
        // ف: cup with one dot above
        p.moveTo(w * 0.3, baselineY - h * 0.12);
        p.bezierCurveTo(w * 0.4, baselineY - h * 0.28, w * 0.66, baselineY - h * 0.28, w * 0.66, baselineY - h * 0.08);
        p.bezierCurveTo(w * 0.66, baselineY + h * 0.02, w * 0.50, baselineY + h * 0.05, w * 0.44, baselineY);
        p.addPath(circle(w * 0.58, baselineY - h * 0.26, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'qaf': {
        // ق: cup with two dots above
        p.moveTo(w * 0.28, baselineY - h * 0.1);
        p.bezierCurveTo(w * 0.42, baselineY - h * 0.3, w * 0.7, baselineY - h * 0.3, w * 0.7, baselineY - h * 0.06);
        p.bezierCurveTo(w * 0.7, baselineY + h * 0.04, w * 0.5, baselineY + h * 0.08, w * 0.42, baselineY + h * 0.02);
        p.addPath(circle(w * 0.60, baselineY - h * 0.28, Math.max(3, Math.min(w, h) * 0.012)));
        p.addPath(circle(w * 0.67, baselineY - h * 0.32, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'kaf': {
        // ك: vertical and bowl
        p.moveTo(w * 0.68, baselineY - h * 0.32);
        p.lineTo(w * 0.68, baselineY);
        p.bezierCurveTo(w * 0.62, baselineY + h * 0.06, w * 0.40, baselineY + h * 0.04, w * 0.38, baselineY - h * 0.06);
        p.bezierCurveTo(w * 0.36, baselineY - h * 0.16, w * 0.56, baselineY - h * 0.22, w * 0.62, baselineY - h * 0.14);
        break;
      }
      case 'lam': {
        // ل: tall vertical with slight curve
        p.moveTo(w * 0.66, baselineY - h * 0.45);
        p.lineTo(w * 0.66, baselineY - h * 0.02);
        p.quadraticCurveTo(w * 0.64, baselineY + h * 0.06, w * 0.50, baselineY + h * 0.02);
        break;
      }
      case 'meem': {
        // م: loop near baseline
        p.moveTo(w * 0.30, baselineY - h * 0.06);
        p.bezierCurveTo(w * 0.46, baselineY - h * 0.24, w * 0.70, baselineY - h * 0.12, w * 0.62, baselineY + h * 0.02);
        p.bezierCurveTo(w * 0.54, baselineY + h * 0.12, w * 0.36, baselineY + h * 0.10, w * 0.36, baselineY - h * 0.02);
        break;
      }
      case 'noon': {
        // ن: bowl with one dot above end
        p.moveTo(w * 0.26, baselineY - h * 0.06);
        p.bezierCurveTo(w * 0.40, baselineY - h * 0.22, w * 0.64, baselineY - h * 0.10, w * 0.62, baselineY + h * 0.02);
        p.bezierCurveTo(w * 0.58, baselineY + h * 0.10, w * 0.40, baselineY + h * 0.10, w * 0.38, baselineY);
        p.addPath(circle(w * 0.60, baselineY - h * 0.22, Math.max(3, Math.min(w, h) * 0.012)));
        break;
      }
      case 'ha2': {
        // ه isolated: loop
        p.moveTo(w * 0.56, baselineY - h * 0.30);
        p.bezierCurveTo(w * 0.36, baselineY - h * 0.42, w * 0.30, baselineY - h * 0.02, w * 0.56, baselineY + h * 0.02);
        p.bezierCurveTo(w * 0.76, baselineY + h * 0.06, w * 0.78, baselineY - h * 0.26, w * 0.56, baselineY - h * 0.30);
        break;
      }
      case 'waw': {
        // و: small loop with tail
        p.moveTo(w * 0.30, baselineY - h * 0.02);
        p.quadraticCurveTo(w * 0.46, baselineY - h * 0.24, w * 0.62, baselineY - h * 0.08);
        p.quadraticCurveTo(w * 0.72, baselineY + h * 0.04, w * 0.52, baselineY + h * 0.06);
        break;
      }
      case 'ya': {
        // ي isolated: curve with two dots below
        p.moveTo(w * 0.24, baselineY - h * 0.02);
        p.bezierCurveTo(w * 0.40, baselineY - h * 0.22, w * 0.66, baselineY - h * 0.12, w * 0.64, baselineY + h * 0.02);
        p.bezierCurveTo(w * 0.60, baselineY + h * 0.12, w * 0.40, baselineY + h * 0.10, w * 0.36, baselineY);
        const r = Math.max(3, Math.min(w, h) * 0.012);
        p.addPath(circle(w * 0.46, baselineY + h * 0.08, r));
        p.addPath(circle(w * 0.52, baselineY + h * 0.12, r));
        break;
      }
      case 'hamza': {
        // ء isolated: small hamza shape above baseline
        const cx = w * 0.55;
        const cy = baselineY - h * 0.18;
        p.moveTo(cx - w * 0.03, cy);
        p.quadraticCurveTo(cx - w * 0.00, cy - h * 0.03, cx + w * 0.02, cy);
        p.quadraticCurveTo(cx + w * 0.00, cy + h * 0.03, cx - w * 0.02, cy + h * 0.01);
        break;
      }
      default: {
        // fallback: simple baseline curve
        p.moveTo(w * 0.2, baselineY - h * 0.05);
        p.bezierCurveTo(w * 0.45, h * 0.35, w * 0.75, h * 0.85, w * 0.82, baselineY - h * 0.05);
      }
    }

    return p;
  }, []);

  // Render the selected flashcard glyph onto the target mask (for scoring)
  // and also return a canvas snapshot to draw faintly on the main canvas as a guide.
  const renderGlyphGuide = useCallback((width: number, height: number) => {
    const dpr = dprRef.current;
    const tmask = targetMaskRef.current;
    if (!tmask) return;
    const tctx = tmask.getContext('2d')!;

    // Clear previous
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, width, height);

    // Decide which glyph to display: prefer exact letter glyph; fallback to isolated form
    const glyph = selectedLetterObj?.letter || selectedLetterObj?.forms?.isolated || '';
    if (!glyph) return;

    // Typography scaling
    const padding = Math.min(width, height) * 0.08;
    const fontSize = Math.min(width, height) * 0.6; // big, like a flashcard
    tctx.save();
    tctx.fillStyle = '#000';
    tctx.strokeStyle = '#000';
    tctx.lineWidth = Math.max(14, Math.min(width, height) * 0.08);
    tctx.lineJoin = 'round';
    tctx.lineCap = 'round';
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';

    // Use a generic font stack that supports Arabic glyphs for most systems
    tctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif`;

    const cx = width * 0.55; // slightly right for Arabic right-to-left feel
    const cy = height * 0.55;

    // Draw the glyph as a thick stroke to create a "trace lane"
    // Stroke then fill a bit to ensure a contiguous mask.
    tctx.strokeText(glyph, cx, cy);
    tctx.fillText(glyph, cx, cy);
    tctx.restore();
  }, [selectedLetterObj]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = (window.devicePixelRatio || 1);
    dprRef.current = dpr;

    const { width, height } = getSize();

    // Set display size (CSS) and internal pixel size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale drawing to CSS pixels
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;

    // Recreate offscreen masks
    const ensureMask = (ref: React.MutableRefObject<HTMLCanvasElement | null>) => {
      if (!ref.current) ref.current = document.createElement('canvas');
      const m = ref.current!;
      m.width = Math.floor(width * dpr);
      m.height = Math.floor(height * dpr);
      const mctx = m.getContext('2d')!;
      mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      mctx.clearRect(0, 0, width, height);
    };
    ensureMask(targetMaskRef);
    ensureMask(drawMaskRef);

    // Build and draw guide from flashcard glyph instead of math path
    renderGlyphGuide(width, height);
    // For drawing the faint guide outline on the visible canvas, we will approximate
    // a Path2D by stroking text directly within drawGuide using the same rendering.
    // To keep the rest of the code intact (which expects a Path2D), we keep a simple
    // placeholder tiny path to avoid null checks.
    guidePathRef.current = new Path2D('M0 0');

    drawGuide();
  }, [buildGuidePath, getSize, selectedLetter]);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { width, height } = canvas.getBoundingClientRect();

    // Clear main canvas
    ctx.clearRect(0, 0, width, height);

    // Redraw user's strokes from drawMask
    const drawMask = drawMaskRef.current;
    if (drawMask) {
      ctx.drawImage(drawMask, 0, 0, drawMask.width / dprRef.current, drawMask.height / dprRef.current);
    }

    // Draw glyph guide faintly by rendering the same glyph text on the visible canvas
    const glyph = selectedLetterObj?.letter || selectedLetterObj?.forms?.isolated || '';
    if (glyph) {
      ctx.save();
      ctx.globalAlpha = 0.18; // faint fill for guide
      ctx.fillStyle = '#111827';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.min(width, height) * 0.6;
      ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif`;
      ctx.fillText(glyph, width * 0.55, height * 0.55);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.35; // slightly darker stroke outline
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.01);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif`;
      ctx.strokeText(glyph, width * 0.55, height * 0.55);
      ctx.restore();
    }
  }, [lineWidth, selectedLetterObj]);

  const updateMasksOnStroke = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dpr = dprRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cssWidth = parseFloat(canvas.style.width || '0');
    const cssHeight = parseFloat(canvas.style.height || '0');

    // Draw to drawMask
    const drawMask = drawMaskRef.current!;
    const dctx = drawMask.getContext('2d')!;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dctx.strokeStyle = '#000';
    dctx.lineWidth = lineWidth;
    dctx.lineCap = 'round';
    dctx.lineJoin = 'round';
    dctx.beginPath();
    dctx.moveTo(from.x, from.y);
    dctx.lineTo(to.x, to.y);
    dctx.stroke();

    // Ensure target mask has the guide stroke
    const tmask = targetMaskRef.current!;
    const tctx = tmask.getContext('2d')!;
    if (tctx.getImageData(0, 0, tmask.width, tmask.height).data.every((v) => v === 0)) {
      // First time: draw the glyph-based guide into target mask (already prepared by renderGlyphGuide)
      // Nothing else to do here because renderGlyphGuide painted the thick glyph to the target mask.
      // We still keep this block for structure compatibility.
    }

    // Redraw main canvas
    drawGuide();

    // Update score
    computeScore(cssWidth, cssHeight);
  }, [lineWidth, drawGuide]);

  const computeScore = (cssWidth: number, cssHeight: number) => {
    const dpr = dprRef.current;
    const tmask = targetMaskRef.current;
    const dmask = drawMaskRef.current;
    if (!tmask || !dmask) return;

    const w = Math.floor(cssWidth * dpr);
    const h = Math.floor(cssHeight * dpr);

    const tctx = tmask.getContext('2d')!;
    const dctx = dmask.getContext('2d')!;

    const tData = tctx.getImageData(0, 0, w, h).data;
    const dData = dctx.getImageData(0, 0, w, h).data;

    let inter = 0; // intersection
    let union = 0; // union
    let targetOn = 0; // guide coverage baseline

    // Count by alpha channel presence
    for (let i = 0; i < tData.length; i += 4) {
      const tOn = tData[i + 3] > 0;
      const dOn = dData[i + 3] > 0;
      if (tOn) targetOn++;
      if (tOn || dOn) union++;
      if (tOn && dOn) inter++;
    }

    const coverage = targetOn ? inter / targetOn : 0; // % of guide covered by drawing
    const iou = union ? inter / union : 0; // IoU between drawn and guide

    setScore({ coverage, iou });
    let fb = '';
    if (coverage > 0.8 && iou > 0.5) fb = 'Great job!';
    else if (coverage > 0.5) fb = 'Good! Try to stay closer to the guide.';
    else fb = 'Keep practicing. Trace along the guide path.';
    setFeedback(fb);
  };

  // Events
  const toLocal = (e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    const me = e as MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  };

  const startPainting = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsPainting(true);
    const pos = toLocal(e.nativeEvent as any);
    lastPosRef.current = pos;
  };

  const stopPainting = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    setIsPainting(false);
    lastPosRef.current = null;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isPainting) return;
    e.preventDefault();

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const current = toLocal(e.nativeEvent as any);
    const last = lastPosRef.current || current;

    // Draw on main canvas for immediate feedback
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(current.x, current.y);
    ctx.stroke();

    // Update masks & guide
    updateMasksOnStroke(last, current);

    lastPosRef.current = current;
  };

  // Clear drawing (but keep guide)
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { width, height } = canvas.getBoundingClientRect();

    // Clear main and draw mask
    ctx.clearRect(0, 0, width, height);
    const dmask = drawMaskRef.current;
    if (dmask) {
      const dctx = dmask.getContext('2d')!;
      dctx.clearRect(0, 0, dmask.width, dmask.height);
    }

    drawGuide();
    setScore(null);
    setFeedback('');
  };

  // Navigation
  const goToHome = () => router.push('/');
  const goToFlash = () => router.push('/flashLearning');

  // Load letters from API and map to internal type
  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const res = await fetch('/api/letters');
        if (!res.ok) throw new Error('Failed to fetch letters');
        const data: Letter[] = await res.json();
        setLetters(data);
        // If nothing selected yet, default to Alif if present, else first
        const defaultLetter = data.find(l => l.letter === 'أ' || l.forms?.isolated === 'ا') || data[0];
        if (defaultLetter) {
          setSelectedLetterObj(defaultLetter);
          setSelectedLetter(mapGlyphToArabicLetter(defaultLetter.letter));
        }
      } catch (e) {
        console.error('Error fetching letters', e);
      }
    };
    fetchLetters();
  }, []);

  const mapGlyphToArabicLetter = (glyph: string): ArabicLetter => {
    switch (glyph) {
      case 'أ':
      case 'ا': return 'alif';
      case 'ب': return 'ba';
      case 'ت': return 'ta';
      case 'ث': return 'tha';
      case 'ج': return 'jeem';
      case 'ح': return 'ha';
      case 'خ': return 'kha';
      case 'د': return 'dal';
      case 'ذ': return 'thal';
      case 'ر': return 'ra';
      case 'ز': return 'zay';
      case 'س': return 'seen';
      case 'ش': return 'sheen';
      case 'ص': return 'sad';
      case 'ض': return 'dad';
      case 'ط': return 'ta2';
      case 'ظ': return 'za';
      case 'ع': return 'ain';
      case 'غ': return 'ghain';
      case 'ف': return 'fa';
      case 'ق': return 'qaf';
      case 'ك': return 'kaf';
      case 'ل': return 'lam';
      case 'م': return 'meem';
      case 'ن': return 'noon';
      case 'ه': return 'ha2';
      case 'و': return 'waw';
      case 'ي': return 'ya';
      case 'ء': return 'hamza';
      default: return 'alif';
    }
  };

  // Letter change
  useEffect(() => {
    // When letter changes, rebuild guide and clear drawing
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();

    const tmask = targetMaskRef.current;
    const dmask = drawMaskRef.current;
    if (tmask && dmask) {
      const tctx = tmask.getContext('2d')!;
      const dctx = dmask.getContext('2d')!;
      tctx.clearRect(0, 0, tmask.width, tmask.height);
      dctx.clearRect(0, 0, dmask.width, dmask.height);
    }

    guidePathRef.current = buildGuidePath(width, height, selectedLetter);
    setScore(null);
    setFeedback('');
    drawGuide();
    // Re-render glyph-based guide whenever selection changes
    renderGlyphGuide(width, height);
  }, [selectedLetter, renderGlyphGuide]);

  // Setup + resize
  useEffect(() => {
    resizeCanvas();
    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [resizeCanvas]);

  return (
    <>
      <style jsx>{`
        :root { color-scheme: light; }
        .drawing-app-container { height: 100vh; display: flex; background: #e5e7eb; }
        #toolbar { width: 260px; background: #111827; color: white; padding: 16px; display: flex; flex-direction: column; }
        #toolbar h1 { margin: 0 0 12px; font-size: 1.6rem; }
        #toolbar label { font-size: 0.9rem; margin-top: 8px; }
        #toolbar input, #toolbar select { margin-top: 6px; margin-bottom: 8px; padding: 6px; border-radius: 6px; border: 1px solid #374151; background: #1f2937; color: white; }
        #toolbar .row { display: flex; gap: 8px; align-items: center; }
        #toolbar button { margin-top: 8px; background: #2563eb; border: none; color: white; padding: 10px 12px; border-radius: 6px; cursor: pointer; }
        #toolbar button:hover { background: #1d4ed8; }
        .stats { margin-top: 10px; font-size: 0.9rem; color: #d1d5db; }
        .drawing-board-container { flex: 1; padding: 10px; position: relative; }
        #drawing-board { width: 100%; height: 100%; background: white; border-radius: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.08); touch-action: none; }
        .navs { margin-top: auto; display: flex; gap: 8px; }
      `}</style>

      <section className="drawing-app-container">
        <div id="toolbar">
          <h1>Drawing Practice</h1>

          <label>Letter to trace</label>
          <select
            value={selectedLetterObj ? selectedLetterObj.id : undefined}
            onChange={(e) => {
              const id = Number(e.target.value);
              const letterObj = letters.find(l => l.id === id) || null;
              setSelectedLetterObj(letterObj);
              if (letterObj) setSelectedLetter(mapGlyphToArabicLetter(letterObj.letter));
            }}
          >
            {letters.map(l => (
              <option key={l.id} value={l.id}>
                {l.letter} - {l.name}
              </option>
            ))}
          </select>
          <button onClick={() => setShowModal(true)} disabled={!selectedLetterObj}>Show letter details</button>

          <label>Stroke color</label>
          <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />

          <label>Line width</label>
          <input type="number" min={2} max={40} value={lineWidth} onChange={(e) => setLineWidth(Number(e.target.value) || 1)} />

          <button onClick={clearCanvas}>Clear</button>

          <div className="stats">
            {score ? (
              <>
                <div>Coverage: {(score.coverage * 100).toFixed(0)}%</div>
                <div>IoU: {(score.iou * 100).toFixed(0)}%</div>
                <div>{feedback}</div>
              </>
            ) : (
              <div>Trace the letter along the faint guide.</div>
            )}
          </div>

          <div className="navs">
            <button onClick={goToHome}>Home</button>
            <button onClick={goToFlash}>Flashcards</button>
          </div>
        </div>

        <div className="drawing-board-container">
          <canvas
            id="drawing-board"
            ref={canvasRef}
            onMouseDown={startPainting}
            onMouseUp={stopPainting}
            onMouseMove={draw}
            onMouseLeave={stopPainting}
            onTouchStart={startPainting}
            onTouchEnd={stopPainting}
            onTouchMove={draw}
          />
        </div>
      </section>
      {showModal && selectedLetterObj && (
        <LetterModal letter={selectedLetterObj} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
