#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { loadCampaign } from "./campaign/loader.js";
import { resolveAllAssets } from "./assets/pipeline.js";
import { composeCreatives } from "./compose/composer.js";
import { loadConfig } from "./config.js";
const program = new Command();
program
    .name("amplify-ads")
    .description("Generate social ad creatives from campaign briefs")
    .version("1.0.0");
program
    .command("generate")
    .description("Generate ad creatives from a campaign brief")
    .argument("<campaign-file>", "Path to campaign brief JSON file")
    .option("--api-key <key>", "Vercel AI Gateway API key (overrides AI_GATEWAY_API_KEY)")
    .option("--image-model <model>", "Model for image generation (default: google/gemini-2.5-flash-image)", "google/gemini-2.5-flash-image")
    .option("--generate-copy", "Generate ad copy (headline + CTA) via AI instead of using campaign message")
    .option("--copy-model <model>", "Model for AI ad copy (overrides AMPLIFY_TEXT_MODEL)")
    .option("--templates <ids>", "Comma-separated template IDs (square,story,landscape)", "square,story,landscape")
    .option("--format <format>", "Output format: png or webp", "png")
    .option("--env <path>", "Path to .env config file")
    .option("--out-dir <dir>", "Output directory for creatives", "output")
    .action(async (campaignFile, options) => {
    try {
        const config = await loadConfig(options.env);
        const brief = await loadCampaign(campaignFile);
        console.log(chalk.green("✓ Campaign loaded:"), brief.name);
        console.log(chalk.dim(`  Region: ${brief.region}`));
        console.log(chalk.dim(`  Audience: ${brief.audience}`));
        console.log(chalk.dim(`  Message: ${brief.message}`));
        console.log(chalk.dim(`  Products: ${brief.products.map((p) => p.name).join(", ")}`));
        console.log(chalk.dim(`  Output: ${options.outDir}`));
        console.log();
        const apiKey = options.apiKey ?? config.apiKey;
        if (apiKey) {
            process.env.AI_GATEWAY_API_KEY = apiKey;
        }
        const imageModel = options.imageModel ?? config.imageModel ?? "google/gemini-2.5-flash-image";
        const copyModel = options.copyModel ?? config.textModel;
        const generateCopy = options.generateCopy ?? !!copyModel;
        const format = (options.format === "webp" ? "webp" : "png");
        // Resolve / generate product assets
        console.log(chalk.bold("Resolving assets..."));
        const resolved = await resolveAllAssets(brief, {
            generator: apiKey
                ? { model: imageModel }
                : undefined,
        });
        if (resolved.length === 0) {
            console.log(chalk.yellow("\nNo product images resolved. Nothing to compose."));
            return;
        }
        console.log(chalk.green(`\n✓ ${resolved.length} product(s) ready`));
        // Compose ad creatives
        console.log(chalk.bold("\nComposing creatives..."));
        const templateIds = options.templates.split(",").map((s) => s.trim());
        const result = await composeCreatives(brief, resolved, {
            outDir: options.outDir,
            format,
            templates: templateIds,
            copywriter: generateCopy
                ? { model: copyModel }
                : undefined,
            imageModel: apiKey ? imageModel : undefined,
        });
        console.log(chalk.green(`\n✓ ${result.creatives.length} creative(s) generated`));
        console.log(chalk.dim(`  Output: ${result.outputDir}`));
        console.log(chalk.dim(`  Meta: ${result.outputDir}/meta.json`));
    }
    catch (err) {
        console.error(chalk.red("Error:"), err.message);
        process.exit(1);
    }
});
program
    .command("interactive")
    .description("Build a campaign brief interactively")
    .action(async () => {
    // TODO: interactive mode
    console.log(chalk.yellow("Interactive mode is not yet implemented."));
});
program.parse();
//# sourceMappingURL=cli.js.map