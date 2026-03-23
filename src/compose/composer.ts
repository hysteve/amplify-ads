import { mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import ora from "ora";
import { TEMPLATES } from "../templates.js";
import { renderAd, type AdCopy, type OutputFormat } from "./renderer.js";
import { generateAdCopy, type CopywriterOptions } from "./copywriter.js";
import type { CampaignBrief, ResolvedProduct, Meta, GeneratedProductMeta } from "../types.js";

export type ComposeOptions = {
  outDir: string;
  format?: OutputFormat | undefined;
  templates?: string[] | undefined;
  copywriter?: CopywriterOptions | undefined;
  imageModel?: string | undefined;
};

export type ComposeResult = {
  outputDir: string;
  creatives: { product: string; template: string; path: string }[];
  meta: Meta;
};

function ratioFilename(aspectRatio: string, format: OutputFormat): string {
  return `${aspectRatio.replace(/:/g, "-")}.${format}`;
}

export async function composeCreatives(
  brief: CampaignBrief,
  products: ResolvedProduct[],
  options: ComposeOptions,
): Promise<ComposeResult> {
  const format: OutputFormat = options.format ?? "png";
  const templates = options.templates
    ? TEMPLATES.filter((t) => options.templates!.includes(t.id))
    : TEMPLATES;

  if (templates.length === 0) {
    throw new Error("No matching templates found");
  }

  const campaignSlug = brief.slug ?? brief.name.toLowerCase().replace(/\s+/g, "-");
  const outputDir = resolve(options.outDir, campaignSlug);
  await mkdir(outputDir, { recursive: true });

  const creatives: ComposeResult["creatives"] = [];
  const generatedProducts: GeneratedProductMeta[] = [];

  for (const product of products) {
    const productDir = join(outputDir, product.slug);
    await mkdir(productDir, { recursive: true });

    const copy = await getCopy(product.name, brief, options.copywriter);

    const ratios: string[] = [];

    for (const template of templates) {
      const spinner = ora({
        text: `Composing ${product.name} — ${template.aspectRatio}`,
        indent: 2,
      }).start();

      try {
        const buf = await renderAd({
          template,
          productImagePath: product.imagePath,
          copy,
          format,
        });

        const filename = ratioFilename(template.aspectRatio, format);
        const outPath = join(productDir, filename);
        await writeFile(outPath, buf);

        spinner.succeed(`${product.name} — ${template.aspectRatio} → ${outPath}`);
        creatives.push({ product: product.slug, template: template.id, path: outPath });
        ratios.push(template.aspectRatio);
      } catch (err) {
        spinner.fail(`${product.name} — ${template.aspectRatio} failed: ${(err as Error).message}`);
      }
    }

    generatedProducts.push({
      slug: product.slug,
      name: product.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ratios,
      sourceImage: product.imagePath,
      imageGenerated: product.generated,
      copyGenerated: !!options.copywriter?.model,
      copy: { headline: copy.headline, cta: copy.cta ?? undefined },
    });
  }

  const templateIds = templates.map((t) => t.id);

  const meta: Meta = {
    campaign: {
      name: brief.name,
      slug: campaignSlug,
      message: brief.message,
      region: brief.region,
      audience: brief.audience,
    },
    generation: {
      imageModel: options.imageModel,
      copyModel: options.copywriter?.model,
      format,
      templates: templateIds,
    },
    products: generatedProducts,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await writeFile(join(outputDir, "meta.json"), JSON.stringify(meta, null, 2));

  return { outputDir, creatives, meta };
}

async function getCopy(
  productName: string,
  brief: CampaignBrief,
  copywriterOpts?: CopywriterOptions | undefined,
): Promise<AdCopy> {
  if (copywriterOpts?.model) {
    try {
      const generated = await generateAdCopy(productName, brief, copywriterOpts);
      return { headline: generated.headline, cta: generated.cta };
    } catch {
      // Fall through to default
    }
  }
  // Default: use campaign message as headline, no CTA
  return { headline: brief.message };
}
