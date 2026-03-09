import { DEFAULT_TOP_K } from "../shared/defaults.js";
import type { CandidateFile, FileScanResult, RetrievalIndexEntry } from "../shared/types.js";
import { tokenize, uniqueTerms } from "./keywords.js";

const scoreEntry = (entry: RetrievalIndexEntry, queryTerms: string[]): { score: number; reasons: string[]; matched: string[] } => {
  let score = 0;
  const reasons: string[] = [];
  const matched = new Set<string>();

  for (const term of queryTerms) {
    if (entry.filenameTerms.includes(term)) {
      score += 6;
      matched.add(term);
      reasons.push(`filename:${term}`);
    }
    if (entry.symbolTerms.includes(term)) {
      score += 5;
      matched.add(term);
      reasons.push(`symbol:${term}`);
    }
    if (entry.importTerms.includes(term)) {
      score += 3;
      matched.add(term);
      reasons.push(`import:${term}`);
    }
    if (entry.contentTerms.includes(term)) {
      score += 2;
      matched.add(term);
      reasons.push(`content:${term}`);
    }
  }

  return {
    score,
    reasons: uniqueTerms(reasons),
    matched: [...matched],
  };
};

export interface RetrieveCandidatesParams {
  prompt: string;
  files: FileScanResult[];
  indexEntries: RetrievalIndexEntry[];
  topK?: number;
}

export interface RetrieveCandidatesOutput {
  terms: string[];
  candidates: CandidateFile[];
}

export const retrieveCandidates = ({
  prompt,
  files,
  indexEntries,
  topK = DEFAULT_TOP_K,
}: RetrieveCandidatesParams): RetrieveCandidatesOutput => {
  const terms = uniqueTerms(tokenize(prompt));
  const fileMap = new Map(files.map((file) => [file.path, file.content]));

  const candidates: CandidateFile[] = indexEntries
    .map((entry) => {
      const { score, reasons, matched } = scoreEntry(entry, terms);
      return {
        path: entry.path,
        content: fileMap.get(entry.path) ?? "",
        score,
        reasons,
        matchedTerms: matched,
        matchedSymbols: [],
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, topK);

  return {
    terms,
    candidates,
  };
};
