
import { NextResponse } from 'next/server';

export async function GET() {
  // Define the base letter data
  const baseLettersData = [
    { 
      id: 1, 
      letter: "أ", 
      name: "'alif", 
      transliteration: "a", 
      audioUrl: "/audio/alif.mp3",
      forms: {
        isolated: "ا",
        initial: "ا",
        medial: "ـا",
        final: "ـا"
      }
    },
    { 
      id: 2, 
      letter: "ب", 
      name: "Bā'", 
      transliteration: "b", 
      audioUrl: "/audio/ba.mp3",
      forms: {
        isolated: "ب",
        initial: "بـ",
        medial: "ـبـ",
        final: "ـب"
      }
    },
    { 
      id: 3, 
      letter: "ت", 
      name: "Tā'", 
      transliteration: "t", 
      audioUrl: "",
      forms: {
        isolated: "ت",
        initial: "تـ",
        medial: "ـتـ",
        final: "ـت"
      }
    },
    { 
      id: 4, 
      letter: "ث", 
      name: "Thā'", 
      transliteration: "th", 
      audioUrl: "",
      forms: {
        isolated: "ث",
        initial: "ثـ",
        medial: "ـثـ",
        final: "ـث"
      }
    },
    { 
      id: 5, 
      letter: "ج", 
      name: "Jīm", 
      transliteration: "j", 
      audioUrl: "",
      forms: {
        isolated: "ج",
        initial: "جـ",
        medial: "ـجـ",
        final: "ـج"
      }
    },
    {
      id: 6,
      letter: "ح",
      name: "Ḥā'",
      transliteration: "h",
      audioUrl: "",
      forms: {
        isolated: "ح",
        initial: "حـ",
        medial: "ـحـ",
        final: "ـح"
      }
    },
    {
      id: 7,
      letter: "خ",
      name: "Khā'",
      transliteration: "ch",
      audioUrl: "",
      forms: {
        isolated: "خ",
        initial: "خـ",
        medial: "ـخـ",
        final: "ـخ"
      }
    },
    {
      id: 8,
      letter: "د",
      name: "Dāl",
      transliteration: "d",
      audioUrl: "",
      forms: {
        isolated: "د",
        initial: "د",
        medial: "ـد",
        final: "ـد"
      }
    },
    {
      id: 9,
      letter: "ذ",
      name: "Dhāl",
      transliteration: "dh",
      audioUrl: "",
      forms: {
        isolated: "ذ",
        initial: "ذ",
        medial: "ـذ",
        final: "ـذ"
      }
    },
    {
      id: 10,
      letter: "ر",
      name: "Rā'",
      transliteration: "r",
      audioUrl: "",
      forms: {
        isolated: "ر",
        initial: "ر",
        medial: "ـر",
        final: "ـر"
      }
    },
    {
      id: 11,
      letter: "ز",
      name: "Zāy",
      transliteration: "z",
      audioUrl: "",
      forms: {
        isolated: "ز",
        initial: "ز",
        medial: "ـز",
        final: "ـز"
      }
    },
    {
      id: 12,
      letter: "س",
      name: "Sīn",
      transliteration: "s",
      audioUrl: "",
      forms: {
        isolated: "س",
        initial: "سـ",
        medial: "ـسـ",
        final: "ـس"
      }
    },
    {
      id: 13,
      letter: "ش",
      name: "Shīn",
      transliteration: "sh",
      audioUrl: "",
      forms: {
        isolated: "ش",
        initial: "شـ",
        medial: "ـشـ",
        final: "ـش"
      }
    },
    {
      id: 14,
      letter: "ص",
      name: "Ṣād",
      transliteration: "s",
      audioUrl: "",
      forms: {
        isolated: "ص",
        initial: "صـ",
        medial: "ـصـ",
        final: "ـص"
      }
    },
    {
      id: 15,
      letter: "ض",
      name: "Ḍād",
      transliteration: "d",
      audioUrl: "",
      forms: {
        isolated: "ض",
        initial: "ضـ",
        medial: "ـضـ",
        final: "ـض"
      }
    },
    {
      id: 16,
      letter: "ط",
      name: "Ṭā'",
      transliteration: "t",
      audioUrl: "",
      forms: {
        isolated: "ط",
        initial: "طـ",
        medial: "ـطـ",
        final: "ـط"
      }
    },
    {
      id: 17,
      letter: "ظ",
      name: "Ẓā'",
      transliteration: "z",
      audioUrl: "",
      forms: {
        isolated: "ظ",
        initial: "ظـ",
        medial: "ـظـ",
        final: "ـظ"
      }
    },
    {
      id: 18,
      letter: "ع",
      name: "ayn",
      transliteration: "c",
      audioUrl: "",
      forms: {
        isolated: "ع",
        initial: "عـ",
        medial: "ـعـ",
        final: "ـع"
      }
    },
    {
      id: 19,
      letter: "غ",
      name: "Ghayn",
      transliteration: "gh",
      audioUrl: "",
      forms: {
        isolated: "غ",
        initial: "غـ",
        medial: "ـغـ",
        final: "ـغ"
      }
    },
    {
      id: 20,
      letter: "ف",
      name: "Fā'",
      transliteration: "f",
      audioUrl: "",
      forms: {
        isolated: "ف",
        initial: "فـ",
        medial: "ـفـ",
        final: "ـف"
      }
    },
    {
      id: 21,
      letter: "ق",
      name: "Qāf",
      transliteration: "q",
      audioUrl: "",
      forms: {
        isolated: "ق",
        initial: "قـ",
        medial: "ـقـ",
        final: "ـق"
      }
    },
    {
      id: 22,
      letter: "ك",
      name: "Kāf",
      transliteration: "k",
      audioUrl: "",
      forms: {
        isolated: "ك",
        initial: "كـ",
        medial: "ـكـ",
        final: "ـك"
      }
    },
    {
      id: 23,
      letter: "ل",
      name: "Lām",
      transliteration: "l",
      audioUrl: "",
      forms: {
        isolated: "ل",
        initial: "لـ",
        medial: "ـلـ",
        final: "ـل"
      }
    },
    {
      id: 24,
      letter: "م",
      name: "Mīm",
      transliteration: "m",
      audioUrl: "",
      forms: {
        isolated: "م",
        initial: "مـ",
        medial: "ـمـ",
        final: "ـم"
      }
    },
    {
      id: 25,
      letter: "ن",
      name: "Nūn",
      transliteration: "n",
      audioUrl: "",
      forms: {
        isolated: "ن",
        initial: "نـ",
        medial: "ـنـ",
        final: "ـن"
      }
    },
    {
      id: 26,
      letter: "ه",
      name: "Hā'",
      transliteration: "h",
      audioUrl: "",
      forms: {
        isolated: "ه",
        initial: "هـ",
        medial: "ـهـ",
        final: "ـه"
      }
    },
    {
      id: 27,
      letter: "و",
      name: "Wāw",
      transliteration: "w",
      audioUrl: "",
      forms: {
        isolated: "و",
        initial: "و",
        medial: "ـو",
        final: "ـو"
      }
    },
    {
      id: 28,
      letter: "ي",
      name: "Yā'",
      transliteration: "y",
      audioUrl: "",
      forms: {
        isolated: "ي",
        initial: "يـ",
        medial: "ـيـ",
        final: "ـي"
      }
    },
    {
      id: 29,
      letter: "ء",
      name: "Hamza",
      transliteration: "'",
      audioUrl: "",
      forms: {
        isolated: "ء",
        initial: "ء",
        medial: "ء",
        final: "ء"
      }
    }

  ];

  // Add empty placeholder formTransliterations for each letter
  const lettersData = baseLettersData.map(letter => {
    // Use empty strings as placeholders for form transliterations
    let formTransliterations = {
      isolated: "",
      initial: "",
      medial: "",
      final: ""
    };

    switch(letter.id) {
      case 1:
        formTransliterations = {
          isolated: "aa",
          initial: "ai",
          medial: "am",
          final: "af"
        };
        break;

    }


    // Return the letter with the added formTransliterations property
    return {
      ...letter,
      formTransliterations
    };
  });

  return NextResponse.json(lettersData);
}
