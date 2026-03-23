# Amplify Ads — Creative Automation Pipeline (POC)

A local-first CLI tool that generates social ad creatives across multiple aspect ratios using GenAI + template-based composition.

---

## 🎯 Objective

Demonstrate a working proof-of-concept for automating creative asset generation for social campaigns using:

- Input campaign brief (JSON)
- Existing or AI-generated assets
- Multi-aspect ratio output (1:1, 9:16, 16:9)
- Text rendered on final creatives
- Organized export structure

---

## Features

| Feature | Status |
|---------|--------|
| Campaign brief input (JSON) with validation | Implemented |
| Multi-product support per campaign | Implemented |
| Local asset resolution (explicit path, convention-based, previously generated) | Implemented |
| AI image generation via Vercel AI Gateway (default: Gemini 2.5 Flash) | Implemented |
| Product descriptions used in image generation prompts | Implemented |
| Template-based composition (1:1 square, 9:16 story, 16:9 landscape) | Implemented |
| Gradient overlays and text zones per template | Implemented |
| PNG and WebP output formats | Implemented |
| AI ad copy generation (headline + CTA) with fallback to campaign message | Implemented |
| Structured output directory with `meta.json` tracking | Implemented |
| `.env` file support with CLI flag overrides | Implemented |
| Auto-generated slugs from product/campaign names | Implemented |
| Interactive CLI mode | Not yet implemented |

---

## Tech Stack

- **Node.js** (TypeScript, ES modules)
- **Satori** — JSX to SVG rendering
- **Resvg** — SVG to PNG conversion
- **Sharp** — PNG to WebP conversion
- **Vercel AI SDK + AI Gateway** — AI image and text generation (single API key, any supported model)
- **Commander** — CLI argument parsing
- **Chalk / Ora** — Terminal colors and spinners

---

## 🚀 Usage

### Install & Build

```bash
npm install
npm run build
```

### Commands

#### `generate <campaign-file>`

Generate ad creatives from a campaign brief JSON file.

```bash
amplify-ads generate <campaign-file> [options]
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `--api-key <key>` | Vercel AI Gateway API key (overrides `AI_GATEWAY_API_KEY` env var) | — |
| `--image-model <model>` | Model for AI image generation | `google/gemini-2.5-flash-image` |
| `--generate-copy` | Generate ad copy (headline + CTA) via AI instead of using the campaign message | off |
| `--copy-model <model>` | Model for AI ad copy generation (overrides `AMPLIFY_TEXT_MODEL`) | — |
| `--templates <ids>` | Comma-separated template IDs | `square,story,landscape` |
| `--format <format>` | Output format: `png` or `webp` | `png` |
| `--env <path>` | Path to `.env` config file | `.env` |
| `--out-dir <dir>` | Output directory for creatives | `output` |

#### `interactive`

Build a campaign brief interactively (not yet implemented).

### Environment Variables

Set these in a `.env` file or export them in your shell. CLI flags take precedence.

```bash
AI_GATEWAY_API_KEY=your-api-key          # Required for any AI features
AMPLIFY_IMAGE_MODEL=google/gemini-2.5-flash-image  # Override default image model
AMPLIFY_TEXT_MODEL=anthropic/claude-sonnet-4-20250514  # Default model for --generate-copy
```

### Examples

```bash
# Offline only — compose creatives from existing local assets
amplify-ads generate fixtures/sample-campaign.json

# Generate missing product images via AI
amplify-ads generate fixtures/sample-campaign.json --api-key sk-...

# Use a different image model
amplify-ads generate fixtures/sample-campaign.json \
  --api-key sk-... \
  --image-model google/gemini-2.5-flash-image

# AI-generated ad copy + images
amplify-ads generate fixtures/sample-campaign.json \
  --api-key sk-... \
  --generate-copy

# AI-generated ad copy with a specific model
amplify-ads generate fixtures/sample-campaign.json \
  --api-key sk-... \
  --generate-copy \
  --copy-model anthropic/claude-sonnet-4-20250514

