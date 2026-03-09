export type CompressionMode = "safe" | "focused";

export interface OptimizeContextRequest {
  prompt: string;
  project_path?: string;
  mode?: CompressionMode;
  top_k?: number;
}

export interface CandidateFile {
  path: string;
  content: string;
  score: number;
  reasons: string[];
  matchedTerms: string[];
  matchedSymbols: string[];
}

export interface RetrievalIndexEntry {
  path: string;
  filenameTerms: string[];
  contentTerms: string[];
  importTerms: string[];
  symbolTerms: string[];
}

export interface FileScanResult {
  path: string;
  content: string;
}

export interface CompressedOutput {
  path: string;
  compressed: string;
  originalChars: number;
  compressedChars: number;
}

export interface OptimizeContextResponse {
  files_used: string[];
  tokens_before: number;
  tokens_after: number;
  optimized_context: string;
  latency_ms: number;
}

export interface FinderOutput {
  candidates: CandidateFile[];
  terms: string[];
}
