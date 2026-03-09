import { describe, expect, it } from "vitest";
import { buildRetrievalIndex } from "../indexer.js";
import { retrieveCandidates } from "../retriever.js";

describe("retrieveCandidates", () => {
  it("ranks auth related file higher for auth query", () => {
    const files = [
      {
        path: "src/middleware/auth.ts",
        content: "export function authMiddleware(token: string) { return token; }",
      },
      {
        path: "src/utils/date.ts",
        content: "export const now = () => new Date();",
      },
    ];

    const indexEntries = buildRetrievalIndex(files);
    const result = retrieveCandidates({
      prompt: "fix auth middleware token refresh bug",
      files,
      indexEntries,
      topK: 2,
    });

    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0].path).toBe("src/middleware/auth.ts");
  });
});
