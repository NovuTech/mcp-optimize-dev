import type { CandidateFile, CompressedOutput } from "../shared/types.js";
import { safeCompress } from "./safeCompressor.js";

const WINDOW_LINES = 12;

const createFocusedSnippet = (content: string, matchedTerms: string[], matchedSymbols: string[]): string => {
  const lines = content.split("\n");
  const anchors = [...new Set([...matchedTerms, ...matchedSymbols].map((value) => value.toLowerCase()))];

  if (anchors.length === 0) {
    return lines.slice(0, Math.min(lines.length, WINDOW_LINES * 2)).join("\n");
  }

  const selectedIndices = new Set<number>();

  lines.forEach((line, index) => {
    const lowerLine = line.toLowerCase();
    if (anchors.some((anchor) => lowerLine.includes(anchor))) {
      const start = Math.max(0, index - WINDOW_LINES);
      const end = Math.min(lines.length - 1, index + WINDOW_LINES);
      for (let current = start; current <= end; current += 1) {
        selectedIndices.add(current);
      }
    }
  });

  if (selectedIndices.size === 0) {
    return lines.slice(0, Math.min(lines.length, WINDOW_LINES * 2)).join("\n");
  }

  return [...selectedIndices]
    .sort((left, right) => left - right)
    .map((index) => lines[index])
    .join("\n");
};

export const focusedCompress = (candidates: CandidateFile[]): CompressedOutput[] => {
  const focusedCandidates: CandidateFile[] = candidates.map((candidate) => ({
    ...candidate,
    content: createFocusedSnippet(candidate.content, candidate.matchedTerms, candidate.matchedSymbols),
  }));

  return safeCompress(focusedCandidates);
};
