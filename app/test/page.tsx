"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface Letter {
  id: number;
  letter: string;
  name: string;
  transliteration?: string;
  audioUrl?: string;
  forms?: { isolated: string; initial: string; medial: string; final: string };
}

type QuestionType = "mcq-name" | "mcq-letter" | "audio" | "write" | "forms";

interface QuestionBase { id: string; type: QuestionType; letter: Letter }
interface McqQuestion extends QuestionBase { prompt: string; options: string[]; answer: string }
interface AudioQuestion extends QuestionBase { audioUrl: string; options: string[]; answer: string }
interface WriteQuestion extends QuestionBase { prompt: string }
interface FormsQuestion extends QuestionBase { prompt: string; options: string[]; answer: string }

type Question = McqQuestion | AudioQuestion | WriteQuestion | FormsQuestion;

const ui = {
  page: { maxWidth: 900, margin: "0 auto", padding: 16 },
  header: { textAlign: "center" as const, margin: "12px 0 4px" },
  sub: { textAlign: "center" as const, color: "#555", marginBottom: 16 },
  card: { background: "#fff", borderRadius: 10, boxShadow: "0 6px 18px rgba(0,0,0,.12)", padding: 16 },
  row: { display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" as const },
  btn: { padding: "10px 15px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fafafa", cursor: "pointer" },
  primary: { background: "#2563eb", color: "white", border: "none" },
  option: (active: boolean, state: "idle" | "correct" | "wrong") => {
    let bg = "#fafafa", color = "#111", border = "#e5e7eb";
    if (active && state === "correct") { bg = "#e6f4ea"; color = "#1b5e20"; border = "#2e7d32"; }
    if (active && state === "wrong") { bg = "#fdecea"; color = "#7f1d1d"; border = "#c62828"; }
    return { padding: "9px 12px", minHeight: 40, width: "100%", borderRadius: 8, border: `1px solid ${border}`, background: bg, color } as React.CSSProperties;
  }
};

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export default function TestPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { correct: boolean; value?: string; score?: number }>>({});
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/letters");
        const data: Letter[] = await res.json();
        setLetters(data);
        // Build a small mixed quiz (up to 10 questions)
        const pool = data.slice(0, Math.min(10, data.length));
        const qs: Question[] = [];
        for (const l of pool) {
          // MCQ by name
          const opts1 = shuffle([l.name, ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => x.name)]).slice(0, 4);
          qs.push({ id: `mcq-name-${l.id}`, type: "mcq-name", letter: l, prompt: `What is the name of ${l.letter}?`, options: opts1, answer: l.name });
          // MCQ by letter (show name, choose Arabic glyph)
          const glyphs = shuffle([l.letter, ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => x.letter)]).slice(0, 4);
          qs.push({ id: `mcq-letter-${l.id}`, type: "mcq-letter", letter: l, prompt: `Select the letter for ${l.name}`, options: glyphs, answer: l.letter });
          // Forms (if present)
          if (l.forms) {
            const formValues = [l.forms.isolated, l.forms.initial, l.forms.medial, l.forms.final].filter(Boolean);
            const sample = shuffle([formValues[0], ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => (x.forms?.isolated || x.letter))]).slice(0, 4);
            qs.push({ id: `forms-${l.id}`, type: "forms", letter: l, prompt: `Match the isolated form for ${l.name}` , options: sample, answer: formValues[0] });
          }
          // Audio if available
          if (l.audioUrl) {
            const aopts = shuffle([l.name, ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => x.name)]).slice(0, 4);
            qs.push({ id: `audio-${l.id}`, type: "audio", letter: l, audioUrl: l.audioUrl!, options: aopts, answer: l.name });
          }
          // Writing task
          qs.push({ id: `write-${l.id}`, type: "write", letter: l, prompt: `Trace the letter ${l.letter}` });
        }
        setQuestions(shuffle(qs).slice(0, 12));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const current = questions[index];
  const progress = useMemo(() => ({ total: questions.length, current: index + 1 }), [questions.length, index]);

  const answerMcq = (q: McqQuestion, value: string) => {
    if (answers[q.id]) return;
    const correct = value === q.answer;
    setAnswers(a => ({ ...a, [q.id]: { correct, value } }));
  };

  const answerWrite = (q: WriteQuestion, score: number) => {
    // Score threshold 0.6 considered pass
    setAnswers(a => ({ ...a, [q.id]: { correct: score >= 0.6, score } }));
  };

  const goNext = () => setIndex(i => Math.min(i + 1, questions.length - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const submitted = useMemo(() => Object.keys(answers).length >= questions.length, [answers, questions.length]);
  const totalCorrect = useMemo(() => Object.values(answers).filter(a => a.correct).length, [answers]);

  return (
    <div style={ui.page as React.CSSProperties}>
      <h1 style={ui.header}>Arabic Test Mode</h1>
      <p style={ui.sub}>Mixed quiz: identification, audio, forms, and tracing. Progress {progress.current}/{progress.total}</p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, gap: 8 }}>
        <button onClick={() => router.push('/')} style={{ ...ui.btn }}>Home</button>
        <button onClick={() => router.push('/flashLearning')} style={{ ...ui.btn }}>Flashcards</button>
        <button onClick={() => router.push('/drawingPractice')} style={{ ...ui.btn }}>Drawing Practice</button>
      </div>

      {loading && <div>Loading...</div>}
      {!loading && questions.length === 0 && <div>No questions available.</div>}

      {!loading && current && (
        <div style={{ ...ui.card, maxWidth: 860, margin: "0 auto" }}>
          <QuestionRenderer
            q={current}
            given={answers[current.id]}
            onAnswerMcq={answerMcq}
            onAnswerWrite={answerWrite}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
            <button onClick={goPrev} disabled={index === 0} style={ui.btn}>Previous</button>
            <button onClick={goNext} disabled={index === questions.length - 1} style={{ ...ui.btn, ...ui.primary }}>Next</button>
          </div>
        </div>
      )}

      {!loading && submitted && (
        <div style={{ ...ui.card, marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>Results</h3>
          <p>Score: {totalCorrect}/{questions.length}</p>
        </div>
      )}
    </div>
  );
}

function QuestionRenderer({ q, given, onAnswerMcq, onAnswerWrite }:{ q: Question; given?: { correct: boolean; value?: string; score?: number }; onAnswerMcq: (q: McqQuestion | AudioQuestion | FormsQuestion, v: string)=>void; onAnswerWrite: (q: WriteQuestion, score: number)=>void }){
  switch (q.type) {
    case "mcq-name":
      return <Mcq prompt={q.prompt} options={q.options} answer={q.answer} given={given} onSelect={(v)=>onAnswerMcq(q, v)} />
    case "mcq-letter":
      return <Mcq prompt={q.prompt} options={q.options} answer={q.answer} given={given} onSelect={(v)=>onAnswerMcq(q, v)} bigFont />
    case "audio":
      return <AudioMcq audioUrl={q.audioUrl} options={q.options} answer={q.answer} given={given} onSelect={(v)=>onAnswerMcq(q, v)} />
    case "forms":
      return <Mcq prompt={q.prompt} options={q.options} answer={q.answer} given={given} onSelect={(v)=>onAnswerMcq(q, v)} bigFont />
    case "write":
      return <WriteTask prompt={q.prompt} glyph={q.letter.letter || q.letter.forms?.isolated || ''} given={given} onScored={(s)=>onAnswerWrite(q, s)} />
  }
}

function Mcq({ prompt, options, answer, given, onSelect, bigFont }:{ prompt: string; options: string[]; answer: string; given?: { correct: boolean; value?: string }; onSelect: (v:string)=>void; bigFont?: boolean }){
  return (
    <div>
      <div style={{ fontSize: "1.05rem", color: "#333", marginBottom: 10 }}>{prompt}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        {options.map(opt => {
          const isChosen = given?.value === opt;
          const state = given ? (opt === answer ? "correct" : (isChosen ? "wrong" : "idle")) : "idle";
          return (
            <button key={opt} disabled={!!given} style={ui.option(isChosen || state!=='idle', state as any)} onClick={()=>onSelect(opt)}>
              <span style={{ fontSize: bigFont ? '1.6rem' : '.95rem' }}>{opt}</span>
            </button>
          );
        })}
      </div>
      {given && (
        <div style={{ marginTop: 8, color: given.correct ? '#1b5e20' : '#7f1d1d' }}>
          {given.correct ? 'Correct!' : `Answer: ${answer}`}
        </div>
      )}
    </div>
  );
}

function AudioMcq({ audioUrl, options, answer, given, onSelect }:{ audioUrl: string; options: string[]; answer: string; given?: { correct: boolean; value?: string }; onSelect: (v:string)=>void }){
  const [audio] = useState<HTMLAudioElement | null>(typeof window !== 'undefined' ? new Audio(audioUrl) : null);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <button onClick={()=>audio?.play()} style={{ ...ui.btn, ...ui.primary }}>Play</button>
        <span style={{ color: '#444' }}>Listen and choose the correct name</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
        {options.map(opt => {
          const isChosen = given?.value === opt;
          const state = given ? (opt === answer ? "correct" : (isChosen ? "wrong" : "idle")) : "idle";
          return (
            <button key={opt} disabled={!!given} style={ui.option(isChosen || state!=='idle', state as any)} onClick={()=>onSelect(opt)}>
              {opt}
            </button>
          );
        })}
      </div>
      {given && (
        <div style={{ marginTop: 8, color: given.correct ? '#1b5e20' : '#7f1d1d' }}>
          {given.correct ? 'Correct!' : `Answer: ${answer}`}
        </div>
      )}
    </div>
  );
}

