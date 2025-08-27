"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// Drawing + tracing for Arabic letters (kept exclusively on this page)
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
  const [selectedLetter, setSelectedLetter] = useState<'alif' | 'ba'>('alif');
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

  const buildGuidePath = useCallback((w: number, h: number, letter: 'alif' | 'ba'): Path2D => {
    const path = new Path2D();
    if (letter === 'alif') {
      const x = Math.round(w * 0.7);
      const top = Math.round(h * 0.15);
      const bottom = Math.round(h * 0.85);
      path.moveTo(x, top);
      path.lineTo(x, bottom);
    } else {
      // Simplified baseline curve for 'ba'
      const startX = Math.round(w * 0.2);
      const startY = Math.round(h * 0.6);
      const c1x = Math.round(w * 0.45);
      const c1y = Math.round(h * 0.4);
      const c2x = Math.round(w * 0.7);
      const c2y = Math.round(h * 0.8);
      const endX = Math.round(w * 0.8);
      const endY = Math.round(h * 0.6);
      path.moveTo(startX, startY);
      path.bezierCurveTo(c1x, c1y, c2x, c2y, endX, endY);
    }
    return path;
  }, []);

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

    // Build and draw guide
    const path = buildGuidePath(width, height, selectedLetter);
    guidePathRef.current = path;

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

    // Draw guide path
    const guide = guidePathRef.current;
    if (!guide) return;

    ctx.save();
    ctx.globalAlpha = 0.2; // faint guide
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = Math.max(12, lineWidth * 1.8);
    ctx.stroke(guide);
    ctx.restore();

    // Draw a darker centerline on top for clarity
    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.stroke(guide);
    ctx.restore();
  }, [lineWidth]);

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
      // First time: draw the guide into target mask with generous width
      const guide = guidePathRef.current;
      if (guide) {
        tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        tctx.strokeStyle = '#000';
        tctx.lineCap = 'round';
        tctx.lineJoin = 'round';
        tctx.lineWidth = Math.max(16, lineWidth * 2.2);
        tctx.stroke(guide);
      }
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
  }, [selectedLetter, buildGuidePath]);

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
          <select value={selectedLetter} onChange={(e) => setSelectedLetter(e.target.value as 'alif' | 'ba')}>
            <option value="alif">Alif (ا)</option>
            <option value="ba">Ba (ب)</option>
          </select>

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
    </>
  );
}
