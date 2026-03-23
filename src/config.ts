import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export type ModelConfig = {
  apiKey?: string | undefined;
  imageModel?: string | undefined;
  textModel?: string | undefined;
};

/**
 * Load model configuration from .env file and environment variables.
 * CLI args take precedence over env vars, which take precedence over .env file.
 */
export async function loadConfig(envPath?: string | undefined): Promise<ModelConfig> {
  const filePath = envPath ?? resolve(".env");

  // Parse .env file (simple key=value, no interpolation)
  const fileVars: Record<string, string> = {};
  try {
    const raw = await readFile(filePath, "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      fileVars[key] = val;
    }
  } catch {
    // No .env file — that's fine
  }

  function get(key: string): string | undefined {
    return process.env[key] ?? fileVars[key];
  }

  return {
    apiKey: get("AI_GATEWAY_API_KEY"),
    imageModel: get("AMPLIFY_IMAGE_MODEL"),
    textModel: get("AMPLIFY_TEXT_MODEL"),
  };
}
