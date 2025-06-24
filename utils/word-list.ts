export const WORD_LIST = require("./word-list.json") as string[];

// English letter frequency (lower = more common)
const LETTER_FREQ: Record<string, number> = {
  E: 1,
  A: 2,
  R: 3,
  I: 4,
  O: 5,
  T: 6,
  N: 7,
  S: 8,
  L: 9,
  C: 10,
  U: 11,
  D: 12,
  P: 13,
  M: 14,
  H: 15,
  G: 16,
  B: 17,
  F: 18,
  Y: 19,
  W: 20,
  K: 21,
  V: 22,
  X: 23,
  Z: 24,
  J: 25,
  Q: 26,
};

function wordDifficultyScore(word: string): number {
  // Sum the frequency score for each letter (higher = harder)
  return word
    .toUpperCase()
    .split("")
    .reduce((sum, letter) => sum + (LETTER_FREQ[letter] || 26), 0);
}

export function getRandomWord(): string {
  return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}

export function getWordSequence(count: number, difficulty: string): string[] {
  // Score all words
  const scored = WORD_LIST.map((word) => ({
    word: word.toUpperCase(),
    score: wordDifficultyScore(word),
  }));
  // Sort by score (easy = lowest, hard = highest)
  scored.sort((a, b) => a.score - b.score);
  // Bucket by difficulty (use thirds for even distribution)
  let bucket: { word: string; score: number }[];
  const third = Math.floor(scored.length / 3);
  if (difficulty === "easy") {
    bucket = scored.slice(0, third); // lowest scores = easiest
  } else if (difficulty === "hard") {
    bucket = scored.slice(2 * third); // highest scores = hardest
  } else {
    bucket = scored.slice(third, 2 * third); // middle scores = normal
  }
  // Shuffle and pick
  const shuffled = bucket.sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, count).map((w) => w.word);
  return result;
}

export function isValidWord(word: string): boolean {
  return WORD_LIST.map((word) => word.toUpperCase()).includes(
    word.toUpperCase()
  );
}
