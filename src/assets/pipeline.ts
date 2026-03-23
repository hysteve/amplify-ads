import ora from "ora";
import chalk from "chalk";
import { resolveProduct } from "./resolver.js";
import {
  generateProductImage,
  enhanceProductImage,
  type GeneratorOptions,
  type GenerateImageContext,
} from "./generator.js";
import type { Branding, CampaignBrief, RenderMode, ResolvedProduct } from "../types.js";

export type AssetPipelineOptions = {
  generator?: GeneratorOptions | undefined;
  enhanceImages?: boolean | undefined;
  branding?: Branding | undefined;
  /** Override default render mode selection. */
  overlayMode?: RenderMode | undefined;
};

export async function resolveAllAssets(
  brief: CampaignBrief,
  options: AssetPipelineOptions,
): Promise<ResolvedProduct[]> {
  const resolved: ResolvedProduct[] = [];
  const context: GenerateImageContext = {
    audience: brief.audience,
    message: brief.message,
    branding: options.branding ?? brief.branding,
  };

  for (const product of brief.products) {
    const result = await resolveProduct(product);

    if (result.found) {
      const isGenerated = result.source === "generated" || result.source === "enhanced";
      let imagePath = result.imagePath;
      let enhanced = result.source === "enhanced";

      // Enhance existing source/explicit images if requested
      if (
        options.enhanceImages &&
        options.generator &&
        (result.source === "convention" || result.source === "explicit")
      ) {
        const spinner = ora({ text: `Enhancing image for ${result.name}...`, indent: 2 }).start();
        try {
          imagePath = await enhanceProductImage(
            { name: result.name, description: result.description, slug: result.slug },
            result.imagePath,
            context,
            options.generator,
          );
          spinner.succeed(`${result.name} → enhanced → ${imagePath}`);
          enhanced = true;
        } catch (err) {
          spinner.fail(`${result.name} — enhancement failed: ${(err as Error).message}, using original`);
        }
      } else {
        console.log(chalk.green("  ✓"), chalk.dim(`${result.name} → ${result.imagePath}`));
      }

      // Default: provided images use placement, generated/enhanced use overlay
      const renderMode = options.overlayMode ?? (isGenerated || enhanced ? "overlay" : "placement");

      resolved.push({
        slug: result.slug,
        name: result.name,
        imagePath,
        generated: isGenerated,
        enhanced,
        renderMode,
      });
      continue;
    }

    // Needs generation
    if (!options.generator) {
      console.log(
        chalk.yellow("  ⚠"),
        chalk.dim(`${result.name} — no image found, skipping (no model configured)`),
      );
      continue;
    }

    const spinner = ora({ text: `Generating image for ${result.name}...`, indent: 2 }).start();
    try {
      const imagePath = await generateProductImage(
        { name: result.name, description: result.description, slug: result.slug },
        context,
        options.generator,
      );
      spinner.succeed(`${result.name} → ${imagePath}`);
      resolved.push({
        slug: result.slug,
        name: result.name,
        imagePath,
        generated: true,
        enhanced: false,
        renderMode: options.overlayMode ?? "overlay",
      });
    } catch (err) {
      spinner.fail(`${result.name} — generation failed: ${(err as Error).message}`);
    }
  }

  return resolved;
}
