import { z } from "zod";
import type { OptimizeContextRequest } from "../../shared/types.js";
import { runOptimizeEngine } from "../../engine/optimizeEngine.js";

export const optimizeContextInputSchema = {
  prompt: z.string().min(1),
  project_path: z.string().optional(),
  mode: z.enum(["safe", "focused"]).optional(),
  top_k: z.number().int().positive().max(30).optional(),
};

export const handleOptimizeContext = async (request: OptimizeContextRequest): Promise<string> => {
  const result = await runOptimizeEngine(request);
  return JSON.stringify(result, null, 2);
};
