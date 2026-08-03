import { cache } from "react";

export interface LetterForms {
  isolated: string;
  initial: string;
  medial: string;
  final: string;
}

export interface Letter {
  id: number;
  letter: string;
  name: string;
  transliteration?: string;
  audioUrl?: string;
  forms?: LetterForms;
  formAudioUrls?: Partial<LetterForms>;
}

const ALPHABET: Letter[] = [
  { id: 1, letter: "أ", name: "'alif", transliteration: "a", audioUrl: "/audio/alif.mp3", forms: { isolated: "ا", initial: "ا", medial: "ـا", final: "ـا" } },
  { id: 2, letter: "ب", name: "Bā'", transliteration: "b", audioUrl: "/audio/ba.mp3", forms: { isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" } },
  { id: 3, letter: "ت", name: "Tā'", transliteration: "t", audioUrl: "/audio/ta.mp3", forms: { isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" } },
  { id: 4, letter: "ث", name: "Thā'", transliteration: "th", audioUrl: "/audio/tha.mp3", forms: { isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" } },
  { id: 5, letter: "ج", name: "Jīm", transliteration: "j", audioUrl: "/audio/jim.mp3", forms: { isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" } },
  { id: 6, letter: "ح", name: "Ḥā'", transliteration: "h", audioUrl: "/audio/ha.mp3", forms: { isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" } },
  { id: 7, letter: "خ", name: "Khā'", transliteration: "ch", audioUrl: "/audio/kha.mp3", forms: { isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" } },
  { id: 8, letter: "د", name: "Dāl", transliteration: "d", audioUrl: "/audio/dal.mp3", forms: { isolated: "د", initial: "د", medial: "ـد", final: "ـد" } },
  { id: 9, letter: "ذ", name: "Dhāl", transliteration: "dh", audioUrl: "/audio/dhal.mp3", forms: { isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" } },
  { id: 10, letter: "ر", name: "Rā'", transliteration: "r", audioUrl: "/audio/ra.mp3", forms: { isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" } },
  { id: 11, letter: "ز", name: "Zāy", transliteration: "z", audioUrl: "/audio/Zay.mp3", forms: { isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" } },
  { id: 12, letter: "س", name: "Sīn", transliteration: "s", audioUrl: "/audio/seen.mp3", forms: { isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" } },
  { id: 13, letter: "ش", name: "Shīn", transliteration: "sh", audioUrl: "/audio/sin.mp3", forms: { isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" } },
  { id: 14, letter: "ص", name: "Ṣād", transliteration: "s", audioUrl: "/audio/sad.mp3", forms: { isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" } },
  { id: 15, letter: "ض", name: "Ḍād", transliteration: "d", audioUrl: "/audio/dad.mp3", forms: { isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" } },
  { id: 16, letter: "ط", name: "Ṭā'", transliteration: "t", audioUrl: "/audio/taa.mp3", forms: { isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" } },
  { id: 17, letter: "ظ", name: "Ẓā'", transliteration: "z", audioUrl: "/audio/zaa.mp3", forms: { isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" } },
  { id: 18, letter: "ع", name: "ayn", transliteration: "c", audioUrl: "/audio/ayn.mp3", forms: { isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" } },
  { id: 19, letter: "غ", name: "Ghayn", transliteration: "gh", audioUrl: "/audio/Ghayn.mp3", forms: { isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" } },
  { id: 20, letter: "ف", name: "Fā'", transliteration: "f", audioUrl: "/audio/fa.mp3", forms: { isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" } },
  { id: 21, letter: "ق", name: "Qāf", transliteration: "q", audioUrl: "/audio/qaf.mp3", forms: { isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" } },
  { id: 22, letter: "ك", name: "Kāf", transliteration: "k", audioUrl: "/audio/kaf.mp3", forms: { isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" } },
  { id: 23, letter: "ل", name: "Lām", transliteration: "l", audioUrl: "/audio/Lam.mp3", forms: { isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" } },
  { id: 24, letter: "م", name: "Mīm", transliteration: "m", audioUrl: "/audio/mim.mp3", forms: { isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" } },
  { id: 25, letter: "ن", name: "Nūn", transliteration: "n", audioUrl: "/audio/nun.mp3", forms: { isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" } },
  { id: 26, letter: "ه", name: "Hā'", transliteration: "h", audioUrl: "/audio/ha 2.mp3", forms: { isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" } },
  { id: 27, letter: "و", name: "Wāw", transliteration: "w", audioUrl: "/audio/waw.mp3", forms: { isolated: "و", initial: "و", medial: "ـو", final: "ـو" } },
  { id: 28, letter: "ي", name: "Yā'", transliteration: "y", audioUrl: "/audio/ya.mp3", forms: { isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" } },
  { id: 29, letter: "ء", name: "Hamza", transliteration: "'", audioUrl: "", forms: { isolated: "ء", initial: "ء", medial: "ء", final: "ء" } },
];

/**
 * Cached per-request so multiple Server Components (Hero, AlphabetGrid, ...)
 * reading the alphabet in the same render tree share one lookup instead of
 * each re-running it. Swap the body for a fetch() to the FastAPI backend
 * later — the signature and cache() wrapper stay the same.
 */
export const getLetters = cache(async (): Promise<Letter[]> => {
  return ALPHABET;
});