# Output as WebP to a custom directory
amplify-ads generate fixtures/sample-campaign.json \
  --api-key sk-... \
  --format webp \
  --out-dir ./creatives

# Only generate story (9:16) creatives
amplify-ads generate fixtures/sample-campaign.json \
  --api-key sk-... \
  --templates story

# During development (without building)
npx ts-node src/cli.ts generate fixtures/sample-campaign.json --api-key sk-...

# Help
amplify-ads --help
amplify-ads generate --help
```

### Campaign Brief Format

```json
{
  "name": "Summer Kicks 2026",
  "region": "US",
  "audience": "18-35 sneaker enthusiasts",
  "message": "Step into summer with bold new styles",
  "products": [
    {
      "name": "Classic Sneaker",
      "description": "White leather low-top sneaker with a gum sole and minimalist design",
      "slug": "classic-sneaker"
    },
    {
      "name": "Retro Runner",
      "description": "Vintage-inspired mesh running shoe in navy and orange colorway"
    }
  ]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Campaign name |
| `region` | Yes | Target region |
| `audience` | Yes | Target audience description |
| `message` | Yes | Campaign headline / message |
| `products` | Yes | Array of products (at least one) |
| `products[].name` | Yes | Product name |
| `products[].description` | Yes | Short product description (used for AI image generation) |
| `products[].slug` | No | URL-safe identifier (auto-generated from name if omitted) |
| `products[].image` | No | Explicit path to a product image |

### Asset Resolution Order

For each product, the pipeline looks for images in this order:

1. **Explicit path** — `image` field in the campaign brief
2. **Convention-based** — `assets/products/{slug}/source.{png,jpg,jpeg,webp}`
3. **Previously generated** — `assets/products/{slug}/generated.{png,jpg,jpeg,webp}`
4. **AI generation** — generates via the configured image model (requires `--api-key`)

## Output Structure

```
assets/
  products/
    classic-sneaker/
      source.png          # user-provided
    retro-runner/
      generated.png       # AI-generated

output/
  summer-kicks-2026/
    classic-sneaker/
      1-1.png
      9-16.png
      16-9.png
    retro-runner/
      1-1.png
      9-16.png
      16-9.png
    meta.json
```

`meta.json` includes campaign metadata, per-product generation details (timestamps, source image paths, aspect ratios produced), and overall creation/update timestamps.

---

## Design Decisions

- **Offline by default** — The pipeline works entirely locally with existing assets. AI image generation and AI ad copy are opt-in, activated only when an API key is provided. This keeps the default path simple, fast, and free of external dependencies.
- **Single API key via Vercel AI Gateway** — One `AI_GATEWAY_API_KEY` routes to any supported model (Gemini, OpenAI, Flux, etc.) without provider-specific configuration.
- **Separate generation from composition** — Asset resolution and image generation run as a distinct phase before template rendering. This means generated images are cached in `assets/` and reused across runs without re-generating.
- **Single image per product** — Each product resolves to one image used across all aspect ratios. This keeps the pipeline efficient and avoids combinatorial explosion.
- **Template-driven layout** — Templates define canvas size, text/product zones, overlay gradients, and typography. Adding a new aspect ratio or layout is a single object in `templates.ts`.
- **Convention over configuration** — Products are resolved by slug-based directory conventions (`assets/products/{slug}/source.*`), reducing the amount of explicit configuration needed in campaign briefs.
- **Graceful degradation** — If AI generation fails or no API key is set, products without images are skipped with a warning rather than failing the entire run. AI copy falls back to the campaign message.

---

## Assumptions & Limitations

- English-only text rendering (single font, no RTL support)
- No brand guideline validation or color palette enforcement
- No A/B variant generation — one creative per product per template
- AI-generated image quality and style varies by model
- No built-in preview server — outputs are static files
- Interactive mode is stubbed but not yet implemented
