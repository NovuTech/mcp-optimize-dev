export const DEFAULT_EXTENSIONS = [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"];

export const DEFAULT_IGNORE_PATTERNS = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/.next/**",
  "**/.git/**",
  "**/coverage/**",
];

export const DEFAULT_TOP_K = 8;

export const DEFAULT_MAX_FILE_BYTES = 256_000;

export const DEFAULT_MODE = "safe" as const;
