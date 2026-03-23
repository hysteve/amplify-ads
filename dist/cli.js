#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { loadCampaign } from "./campaign/loader.js";
import { resolveAllAssets } from "./assets/pipeline.js";
const program = new Command();
program
    .name("amplify-ads")
    .description("Generate social ad creatives from campaign briefs")
    .version("1.0.0");
program
    .command("generate")
    .description("Generate ad creatives from a campaign brief")
    .argument("<campaign-file>", "Path to campaign brief JSON file")
    .option("--model <model>", "Model identifier for image generation")
    .option("--model-provider <provider>", "Model provider for image generation")
    .option("--model-api-key <key>", "API key for the generative model")
    .option("--out-dir <dir>", "Output directory for creatives", "output")
    .action(async (campaignFile, options) => {
    try {
        const brief = await loadCampaign(campaignFile);
        console.log(chalk.green("✓ Campaign loaded:"), brief.name);
        console.log(chalk.dim(`  Region: ${brief.region}`));
        console.log(chalk.dim(`  Audience: ${brief.audience}`));
        console.log(chalk.dim(`  Message: ${brief.message}`));
        console.log(chalk.dim(`  Products: ${brief.products.map((p) => p.name).join(", ")}`));
        console.log(chalk.dim(`  Output: ${options.outDir}`));
        console.log();
        // Resolve / generate product assets
        console.log(chalk.bold("Resolving assets..."));
        const resolved = await resolveAllAssets(brief, {
            generator: options.model
                ? { model: options.model, apiKey: options.modelApiKey }
                : undefined,
        });
        if (resolved.length === 0) {
            console.log(chalk.yellow("\nNo product images resolved. Nothing to compose."));
            return;
        }
        console.log(chalk.green(`\n✓ ${resolved.length} product(s) ready`));
        // TODO: Phase 3+ — composition, export
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
    // TODO: Phase 5 — interactive mode
    console.log(chalk.yellow("Interactive mode is not yet implemented."));
});
program.parse();
//# sourceMappingURL=cli.js.map