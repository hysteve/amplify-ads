import ora from "ora";
import chalk from "chalk";
import { resolveProduct } from "./resolver.js";
import { generateProductImage, type GeneratorOptions } from "./generator.js";
import type { CampaignBrief, ResolvedProduct } from "../types.js";

export type AssetPipelineOptions = {
  generator?: GeneratorOptions | undefined;
};

export async function resolveAllAssets(
  brief: CampaignBrief,
  options: AssetPipelineOptions,
): Promise<ResolvedProduct[]> {
  const resolved: ResolvedProduct[] = [];

  for (const product of brief.products) {
    const result = await resolveProduct(product);

    if (result.found) {
      console.log(chalk.green("  ✓"), chalk.dim(`${result.name} → ${result.imagePath}`));
      resolved.push({
        slug: result.slug,
        name: result.name,
        imagePath: result.imagePath,
        generated: false,
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
        result.name,
        result.slug,
        { audience: brief.audience, message: brief.message },
        options.generator,
      );
      spinner.succeed(`${result.name} → ${imagePath}`);
      resolved.push({
        slug: result.slug,
        name: result.name,
        imagePath,
        generated: true,
      });
    } catch (err) {
      spinner.fail(`${result.name} — generation failed: ${(err as Error).message}`);
    }
  }

  return resolved;
}
