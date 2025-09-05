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

function fireConfetti() {
  if (typeof window === 'undefined') return;
  const duration = 1100;
  const end = Date.now() + duration;
  const colors = ['#34d399', '#60a5fa', '#f472b6', '#fbbf24', '#f87171'];
  const frame = () => {
    const count = 10;
    const root = document.body;
    for (let i=0;i<count;i++){
      const d = document.createElement('div');
      d.style.position='fixed'; d.style.width='8px'; d.style.height='8px'; d.style.borderRadius='2px';
      d.style.left = Math.random()*100+'%'; d.style.top = '0px';
      d.style.background = colors[(Math.random()*colors.length)|0];
      d.style.opacity = '0.9'; d.style.transform = `translateY(0px)`;
      root.appendChild(d);
      const toY = window.innerHeight + 40 + Math.random()*200;
      const toX = (Math.random()-0.5)*200;
      const rot = (Math.random()*360)|0;
      const time = 800 + Math.random()*600;
      d.animate([
        { transform: 'translate(0, -40px) rotate(0deg)', opacity: 0.9 },
        { transform: `translate(${toX}px, ${toY}px) rotate(${rot}deg)`, opacity: 0.2 }
      ], { duration: time, easing: 'cubic-bezier(.17,.67,.08,1.01)' }).onfinish = () => d.remove();
    }
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function CelebrationCard({ total, correct, onNewQuiz }:{ total:number; correct:number; onNewQuiz: ()=>void }){
  useEffect(()=>{ fireConfetti(); try{ navigator.vibrate && navigator.vibrate(60); }catch{} },[]);
  const pct = Math.round((correct/Math.max(1,total))*100);
  const msg = pct === 100 ? 'Perfect! 🎉' : pct >= 80 ? 'Great job! 🎊' : pct >= 50 ? 'Nice work! 👍' : 'Good effort! 💪 Keep practicing';
  return (
    <div style={{ ...ui.card, marginTop: 16, textAlign:'center' as const }}>
      <h3 style={{ marginTop: 0 }}>Quiz Finished</h3>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{msg}</div>
      <div style={{ color:'#374151', marginBottom: 12 }}>Your score: <b>{correct}</b> / {total} ({pct}%)</div>
      <div style={{ display:'flex', justifyContent:'center', gap:8 }}>
        <button style={{ ...ui.btn }} onClick={()=>window?.location?.reload()}>Review Again</button>
        <button style={{ ...ui.btn, ...ui.primary }} onClick={onNewQuiz}>New Quiz</button>
      </div>
    </div>
  );
}

export default function TestPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { correct: boolean; value?: string; score?: number }>>({});
  const [loading, setLoading] = useState(true);
  const [quizKey, setQuizKey] = useState(0);

  const router = useRouter();

    const buildQuiz = (data: Letter[]) => {
        const pool = shuffle(data).slice(0, Math.min(10, data.length)); // <-- The fix is here
        const qs: Question[] = [];
        for (const l of pool) {
            const opts1 = shuffle([l.name, ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => x.name)]).slice(0, 4);
            qs.push({ id: `mcq-name-${l.id}`, type: "mcq-name", letter: l, prompt: `What is the name of ${l.letter}?`, options: opts1, answer: l.name });
            const glyphs = shuffle([l.letter, ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => x.letter)]).slice(0, 4);
            qs.push({ id: `mcq-letter-${l.id}`, type: "mcq-letter", letter: l, prompt: `Select the letter for ${l.name}`, options: glyphs, answer: l.letter });
            if (l.forms) {
                const formValues = [l.forms.isolated, l.forms.initial, l.forms.medial, l.forms.final].filter(Boolean);
                const sample = shuffle([formValues[0], ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => (x.forms?.isolated || x.letter))]).slice(0, 4);
                qs.push({ id: `forms-${l.id}`, type: "forms", letter: l, prompt: `Match the isolated form for ${l.name}` , options: sample, answer: formValues[0] });
            }
            if (l.audioUrl) {
                const aopts = shuffle([l.name, ...shuffle(data.filter(x => x.id !== l.id)).slice(0, 3).map(x => x.name)]).slice(0, 4);
                qs.push({ id: `audio-${l.id}`, type: "audio", letter: l, audioUrl: l.audioUrl!, options: aopts, answer: l.name });
            }
            qs.push({ id: `write-${l.id}`, type: "write", letter: l, prompt: `Trace the letter ${l.letter}` });
        }
        setQuestions(shuffle(qs).slice(0, 12));
    };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/letters");
        const data: Letter[] = await res.json();
        setLetters(data);
        buildQuiz(data);
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

  const answerMcq = (q: McqQuestion | AudioQuestion | FormsQuestion, value: string) => {
    if (answers[q.id]) return;
    const correct = value === q.answer;
    setAnswers(a => ({ ...a, [q.id]: { correct, value } }));
  };

  const answerWrite = (q: WriteQuestion, score: number) => {
    setAnswers(a => ({ ...a, [q.id]: { correct: score >= 0.6, score } }));
  };

  const goNext = () => setIndex(i => Math.min(i + 1, questions.length - 1));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  const submitted = useMemo(() => Object.keys(answers).length >= questions.length && questions.length>0, [answers, questions.length]);
  const totalCorrect = useMemo(() => Object.values(answers).filter(a => a.correct).length, [answers]);

  const startNewQuiz = () => {
    if (letters.length) {
      setAnswers({});
      setIndex(0);
      setQuizKey(k => k + 1);
      buildQuiz(letters);
    }
  };

  return (
    <div style={ui.page as React.CSSProperties}>
      <h1 style={ui.header}>Arabic Test Mode</h1>
      <p style={ui.sub}>Mixed quiz: identification, audio, forms, and tracing. Progress {progress.current}/{progress.total} • Build v-test-2025-09-05-12:10</p>

      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, gap: 8 }}>
        <button onClick={() => router.push('/')} style={{ ...ui.btn }}>Home</button>
        <button onClick={() => router.push('/flashLearning')} style={{ ...ui.btn }}>Flashcards</button>
        <button onClick={() => router.push('/drawingPractice')} style={{ ...ui.btn }}>Drawing Practice</button>
      </div>

      {loading && <div>Loading...</div>}
      {!loading && questions.length === 0 && <div>No questions available.</div>}

      {!loading && current && (
        <div key={quizKey} style={{ ...ui.card, maxWidth: 860, margin: "0 auto" }}>
          <div style={{ height: 8, background:'#f3f4f6', borderRadius: 999, overflow:'hidden', marginBottom:12 }}>
            <div style={{ width: `${Math.max(1, Math.round((progress.current-1)/Math.max(1,progress.total)*100))}%`, height:'100%', background:'#60a5fa' }} />
          </div>
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
        <CelebrationCard key={`celebrate-${quizKey}`} total={questions.length} correct={totalCorrect} onNewQuiz={startNewQuiz} />
      )}
    </div>
  );
}

