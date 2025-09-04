"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import LetterModal from '../LetterModal';

export default function DrawingPracticePage() {
  const router = useRouter();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const targetMaskRef = useRef<HTMLCanvasElement | null>(null);
  const drawMaskRef = useRef<HTMLCanvasElement | null>(null);

  const dprRef = useRef<number>(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  const [isPainting, setIsPainting] = useState(false);
  const [lineWidth, setLineWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState('#1f2937');
  interface Letter { id: number; letter: string; name: string; transliteration?: string; audioUrl?: string; forms?: { isolated: string; initial: string; medial: string; final: string; }; }
  const [letters, setLetters] = useState<Letter[]>([]);
  const [selectedLetterObj, setSelectedLetterObj] = useState<Letter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState<{ coverage: number; iou: number } | null>(null);
  const [feedback, setFeedback] = useState<string>('');


  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const currentWidthRef = useRef<number>(lineWidth);
  const rafIdRef = useRef<number | null>(null);
  const pendingPointRef = useRef<{ x: number; y: number; width: number; color: string } | null>(null);

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


  const renderGlyphGuide = useCallback((width: number, height: number) => {
    const dpr = dprRef.current;
    const tmask = targetMaskRef.current;
    if (!tmask) return;
    const tctx = tmask.getContext('2d')!;

    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    tctx.clearRect(0, 0, width, height);

    const glyph = selectedLetterObj?.letter || selectedLetterObj?.forms?.isolated || '';
    if (!glyph) return;

    const fontSize = Math.min(width, height) * 0.6;
    tctx.save();
    tctx.fillStyle = '#000';
    tctx.strokeStyle = '#000';
    tctx.lineWidth = Math.max(14, Math.min(width, height) * 0.08);
    tctx.lineJoin = 'round';
    tctx.lineCap = 'round';
    tctx.textAlign = 'center';
    tctx.textBaseline = 'middle';

    tctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif`;

    const cx = width * 0.55;
    const cy = height * 0.55;


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

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;

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

    renderGlyphGuide(width, height);

    drawGuide();
  }, []);

  const drawGuide = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const { width, height } = canvas.getBoundingClientRect();

    ctx.clearRect(0, 0, width, height);

    const drawMask = drawMaskRef.current;
    if (drawMask) {
      ctx.drawImage(drawMask, 0, 0, drawMask.width / dprRef.current, drawMask.height / dprRef.current);
    }

    const glyph = selectedLetterObj?.letter || selectedLetterObj?.forms?.isolated || '';
    if (glyph) {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#111827';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const fontSize = Math.min(width, height) * 0.6;
      ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif`;
      ctx.fillText(glyph, width * 0.55, height * 0.55);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.01);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontSize}px system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif`;
      ctx.strokeText(glyph, width * 0.55, height * 0.55);
      ctx.restore();
    }
  }, [selectedLetterObj]);

  const updateMasksOnStroke = useCallback((from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dpr = dprRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    const drawMask = drawMaskRef.current!;
    const dctx = drawMask.getContext('2d')!;
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dctx.strokeStyle = strokeColor;
    // Use effective stroke width (pressure-aware for pen)
    dctx.lineWidth = currentWidthRef.current || lineWidth;
    dctx.lineCap = 'round';
    dctx.lineJoin = 'round';
    dctx.beginPath();
    dctx.moveTo(from.x, from.y);
    dctx.lineTo(to.x, to.y);
    dctx.stroke();

    drawGuide();

    computeScore(cssWidth, cssHeight);
  }, [lineWidth, strokeColor, drawGuide]);

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
  const toLocal = (e: MouseEvent | TouchEvent | PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const t = e.touches[0];
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    const me = e as MouseEvent;
    return { x: me.clientX - rect.left, y: me.clientY - rect.top };
  };

  const startPainting = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    // For pointer events, ensure we draw only for primary contact and capture pointer
    const ne: any = e.nativeEvent as any;
    if ('pointerType' in ne) {
      if (ne.isPrimary === false) return; // ignore non-primary pointers
      if (canvasRef.current && typeof ne.pointerId === 'number') {
        try { canvasRef.current.setPointerCapture(ne.pointerId); } catch {}
      }
    }
    setIsPainting(true);
    const pos = toLocal(e.nativeEvent as any);
    lastPosRef.current = pos;
  };

  const stopPainting = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    if (e) e.preventDefault();
    const ne: any = e ? (e.nativeEvent as any) : null;
    if (ne && 'pointerType' in ne) {
      if (canvasRef.current && typeof ne.pointerId === 'number') {
        try { canvasRef.current.releasePointerCapture(ne.pointerId); } catch {}
      }
    }
    // cancel any scheduled frame
    if (rafIdRef.current !== null) {
      try { cancelAnimationFrame(rafIdRef.current); } catch {}
      rafIdRef.current = null;
    }
    pendingPointRef.current = null;
    setIsPainting(false);
    lastPosRef.current = null;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement> | React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPainting) return;
    e.preventDefault();

    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const ne: any = e.nativeEvent as any;
    // Determine effective width: use pressure for pen when available
    let effectiveWidth = lineWidth;
    if ('pointerType' in ne && (ne.pointerType === 'pen' || ne.pointerType === 'stylus')) {
      const p = typeof ne.pressure === 'number' ? ne.pressure : 0;
      if (p > 0) {
        // Scale width between 50% and 150% of chosen width based on pressure
        effectiveWidth = Math.max(1, lineWidth * (0.5 + p));
      }
    }

    const current = toLocal(ne);
    // queue the latest point and properties for RAF processing
    pendingPointRef.current = { x: current.x, y: current.y, width: effectiveWidth, color: strokeColor };

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const ctxNow = ctxRef.current;
        if (!ctxNow || !isPainting) return;
        const pt = pendingPointRef.current;
        if (!pt) return;
        const last = lastPosRef.current || { x: pt.x, y: pt.y };

        // Draw on main canvas for immediate feedback
        ctxNow.strokeStyle = pt.color;
        ctxNow.lineWidth = pt.width;
        ctxNow.beginPath();
        ctxNow.moveTo(last.x, last.y);
        ctxNow.lineTo(pt.x, pt.y);
        ctxNow.stroke();

        // mirror width to mask drawing
        currentWidthRef.current = pt.width;

        // Update masks & guide
        updateMasksOnStroke(last, { x: pt.x, y: pt.y });

        lastPosRef.current = { x: pt.x, y: pt.y };
      });
    }
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
        }
      } catch (e) {
        console.error('Error fetching letters', e);
      }
    };
    fetchLetters();
  }, []);


  useEffect(() => {
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

    setScore(null);
    setFeedback('');
    drawGuide();
    // Re-render glyph-based guide whenever selection changes
    renderGlyphGuide(width, height);
  }, [selectedLetterObj, renderGlyphGuide]);

  // Keep currentWidthRef in sync with base lineWidth
  useEffect(() => {
    currentWidthRef.current = lineWidth;
  }, [lineWidth]);

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
            value={selectedLetterObj ? String(selectedLetterObj.id) : ''}
            onChange={(e) => {
              const id = Number(e.target.value);
              const letterObj = letters.find(l => l.id === id) || null;
              setSelectedLetterObj(letterObj);
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
            <button onClick={() => router.push('/test')}>Test Mode</button>
          </div>
        </div>

        <div className="drawing-board-container">
          <canvas
            id="drawing-board"
            ref={canvasRef}
            onPointerDown={startPainting}
            onPointerUp={stopPainting}
            onPointerMove={draw}
            onPointerLeave={stopPainting}
            onPointerCancel={stopPainting}
          />
        </div>
      </section>
      {showModal && selectedLetterObj && (
        <LetterModal letter={selectedLetterObj} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
