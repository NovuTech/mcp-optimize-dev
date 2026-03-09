const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "to",
  "for",
  "in",
  "on",
  "at",
  "of",
  "is",
  "are",
  "be",
  "with",
  "and",
  "or",
  "fix",
  "issue",
  "bug",
]);

export const tokenize = (value: string): string[] => {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_./-]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
};

export const uniqueTerms = (terms: string[]): string[] => {
  return [...new Set(terms)];
};
