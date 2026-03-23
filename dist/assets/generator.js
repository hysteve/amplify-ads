import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { generateText } from "ai";
import { gateway } from "ai";
export async function generateProductImage(product, campaignContext, options) {
    const prompt = [
        `High-quality product photo of "${product.name}": ${product.description}.`,
        `Target audience: ${campaignContext.audience}.`,
        `Campaign theme: ${campaignContext.message}.`,
        `Professional commercial photography, centered subject, soft lighting, no text or logos.`,
    ].join(" ");
    const result = await generateText({
        model: gateway(options.model),
        prompt,
    });
    if (!result.files || result.files.length === 0) {
        throw new Error(`Model ${options.model} returned no images`);
    }
    const file = result.files[0];
    const ext = file.mediaType === "image/jpeg" ? "jpg" : "png";
    const outPath = resolve("assets", "products", product.slug, `generated.${ext}`);
    await mkdir(dirname(outPath), { recursive: true });
    await writeFile(outPath, file.uint8Array);
    return outPath;
}
//# sourceMappingURL=generator.js.map