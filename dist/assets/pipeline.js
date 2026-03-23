import ora from "ora";
import chalk from "chalk";
import { resolveProduct } from "./resolver.js";
import { generateProductImage } from "./generator.js";
export async function resolveAllAssets(brief, options) {
    const resolved = [];
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
            console.log(chalk.yellow("  ⚠"), chalk.dim(`${result.name} — no image found, skipping (no model configured)`));
            continue;
        }
        const spinner = ora({ text: `Generating image for ${result.name}...`, indent: 2 }).start();
        try {
            const imagePath = await generateProductImage({ name: result.name, description: result.description, slug: result.slug }, { audience: brief.audience, message: brief.message }, options.generator);
            spinner.succeed(`${result.name} → ${imagePath}`);
            resolved.push({
                slug: result.slug,
                name: result.name,
                imagePath,
                generated: true,
            });
        }
        catch (err) {
            spinner.fail(`${result.name} — generation failed: ${err.message}`);
        }
    }
    return resolved;
}
//# sourceMappingURL=pipeline.js.map