import type { CompressedOutput } from "../shared/types.js";

export const buildOptimizedContext = (compressedFiles: CompressedOutput[]): string => {
  return compressedFiles
    .map((file) => [`### FILE: ${file.path}`, file.compressed].join("\n"))
    .join("\n\n")
    .trim();
};
