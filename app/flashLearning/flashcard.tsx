import React, { useState } from 'react';

export default function Flashcard({flashcard}: {flashcard: any}) {
    const [flip , setFlip] = useState(false);
  return (
      <div onClick={() => setFlip(!flip)}>
          {flip ? flashcard.answer : flashcard.question}
      </div>
)
}