function WriteTask({ prompt, glyph, given, onScored }:{ prompt: string; glyph: string; given?: { score?: number }; onScored: (s:number)=>void }){
  // Minimal inline canvas tracing, simplified from drawingPractice: use a transparent overlay and track coverage ratio via crude bbox heuristic.
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<number | null>(given?.score ?? null);

  useEffect(() => {
    // When marked done externally, ignore
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 8 }}>{prompt}</div>
      <div style={{ position: 'relative', width: '100%', height: 240, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <SimpleTrace glyph={glyph} onFinish={(s)=>{ setScore(s); onScored(s); setDone(true); }} />
      </div>
      {score !== null && (
        <div style={{ marginTop: 8 }}>Trace score: {(score*100).toFixed(0)}%</div>
      )}
    </div>
  );
}

function SimpleTrace({ glyph, onFinish }:{ glyph: string; onFinish: (score:number)=>void }){
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const dprRef = React.useRef<number>(1);
  const isDownRef = React.useRef(false);
  const lastRef = React.useRef<{x:number;y:number}|null>(null);
  const [coverage, setCoverage] = useState(0);

  const drawGuide = React.useCallback(() => {
    const canvas = canvasRef.current; const ctx = ctxRef.current; if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0,0,rect.width,rect.height);
    ctx.save();
    ctx.globalAlpha = 0.12; ctx.fillStyle = '#000';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fs = Math.min(rect.width, rect.height) * 0.7;
    ctx.font = `${fs}px system-ui, -apple-system, Segoe UI, Arial, Noto Sans Arabic, sans-serif`;
    ctx.fillText(glyph, rect.width*0.55, rect.height*0.55);
    ctx.restore();
  }, [glyph]);

  const resize = React.useCallback(() => {
    const canvas = canvasRef.current; const container = containerRef.current; if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1; dprRef.current = dpr;
    canvas.style.width = '100%'; canvas.style.height = '100%';
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor((rect.height - 40) * dpr)); // leave room for controls (~40px)
    const ctx = canvas.getContext('2d'); if (!ctx) return; ctxRef.current = ctx;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    drawGuide();
  }, [drawGuide]);

  useEffect(() => {
    resize();
    const ro =  (window as any).ResizeObserver ? new ResizeObserver(() => resize()) : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);
    return () => { if (ro && containerRef.current) ro.unobserve(containerRef.current!); };
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current; const ctx = ctxRef.current; if (!canvas || !ctx) return;
    drawGuide();
    const onDown = (e: PointerEvent) => { isDownRef.current = true; try { canvas.setPointerCapture(e.pointerId); } catch {} lastRef.current = { x: e.offsetX, y: e.offsetY }; e.preventDefault(); };
    const onUp = (e: PointerEvent) => { isDownRef.current = false; lastRef.current = null; e.preventDefault(); };
    const onMove = (e: PointerEvent) => {
      if (!isDownRef.current) return; e.preventDefault();
      const to = { x: e.offsetX, y: e.offsetY }; const from = lastRef.current || to;
      ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      lastRef.current = to;
      try {
        const img = ctx.getImageData(0,0,canvas.width, canvas.height).data;
        let on = 0; for (let i=0;i<img.length;i+=4){ if(img[i+3]>0) on++; }
        const total = canvas.width*canvas.height; const s = Math.min(1, on / (total*0.12));
        setCoverage(s);
      } catch {}
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointerleave', onUp);
    canvas.addEventListener('pointermove', onMove);
    return () => {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerleave', onUp);
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [drawGuide, glyph]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <canvas ref={canvasRef} style={{ flex: 1, width: '100%', height: '100%', touchAction: 'none' as any }} />
      <div style={{ display: 'flex', gap: 8, padding: 8, borderTop: '1px solid #eee', background: '#fafafa' }}>
        <button onClick={()=>{ const c = canvasRef.current; const ctx = ctxRef.current; if(!c || !ctx) return; const rect = c.getBoundingClientRect(); ctx.clearRect(0,0,rect.width,rect.height); drawGuide(); setCoverage(0); onFinish(0); }} style={ui.btn}>Clear</button>
        <button onClick={()=>onFinish(coverage)} style={{ ...ui.btn, ...ui.primary }}>Finish</button>
      </div>
    </div>
  );
}