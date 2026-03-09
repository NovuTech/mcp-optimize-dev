import { resolve } from "node:path";
import { performance } from "node:perf_hooks";
import { focusedCompress } from "../compressor/focusedCompressor.js";
import { safeCompress } from "../compressor/safeCompressor.js";
import { buildOptimizedContext } from "../context/contextBuilder.js";
import { buildRetrievalIndex } from "../finder/indexer.js";
import { rerankCandidates } from "../finder/reranker.js";
import { retrieveCandidates } from "../finder/retriever.js";
import { scanProjectFiles } from "../finder/scanner.js";
import { DEFAULT_MODE } from "../shared/defaults.js";
import type { CompressedOutput, OptimizeContextRequest, OptimizeContextResponse } from "../shared/types.js";
import { estimateTokens } from "./tokenEstimator.js";

const toContextFiles = (files: { path: string; content: string }[]): CompressedOutput[] => {
  return files.map((file) => ({
    path: file.path,
    compressed: file.content,
    originalChars: file.content.length,
    compressedChars: file.content.length,
  }));
};

export const runOptimizeEngine = async (request: OptimizeContextRequest): Promise<OptimizeContextResponse> => {
  const startAt = performance.now();

  if (!request.prompt?.trim()) {
    throw new Error("prompt is required");
  }

  const projectPath = request.project_path ? resolve(request.project_path) : process.cwd();
  const mode = request.mode ?? DEFAULT_MODE;

  const scannedFiles = await scanProjectFiles({ projectPath });
  const indexEntries = buildRetrievalIndex(scannedFiles);
  const retrieval = retrieveCandidates({
    prompt: request.prompt,
    files: scannedFiles,
    indexEntries,
    topK: request.top_k,
  });
  const reranked = rerankCandidates(retrieval.candidates, retrieval.terms);
  const compressed = mode === "focused" ? focusedCompress(reranked) : safeCompress(reranked);

  const originalContext = buildOptimizedContext(toContextFiles(reranked));
  const compressedContext = buildOptimizedContext(compressed);
  const tokensBefore = estimateTokens(originalContext);
  const compressedTokens = estimateTokens(compressedContext);
  const optimizedContext = compressedTokens <= tokensBefore ? compressedContext : originalContext;
  const tokensAfter = compressedTokens <= tokensBefore ? compressedTokens : tokensBefore;
  const latencyMs = Math.round(performance.now() - startAt);

  return {
    files_used: reranked.map((candidate) => candidate.path),
    tokens_before: tokensBefore,
    tokens_after: tokensAfter,
    optimized_context: optimizedContext,
    latency_ms: latencyMs,
  };
};
