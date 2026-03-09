import type { CandidateFile, CompressedOutput } from "../shared/types.js";

const removeBlockComments = (content: string): string => content.replace(/\/\*[\s\S]*?\*\//g, "");
const removeLineComments = (content: string): string => content.replace(/(^|\s+)\/\/.*$/gm, "$1");

export const safeCompress = (candidates: CandidateFile[]): CompressedOutput[] => {
  return candidates.map((candidate) => {
    const withoutBlockComments = removeBlockComments(candidate.content);
    const withoutLineComments = removeLineComments(withoutBlockComments);
    const normalizedLines = withoutLineComments
      .split("\n")
      .map((line) => line.replace(/\s+/g, " ").trimEnd())
      .filter((line, index, lines) => !(line.length === 0 && lines[index - 1]?.length === 0));

    const compressed = normalizedLines.join("\n").trim();

    return {
      path: candidate.path,
      compressed,
      originalChars: candidate.content.length,
      compressedChars: compressed.length,
    };
  });
};