function QuestionRenderer({ q, given, onAnswerMcq, onAnswerWrite }:{ q: Question; given?: { correct: boolean; value?: string; score?: number }; onAnswerMcq: (q: McqQuestion | AudioQuestion | FormsQuestion, v: string)=>void; onAnswerWrite: (q: WriteQuestion, score: number)=>void }){
  switch (q.type) {
    case "mcq-name": {
      const qq = q as McqQuestion;
      return <Mcq prompt={qq.prompt} options={qq.options} answer={qq.answer} given={given} onSelect={(v)=>onAnswerMcq(qq, v)} />
    }
    case "mcq-letter": {
      const qq = q as McqQuestion;
      return <Mcq prompt={qq.prompt} options={qq.options} answer={qq.answer} given={given} onSelect={(v)=>onAnswerMcq(qq, v)} bigFont />
    }
    case "audio": {
      const qq = q as AudioQuestion;
      return <AudioMcq audioUrl={qq.audioUrl} options={qq.options} answer={qq.answer} given={given} onSelect={(v)=>onAnswerMcq(qq, v)} />
    }
    case "forms": {
      const qq = q as FormsQuestion;
      return <Mcq prompt={qq.prompt} options={qq.options} answer={qq.answer} given={given} onSelect={(v)=>onAnswerMcq(qq, v)} bigFont />
    }
    case "write": {
      const qq = q as WriteQuestion;
      return <WriteTask prompt={qq.prompt} glyph={qq.letter.letter || qq.letter.forms?.isolated || ''} given={given} onScored={(s)=>onAnswerWrite(qq, s)} />
    }
    default:
      return null;
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
  const [done, setDone] = useState(false);
  const [score, setScore] = useState<number | null>(given?.score ?? null);

  useEffect(() => {
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