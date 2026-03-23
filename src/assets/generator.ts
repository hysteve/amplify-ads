import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { generateImage } from "ai";
import { gateway } from "ai";

export type GeneratorOptions = {
  model: string;
  apiKey?: string | undefined;
};

export async function generateProductImage(
  productName: string,
  slug: string,
  campaignContext: { audience: string; message: string },
  options: GeneratorOptions,
): Promise<string> {
  const prompt = [
    `High-quality product photo of "${productName}" on a clean background.`,
    `Target audience: ${campaignContext.audience}.`,
    `Campaign theme: ${campaignContext.message}.`,
    `Professional commercial photography, centered subject, soft lighting, no text or logos.`,
  ].join(" ");

  const result = await generateImage({
    model: gateway.image(options.model),
    prompt,
    n: 1,
    size: "1024x1024",
    ...(options.apiKey ? { headers: { Authorization: `Bearer ${options.apiKey}` } } : {}),
  });

  const image = result.image;
  const ext = image.mediaType === "image/jpeg" ? "jpg" : "png";
  const outPath = resolve("assets", "products", slug, `generated.${ext}`);

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, image.uint8Array);

  return outPath;
}
