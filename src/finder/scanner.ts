import fg from "fast-glob";
import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import {
  DEFAULT_EXTENSIONS,
  DEFAULT_IGNORE_PATTERNS,
  DEFAULT_MAX_FILE_BYTES,
} from "../shared/defaults.js";
import type { FileScanResult } from "../shared/types.js";

const extensionToGlob = (extension: string): string => `**/*${extension}`;

export interface ScanProjectOptions {
  projectPath: string;
  ignorePatterns?: string[];
  extensions?: string[];
  maxFileBytes?: number;
}

export const scanProjectFiles = async ({
  projectPath,
  ignorePatterns = DEFAULT_IGNORE_PATTERNS,
  extensions = DEFAULT_EXTENSIONS,
  maxFileBytes = DEFAULT_MAX_FILE_BYTES,
}: ScanProjectOptions): Promise<FileScanResult[]> => {
  const patterns = extensions.map(extensionToGlob);
  const paths = await fg(patterns, {
    cwd: projectPath,
    ignore: ignorePatterns,
    dot: false,
    onlyFiles: true,
    absolute: true,
    followSymbolicLinks: false,
  });

  const files = await Promise.all(
    paths.map(async (absolutePath) => {
      const contentBuffer = await readFile(absolutePath);
      if (contentBuffer.byteLength > maxFileBytes) {
        return null;
      }
      return {
        path: relative(projectPath, absolutePath),
        content: contentBuffer.toString("utf8"),
      } satisfies FileScanResult;
    }),
  );

  return files.filter((file): file is FileScanResult => file !== null);
};
