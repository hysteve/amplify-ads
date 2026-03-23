import { generateText, type LanguageModel } from "ai";
import { gateway } from "ai";

export type CopywriterOptions = {
  model?: string | undefined;
};

export type AdCopy = {
  headline: string;
  cta: string;
};

const FALLBACK_HEADLINES: Record<string, never> = {};
void FALLBACK_HEADLINES; // suppress unused

export async function generateAdCopy(
  productName: string,
  campaign: { audience: string; message: string; region: string },
  options?: CopywriterOptions | undefined,
): Promise<AdCopy> {
  if (!options?.model) {
    return fallbackCopy(productName, campaign.message);
  }

  const model: LanguageModel = gateway(options.model);

  const { text } = await generateText({
    model,
    system: [
      "You write punchy ad headlines for social media ads.",
      "Reply with ONLY a JSON object: { \"headline\": \"...\", \"cta\": \"...\" }",
      "The headline should be 3-8 words. The CTA should be 2-4 words.",
      "No quotes around the JSON. No markdown. Just raw JSON.",
    ].join(" "),
    prompt: [
      `Product: ${productName}`,
      `Target audience: ${campaign.audience}`,
      `Campaign message: ${campaign.message}`,
      `Region: ${campaign.region}`,
      `Write a compelling headline and call-to-action.`,
    ].join("\n"),
  });

  try {
    const parsed = JSON.parse(text.trim()) as { headline?: string; cta?: string };
    return {
      headline: parsed.headline ?? productName,
      cta: parsed.cta ?? "Shop Now",
    };
  } catch {
    // LLM didn't return valid JSON — extract what we can
    return fallbackCopy(productName, campaign.message);
  }
}

function fallbackCopy(productName: string, message: string): AdCopy {
  const headline = message.length > 40 ? message.slice(0, 37) + "..." : message;
  return { headline, cta: `Get ${productName}` };
}
