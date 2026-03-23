import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { generateText } from "ai";
import { gateway } from "ai";
import type { Branding } from "../types.js";

export type GeneratorOptions = {
  model: string;
};

export type GenerateImageContext = {
  audience: string;
  message: string;
  branding?: Branding | undefined;
};

/**
 * Generate a product image via AI, with brand-aware prompting.
 * The image is composed to work as a full-bleed ad background
 * with the subject positioned to leave room for text overlays.
 */
export async function generateProductImage(
  product: { name: string; description: string; slug: string },
  context: GenerateImageContext,
  options: GeneratorOptions,
): Promise<string> {
  const colorHints = buildColorHints(context.branding);
  const styleHint = context.branding?.style
    ? `Visual style: ${context.branding.style}.`
    : "";

  const prompt = [
    `High-quality product photo of "${product.name}": ${product.description}.`,
    `Target audience: ${context.audience}.`,
    `Campaign theme: ${context.message}.`,
    colorHints,
    styleHint,
    `Professional commercial photography, soft lighting, no text, no logos, no watermarks.`,
    `COMPOSITION: This image will be used as a full-bleed ad creative background.`,
    `Position the product subject clearly but leave generous breathing room around it —`,
    `at least 25-30% clear space on all sides so text can overlay the edges without`,
    `covering the product. The background should be smooth, atmospheric, and on-brand,`,
    `not a plain studio backdrop. The product must be the clear focal point but should`,
    `not fill the entire frame. There should be no visual elements that would interfere`,
    `with text overlays. The background should extend to the edges of the image without`,
    `harsh lines or borders.`,
  ]
    .filter(Boolean)
    .join(" ");

  const result = await generateText({
    model: gateway(options.model),
    prompt,
  });

  if (!result.files || result.files.length === 0) {
    throw new Error(`Model ${options.model} returned no images`);
  }

  const file = result.files[0]!;
  const ext = file.mediaType === "image/jpeg" ? "jpg" : "png";
  const outPath = resolve(
    "assets",
    "products",
    product.slug,
    `generated.${ext}`,
  );

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, file.uint8Array);

  return outPath;
}

/**
 * Enhance an existing product image via img-to-img generation.
 * Recomposes the product shot as a full-bleed ad background.
 */
export async function enhanceProductImage(
  product: { name: string; description: string; slug: string },
  sourceImagePath: string,
  context: GenerateImageContext,
  options: GeneratorOptions,
): Promise<string> {
  const colorHints = buildColorHints(context.branding);
  const styleHint = context.branding?.style
    ? `Visual style: ${context.branding.style}.`
    : "";

  const imgBuf = await readFile(sourceImagePath);
  const ext =
    sourceImagePath.endsWith(".jpg") || sourceImagePath.endsWith(".jpeg")
      ? "jpeg"
      : "png";
  const dataUri = `data:image/${ext};base64,${imgBuf.toString("base64")}`;

  const prompt = [
    `Enhance this product photo of "${product.name}": ${product.description}.`,
    `Keep the product recognizable but recompose for use as a full-bleed ad background.`,
    `Target audience: ${context.audience}.`,
    `Campaign theme: ${context.message}.`,
    colorHints,
    styleHint,
    `Professional commercial photography, soft lighting, no text, no logos, no watermarks.`,
    `COMPOSITION: Leave generous breathing room around the product — at least 25-30%`,
    `clear space on all sides so text can overlay the edges without covering the subject.`,
    `Extend the background smoothly and atmospherically to fill the full frame.`,
    `The product must be the clear focal point but should not fill the entire frame;`,
    `resize and arrange it as needed. There should be no visual elements that would interfere`,
    `with text overlays. The background should extend to the edges of the image without`,
    `harsh lines or borders.`,
  ]
    .filter(Boolean)
    .join(" ");

  const result = await generateText({
    model: gateway(options.model),
    messages: [
      {
        role: "user" as const,
        content: [
          { type: "image" as const, image: dataUri },
          { type: "text" as const, text: prompt },
        ],
      },
    ],
  });

  if (!result.files || result.files.length === 0) {
    throw new Error(
      `Model ${options.model} returned no images for enhancement`,
    );
  }

  const outFile = result.files[0]!;
  const outExt = outFile.mediaType === "image/jpeg" ? "jpg" : "png";
  const outPath = resolve(
    "assets",
    "products",
    product.slug,
    `enhanced.${outExt}`,
  );

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, outFile.uint8Array);

  return outPath;
}

function buildColorHints(branding?: Branding | undefined): string {
  if (!branding) return "";
  const parts: string[] = [];
  if (branding.primaryColor)
    parts.push(`primary brand color ${branding.primaryColor}`);
  if (branding.secondaryColor)
    parts.push(`secondary color ${branding.secondaryColor}`);
  if (branding.backgroundColor)
    parts.push(`background tone ${branding.backgroundColor}`);
  return parts.length > 0 ? `Color palette hints: ${parts.join(", ")}.` : "";
}
