import { getLetters, type Letter } from "@/lib/letters";
import { LetterCell } from "@/components/letter-cell";

// Families in hijāʾī order: consecutive letters that share one base shape
// and differ only by their dots, the way these are traditionally taught
// together (e.g. ب ت ث). Singles (size 1) have no family.
const FAMILY_SIZES = [1, 3, 3, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1];

function buildSiblingMap(letters: Letter[]): Map<number, Letter[]> {
  const map = new Map<number, Letter[]>();
  let cursor = 0;
  for (const size of FAMILY_SIZES) {
    const family = letters.slice(cursor, cursor + size);
    if (size > 1) {
      for (const letter of family) {
        map.set(
          letter.id,
          family.filter((sibling) => sibling.id !== letter.id)
        );
      }
    }
    cursor += size;
  }
  return map;
}

export async function AlphabetGrid() {
  const letters = await getLetters();
  const siblings = buildSiblingMap(letters);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {letters.map((letter) => (
        <LetterCell key={letter.id} letter={letter} siblings={siblings.get(letter.id)} />
      ))}
    </div>
  );
}
