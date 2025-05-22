const lettersData = [
    { id: 1, letter: "أ", name: "Alif", transliteration: "a", audioUrl: "/audio/alif.mp3" },
    { id: 2, letter: "ب", name: "Ba", transliteration: "b", audioUrl: "/audio/ba.mp3" },
   
  ];

  export default function handler(req, res) 
  {
    res.status(200).json(lettersData);
  }