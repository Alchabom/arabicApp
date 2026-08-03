"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Letter } from '@/lib/letters';
import { PageNav } from '@/components/page-nav';
import { LetterDetailDialog } from '@/components/letter-detail-dialog';
import { Button } from '@/components/ui/button';

const GUIDE_FONT_STACK = 'Amiri, system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif';

export default function DrawingPracticePage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const targetMaskRef = useRef<HTMLCanvasElement | null>(null);
  const drawMaskRef = useRef<HTMLCanvasElement | null>(null);

  const dprRef = useRef<number>(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  const [isPainting, setIsPainting] = useState(false);
  const [lineWidth, setLineWidth] = useState(10);
  const [strokeColor, setStrokeColor] = useState('#b33a2e');
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

    tctx.font = `${fontSize}px ${GUIDE_FONT_STACK}`;

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
      ctx.font = `${fontSize}px ${GUIDE_FONT_STACK}`;
      ctx.fillText(glyph, width * 0.55, height * 0.55);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = '#4b5563';
      ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.01);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${fontSize}px ${GUIDE_FONT_STACK}`;
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

  // Amiri loads async; canvas text doesn't repaint on font swap like DOM
  // text does, so re-render the guide once it's actually available.
  useEffect(() => {
    document.fonts?.ready.then(() => resizeCanvas());
  }, [resizeCanvas]);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 pt-8 pb-16 lg:flex-row">
      <aside className="flex w-full flex-col gap-4 lg:w-72 lg:shrink-0">
        <PageNav />

        <div className="flex flex-col gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <h1 className="font-display text-xl text-ink">Drawing Practice</h1>

          <label className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            Letter to trace
            <select
              className="rounded-lg border border-foreground/10 bg-muted px-2.5 py-1.5 font-arabic text-ink"
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
          </label>
          <Button
            variant="outline"
            onClick={() => setShowModal(true)}
            disabled={!selectedLetterObj}
          >
            Show letter details
          </Button>

          <label className="flex items-center justify-between text-sm text-muted-foreground">
            Stroke color
            <input
              type="color"
              className="h-8 w-12 rounded-md border border-foreground/10 bg-muted"
              value={strokeColor}
              onChange={(e) => setStrokeColor(e.target.value)}
            />
          </label>

          <label className="flex items-center justify-between text-sm text-muted-foreground">
            Line width
            <input
              type="number"
              min={2}
              max={40}
              className="w-16 rounded-md border border-foreground/10 bg-muted px-2 py-1 text-ink"
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value) || 1)}
            />
          </label>

          <Button variant="secondary" onClick={clearCanvas}>
            Clear
          </Button>

          <div className="font-mono text-xs text-muted-foreground">
            {score ? (
              <div className="flex flex-col gap-1">
                <div>Coverage: {(score.coverage * 100).toFixed(0)}%</div>
                <div>IoU: {(score.iou * 100).toFixed(0)}%</div>
                <div className="text-vermillion">{feedback}</div>
              </div>
            ) : (
              <div>Trace the letter along the faint guide.</div>
            )}
          </div>
        </div>
      </aside>

      <div className="relative min-h-[420px] flex-1 rounded-xl bg-card p-2 shadow-lg">
        <canvas
          className="h-full w-full touch-none rounded-lg"
          ref={canvasRef}
          onPointerDown={startPainting}
          onPointerUp={stopPainting}
          onPointerMove={draw}
          onPointerLeave={stopPainting}
          onPointerCancel={stopPainting}
        />
      </div>

      <LetterDetailDialog
        letter={selectedLetterObj}
        open={showModal}
        onOpenChange={setShowModal}
      />
    </main>
  );
}
