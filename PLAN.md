# Amplify Ads — Implementation Plan

## Project Summary

CLI tool that generates social ad creatives (1:1, 9:16, 16:9) from campaign briefs (JSON), source images, and Satori-based templates. Missing product images are generated via AI (Vercel AI SDK). Outputs are organized into a structured folder hierarchy.

---

## Phase 1: Project Setup & Campaign Input

**Goal:** CLI skeleton + campaign brief parsing and validation.

### Tasks

1. **Configure tsconfig for build output**
   - Set `rootDir: "./src"`, `outDir: "./dist"`, add `"node"` to types
   - Ensure ESM output works with `"type": "module"` in package.json

2. **Define types** — `src/types.ts`
   - `CampaignBrief`, `ProductBrief` (from schema doc)
   - `ResolvedProduct` (slug + resolved image path)
   - `TemplateSpec` (from templates doc)
   - `Meta` (meta.json shape)

3. **Slugify utility** — `src/utils/slugify.ts`
   - Convert names to URL-safe slugs (lowercase, hyphens, strip special chars)

4. **Campaign loader + validator** — `src/campaign/loader.ts`
   - Read JSON file, validate required fields (`name`, `region`, `audience`, `message`, `products[]`)
   - Derive slugs where missing (campaign slug, product slugs)
   - Return typed `CampaignBrief`

5. **CLI entry point** — `src/cli.ts`
   - `generate <campaign.json>` command with flags: `--model`, `--model-provider`, `--model-api-key`, `--out-dir`
   - `interactive` command (stub for now)
   - Wire up Commander, parse args, call loader

### Deliverable
Running `amplify-ads generate campaign.json` parses and prints the campaign brief.

---

## Phase 2: Asset Resolution & Image Generation

**Goal:** Resolve existing product images or generate missing ones via AI.

### Tasks

1. **Asset resolver** — `src/assets/resolver.ts`
   - Implement resolution chain:
     1. Explicit `product.image` path → use if file exists
     2. `assets/products/<slug>/source.{png,jpg,webp}` → use if found
     3. `assets/products/<slug>/generated.png` → reuse if exists
     4. Otherwise → mark for generation

2. **Image generator** — `src/assets/generator.ts`
   - Use Vercel AI SDK (`ai` package) to generate product images
   - Accept model, provider, and API key from CLI flags
   - Build a prompt from product name + campaign context (audience, message)
   - Save generated image to `assets/products/<slug>/generated.png`

3. **Asset pipeline orchestrator** — `src/assets/pipeline.ts`
   - For each product: resolve → generate if needed → return `ResolvedProduct[]`
   - Add ora spinners for generation progress

### Deliverable
Running `generate` resolves all product images (local or AI-generated) and writes them to `assets/products/`.

---

## Phase 3: Template System & Composition

**Goal:** Render creatives using Satori templates for all three aspect ratios.

### Tasks

1. **Template definitions** — `src/templates/`
   - `square.ts` (1:1 — 1080x1080)
   - `portrait.ts` (9:16 — 1080x1920)
   - `landscape.ts` (16:9 — 1920x1080)
   - Each exports a `TemplateSpec` + a Satori JSX render function
   - Implement zones, overlay gradients, and typography per spec

2. **Font loading** — `src/templates/fonts.ts`
   - Load a bundled font (e.g., Inter or system font) as ArrayBuffer for Satori
   - Cache across renders

3. **Composer** — `src/composer/compose.ts`
   - For a given product + template + campaign message:
     - Read product image as base64 data URI
     - Build Satori JSX: background image (cover/center), gradient overlay, text zone, product zone
     - Call `satori()` to get SVG string

4. **SVG-to-PNG renderer** — `src/composer/render.ts`
   - Use `@resvg/resvg-js` to convert SVG → PNG buffer
   - Optionally use `sharp` for WebP conversion or further processing

### Deliverable
Given a resolved product and campaign message, produces 3 PNG images (one per ratio).

---

## Phase 4: Export, Meta, & Output Structure

**Goal:** Organize outputs into the documented folder structure with meta.json tracking.

### Tasks

1. **Output path builder** — `src/export/paths.ts`
   - Derive variant folder: `<campaign-slug>/<region>-<message-slug>[-num]/`
   - Handle collision numbering for duplicate message slugs
   - Product subfolder: `<product-slug>/`

2. **Meta.json writer** — `src/export/meta.ts`
   - Create or update `meta.json` in variant folder
   - Track `generatedProducts[]` with timestamps, ratios, source image path, model used
   - Append-only: merge with existing meta if present (resume support)

3. **Exporter** — `src/export/exporter.ts`
   - Write PNG files to `<out-dir>/<variant>/<product>/<ratio>.png`
   - Create directories as needed
   - Log each saved file path

4. **Wire full pipeline** — `src/pipeline.ts`
   - Orchestrate: load → resolve assets → compose all products × all ratios → export
   - Connect to CLI `generate` command

### Deliverable
Full end-to-end pipeline: `amplify-ads generate campaign.json` produces the complete output folder structure.

---

## Phase 5: Interactive Mode & CLI Polish

**Goal:** Interactive prompts and polished CLI UX.

### Tasks

1. **Interactive mode** — `src/cli/interactive.ts`
   - Use Inquirer to prompt for: campaign name, region, audience, message
   - Prompt for products (add/done loop): product name, optional image path
   - Build `CampaignBrief` from answers, feed into pipeline

2. **Progress & logging** — `src/cli/logger.ts`
   - Ora spinners for: loading brief, resolving assets, generating images, composing, exporting
   - Chalk-colored success/error/info messages
   - Summary at end: number of products, creatives generated, output path

3. **Error handling**
   - Graceful errors for: missing campaign file, invalid JSON, failed image generation, missing fonts
   - Non-zero exit codes on failure

4. **Build & bin setup**
   - Verify `npm run build` produces working `dist/cli.js`
   - Verify `amplify-ads` bin link works via `npm link`

### Deliverable
Polished CLI with both `generate` and `interactive` commands, clear progress output, and proper error handling.

---

## File Structure

```
src/
  cli.ts                    # CLI entry (Commander setup)
  pipeline.ts               # Main orchestrator
  types.ts                  # Shared type definitions
  utils/
    slugify.ts              # Name → slug conversion
  campaign/
    loader.ts               # JSON parsing + validation
  assets/
    resolver.ts             # Asset resolution chain
    generator.ts            # AI image generation
    pipeline.ts             # Asset orchestration
  templates/
    fonts.ts                # Font loading for Satori
    square.ts               # 1:1 template
    portrait.ts             # 9:16 template
    landscape.ts            # 16:9 template
  composer/
    compose.ts              # Satori JSX → SVG
    render.ts               # SVG → PNG (Resvg)
  export/
    paths.ts                # Output path derivation
    meta.ts                 # meta.json read/write
    exporter.ts             # File writing
  cli/
    interactive.ts          # Inquirer prompts
    logger.ts               # Ora + Chalk helpers
```

---

## Key Technical Notes

- **Satori** requires JSX (react-jsx) — tsconfig already has `"jsx": "react-jsx"` set
- **Satori** needs fonts loaded as `ArrayBuffer` — bundle a font or read from system
- **Vercel AI SDK** (`ai` package) handles multi-provider image generation — use `generateImage()` with the provider/model from CLI flags
- **Resvg** converts SVG to PNG synchronously — fast, no external deps
- **Sharp** is optional, used only if WebP output or additional image processing is needed
- Templates use absolute pixel positioning within the Satori JSX — no CSS layout engine needed
