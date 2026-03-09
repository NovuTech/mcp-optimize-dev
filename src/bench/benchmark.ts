import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runOptimizeEngine } from "../engine/optimizeEngine.js";

const SAMPLE_FILE_COUNT = 30;

const buildSampleContent = (index: number): string => {
  return `
export function refreshAccessToken${index}(currentToken: string): string {
  if (!currentToken) {
    throw new Error("missing token");
  }
  const nextToken = currentToken + "-refreshed-${index}";
  return nextToken;
}

export const authMiddleware${index} = (token: string) => {
  return refreshAccessToken${index}(token);
};
`.trim();
};

const run = async (): Promise<void> => {
  const folder = await mkdtemp(join(tmpdir(), "mcp-token-optimizer-"));
  try {
    await Promise.all(
      Array.from({ length: SAMPLE_FILE_COUNT }).map((_, index) => {
        const filePath = join(folder, `file-${index}.ts`);
        return writeFile(filePath, buildSampleContent(index), "utf8");
      }),
    );

    const result = await runOptimizeEngine({
      prompt: "fix auth middleware token refresh bug",
      project_path: folder,
      mode: "safe",
      top_k: 6,
    });

    process.stdout.write(JSON.stringify(result, null, 2));
    process.stdout.write("\n");
  } finally {
    await rm(folder, { recursive: true, force: true });
  }
};

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
