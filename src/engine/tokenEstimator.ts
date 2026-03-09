import { encodingForModel } from "js-tiktoken";

const estimateFallback = (text: string): number => Math.ceil(text.length / 4);

export const estimateTokens = (text: string): number => {
  if (text.length === 0) {
    return 0;
  }

  try {
    const encoder = encodingForModel("gpt-4o");
    return encoder.encode(text).length;
  } catch {
    return estimateFallback(text);
  }
};
