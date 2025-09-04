import React, { useState, useEffect, useRef } from 'react';

interface FlashcardProps {
  flashcard: {
    id: number;
    question: string;
    answer: string;
    options: string[];
  };
}

const styles = {
  card: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    perspective: '1000px',
    aspectRatio: '3/2.5',
  },
  cardInner: (isFlipped: boolean) => ({
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    textAlign: 'center' as const,
    transition: 'transform 0.8s',
    transformStyle: 'preserve-3d' as const,
    cursor: 'pointer',
    transform: isFlipped ? 'rotateY(180deg)' : '',
  }),
  cardFace: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backfaceVisibility: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '12px',
    boxSizing: 'border-box' as const,
    gap: '6px',
  },
  front: {
    transform: 'rotateY(0deg)',
  },
  back: {
    transform: 'rotateY(180deg)',
  },
  arabicLetter: {
    fontSize: 'clamp(1.6rem, 6vw, 2.2rem)',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#333',
    maxWidth: '100%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  answer: {
    fontSize: '2rem',
    color: '#2c3e50',
    marginTop: '14px',
  }
};

export default function Flashcard({ flashcard }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleOptionClick = (option: string) => {
    if (selected) return;
    setSelected(option);
    const ok = option === flashcard.answer;
    setResult(ok ? 'correct' : 'incorrect');
    if (!ok) {
      // auto flip to show correct after a brief delay
      setTimeout(() => setIsFlipped(true), 700);
    }
  };

  const resetCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFlipped(false);
    setSelected(null);
    setResult(null);
  };

  return (
      <div className="card" style={styles.card}>
        <div style={styles.cardInner(isFlipped)} onClick={handleClick}>
          <div style={{ ...styles.cardFace, ...styles.front }}>
            <div style={styles.arabicLetter}>{flashcard.question}</div>
            <div style={{fontSize: '1rem', color:'#444'}}>{flashcard.question}</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr', gap:'6px', marginTop:'10px', width:'100%', boxSizing:'border-box' as const }} onClick={(e)=>e.stopPropagation()}>
              {flashcard.options.map((opt) => {
                const isSelected = selected === opt;
                const isCorrect = opt === flashcard.answer;
                let bg = '#fafafa';
                let textColor = '#111';
                let borderColor = '#e5e7eb';
                if (selected) {
                  if (isSelected && isCorrect) {
                    bg = '#e6f4ea';
                    textColor = '#1b5e20';
                    borderColor = '#2e7d32';
                  } else if (isSelected && !isCorrect) {
                    bg = '#fdecea';
                    textColor = '#7f1d1d';
                    borderColor = '#c62828';
                  } else if (isCorrect) {
                    bg = '#e6f4ea';
                    textColor = '#1b5e20';
                    borderColor = '#a5d6a7';
                  }
                }
                return (
                  <button
                    key={opt}
                    onClick={() => handleOptionClick(opt)}
                    aria-label={`Option ${opt}`}
                    disabled={!!selected}
                    style={{
                      padding:'7px 10px',
                      minHeight: '38px',
                      fontSize: '.9rem',
                      lineHeight: '1.2',
                      borderRadius:'8px',
                      border:`1px solid ${borderColor}`,
                      backgroundColor: bg,
                      color: textColor,
                      cursor: selected ? 'default' : 'pointer',
                      transition: 'background-color .2s, border-color .2s, color .2s',
                      width: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            <div style={{minHeight: 20, marginTop:'8px'}}>
              {selected && (
                <span style={{ color: result==='correct' ? '#1b5e20' : '#7f1d1d'}}>
                  {result==='correct' ? 'Correct!' : 'Try again! Revealing answer...'}
                </span>
              )}
            </div>
          </div>
          <div style={{ ...styles.cardFace, ...styles.back }}>
            <div style={styles.arabicLetter}>{flashcard.question}</div>
            <div style={styles.answer}>{flashcard.answer}</div>
            <button onClick={resetCard} style={{marginTop:'16px', padding:'8px 12px', borderRadius:'6px', border:'1px solid #ccc', background:'#f7f7f7', cursor:'pointer'}}>Next</button>
          </div>
        </div>
      </div>
  );
}
