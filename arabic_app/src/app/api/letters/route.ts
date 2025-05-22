
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const lettersData = [
    { id: 1, letter: "أ", name: "'alif", transliteration: "a", audioUrl: "/audio/alif.mp3" },
    { id: 2, letter: "ب", name: "Bā'", transliteration: "b", audioUrl: "/audio/ba.mp3" },
    { id: 3, letter: "ت", name: "Tā'", transliteration: "t", audioUrl: ""},
    { id: 4, letter: "ث", name: "Thā'", transliteration: "th", audioUrl: ""},
    { id: 5, letter: "ج", name: "Jīm", transliteration: "j", audioUrl: ""},
    { id: 6, letter: "ح", name: "Ḥā'", transliteration: "h", audioUrl: ""},
    { id: 7, letter: "خ", name: "Khā'", transliteration: "ch", audioUrl: ""},
    { id: 8, letter: "د", name: "Dāl", transliteration: "d", audioUrl: ""},
    { id: 9, letter: "ذ", name: "Dhāl", transliteration: "dh", audioUrl: ""},
    { id: 10, letter: "ر", name: "Rā'", transliteration: "r", audioUrl: ""},
    { id: 11, letter: "ز", name: "Zāy", transliteration: "z", audioUrl: ""},
    { id: 12, letter: "س", name: "Sīn", transliteration: "s", audioUrl: ""},
    { id: 13, letter: "ش", name: "Shīn", transliteration: "sh", audioUrl: ""},
    { id: 14, letter: "ص", name: "Ṣād", transliteration: "s", audioUrl: ""},
    { id: 15, letter: "ض", name: "Ḍād", transliteration: "d", audioUrl: ""},
    { id: 16, letter: "ط", name: "Ṭā'", transliteration: "t", audioUrl: ""},
    { id: 17, letter: "ظ", name: "Ẓā'", transliteration: "z", audioUrl: ""},
    { id: 18, letter: "ع", name: "ayn", transliteration: "c", audioUrl: ""},
    { id: 19, letter: "غ", name: "Ghayn", transliteration: "gh", audioUrl: ""},
    { id: 20, letter: "ف", name: "Fā'", transliteration: "f", audioUrl: ""},
    { id: 21, letter: "ق", name: "Qāf", transliteration: "q", audioUrl: ""},
    { id: 22, letter: "ك", name: "Kāf", transliteration: "k", audioUrl: ""},
    { id: 23, letter: "ل", name: "Lām", transliteration: "l", audioUrl: ""},
    { id: 24, letter: "م", name: "Mīm", transliteration: "m", audioUrl: ""},
    { id: 25, letter: "ن", name: "Nūn", transliteration: "n", audioUrl: ""},
    { id: 26, letter: "ه", name: "Hā'", transliteration: "h", audioUrl: ""},
    { id: 27, letter: "و", name: "Wāw", transliteration: "w", audioUrl: ""},
    { id: 28, letter: "ي", name: "Yā'", transliteration: "y", audioUrl: ""},
    { id: 29, letter: "ء", name: "Hamza", transliteration: "'", audioUrl: ""}
   
  ];


  return NextResponse.json(lettersData);
}