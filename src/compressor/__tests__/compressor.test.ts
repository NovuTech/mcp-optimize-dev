import { describe, expect, it } from "vitest";
import { safeCompress } from "../safeCompressor.js";

describe("safeCompress", () => {
  it("removes comments and extra blank lines", () => {
    const output = safeCompress([
      {
        path: "src/a.ts",
        content: `// heading\n\nexport const a = 1;\n/* hidden */\n\nexport const b = 2;`,
        score: 5,
        reasons: [],
        matchedTerms: [],
        matchedSymbols: [],
      },
    ]);

    expect(output[0].compressed).toContain("export const a = 1;");
    expect(output[0].compressed).toContain("export const b = 2;");
    expect(output[0].compressed).not.toContain("hidden");
    expect(output[0].compressed).not.toContain("heading");
  });
});
