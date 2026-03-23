# Amplify Ads — Creative Automation Pipeline (POC)

A local-first CLI tool that generates social ad creatives across multiple aspect ratios using GenAI + template-based composition.

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
| Overlay gradient composition (per-template image-to-background fade) | Implemented |
| PNG and WebP output formats | Implemented |
| AI ad copy generation (headline + CTA) with fallback to campaign message | Implemented |
| Versioned output directories with `meta.json` tracking | Implemented |
| Region-scoped output folders (`{campaign}-{region}/001/…`) | Implemented |
| `.env` file support with CLI flag overrides | Implemented |
| Auto-generated slugs from product/campaign names | Implemented |
| Branding — brand colors, text color, background, and style hints | Implemented |
| WCAG AA contrast checking — text and CTA colors auto-corrected | Implemented |
| Img-to-img enhancement — enhance provided images via AI (`--enhance-images`) | Implemented |
| Dynamic font sizing — short headlines scale up, long headlines scale down | Implemented |

---

## Tech Stack

- **Node.js** (TypeScript, ES modules)
- **Satori** — JSX to SVG rendering
- **Resvg** — SVG to PNG conversion
- **Sharp** — Image resizing and WebP conversion
- **Vercel AI SDK + AI Gateway** — AI image and text generation (single API key, any supported model)
- **Commander** — CLI argument parsing
- **Chalk / Ora** — Terminal colors and spinners

---

## Usage

### Install & Build

```bash
npm install
npm run build
```

### `generate <campaign-file>`

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
| `--copy-model <model>` | Model for AI ad copy generation (requires `--generate-copy`, overrides `AMPLIFY_TEXT_MODEL`) | — |
| `--enhance-images` | Enhance provided product images via img-to-img AI generation (requires `--api-key`) | off |
| `--overlay-mode <mode>` | Force render mode for all products: `placement` or `overlay` | auto |
| `--templates <ids>` | Comma-separated template IDs | `square,story,landscape` |
| `--format <format>` | Output format: `png` or `webp` | `png` |
| `--env <path>` | Path to `.env` config file | `.env` |
| `--out-dir <dir>` | Output directory for creatives | `output` |

### Environment Variables

Set these in a `.env` file or export them in your shell. CLI flags take precedence.

```bash
AI_GATEWAY_API_KEY=your-api-key          # Required for any AI features
AMPLIFY_IMAGE_MODEL=google/gemini-2.5-flash-image  # Override default image model
AMPLIFY_TEXT_MODEL=anthropic/claude-sonnet-4-20250514  # Model used when --generate-copy is set
```

### Examples

#### Basics

```bash
# Offline — compose creatives from existing local assets (no AI)
amplify-ads generate examples/fitness-full.json

# Generate missing product images via AI
amplify-ads generate examples/fitness-minimal.json --api-key sk-...

# Single-product campaign, story template only
amplify-ads generate examples/coffee-single-product.json \
  --api-key sk-... \
  --templates story
```

#### Branding

Campaigns with a `branding` section automatically apply brand colors to the canvas background and text. Colors are checked for WCAG AA contrast and auto-corrected if they fail. Brand colors and style hints are also passed to AI image generation prompts.

```bash
# Sneaker campaign with branded colors (orange primary, navy secondary)
amplify-ads generate fixtures/sample-campaign.json --api-key sk-...

# Skincare campaign — soft/elegant brand style influences AI image generation
amplify-ads generate examples/skincare-minimal.json --api-key sk-...

# Fitness campaign — high-contrast athletic branding, neon green on black
amplify-ads generate examples/fitness-full.json --api-key sk-...
```

#### Image Enhancement (img-to-img)

Use `--enhance-images` to send existing product images through AI for recomposition — the model adjusts framing, adds breathing room for text, and applies brand style hints.

```bash
# Enhance the provided fitness product images for better ad composition
amplify-ads generate examples/fitness-full.json \
  --api-key sk-... \
  --enhance-images

# Enhance + WebP output to a custom directory
amplify-ads generate examples/fitness-full.json \
  --api-key sk-... \
  --enhance-images \
  --format webp \
  --out-dir ./creatives
```

#### AI Copy Generation

By default the campaign `message` is used as the headline with no CTA. Use `--generate-copy` to generate a headline and CTA via AI.

```bash
# Generate AI headlines + CTAs for each product
amplify-ads generate examples/skincare-minimal.json \
  --api-key sk-... \
  --generate-copy

# Use a specific text model for copy
amplify-ads generate examples/tech-accessories.json \
  --api-key sk-... \
  --generate-copy \
  --copy-model anthropic/claude-sonnet-4-20250514
```

#### Output Options

```bash
# WebP output to a custom directory
amplify-ads generate examples/coffee-single-product.json \
  --api-key sk-... \
  --format webp \
  --out-dir ./creatives

# Only landscape (16:9) creatives
amplify-ads generate examples/tech-accessories.json \
  --api-key sk-... \
  --templates landscape

# Square + story only
amplify-ads generate examples/skincare-minimal.json \
  --api-key sk-... \
  --templates square,story
```

#### Kitchen Sink

```bash
# Everything: AI images, enhancement, AI copy, branding, WebP, custom dir
amplify-ads generate examples/skincare-minimal.json \
  --api-key sk-... \
  --enhance-images \
  --generate-copy \
  --format webp \
  --out-dir ./creatives
```

```bash
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
  "branding": {
    "primaryColor": "#ff6b35",
    "secondaryColor": "#004e89",
    "textColor": "#ffffff",
    "backgroundColor": "#1a1a2e",
    "style": "bold and energetic"
  },
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
| `region` | Yes | Target region (used in output folder naming) |
| `audience` | Yes | Target audience description |
| `message` | Yes | Campaign headline / default message |
| `products` | Yes | Array of products (at least one) |
| `products[].name` | Yes | Product name |
| `products[].description` | Yes | Short product description (used for AI image generation) |
| `products[].slug` | No | URL-safe identifier (auto-generated from name if omitted) |
| `products[].image` | No | Explicit path to a product image |
| `branding` | No | Brand style configuration (see below) |
| `branding.primaryColor` | No | Hex color for CTA backgrounds and AI prompt hints |
| `branding.secondaryColor` | No | Hex color for accents (defaults to primaryColor) |
| `branding.textColor` | No | Hex color for headline text (auto-corrected for WCAG AA contrast) |
| `branding.backgroundColor` | No | Hex color for canvas background (image fades into this) |
| `branding.style` | No | Freeform style hint for AI image generation (e.g. `"minimalist"`, `"bold and energetic"`) |

### How Composition Works

Each ad creative is composed in layers:

1. **Solid background** — filled with `branding.backgroundColor` (default `#1a1a2e`)
2. **Product image** — full-bleed, offset per template so the product sits opposite the text zone
3. **Overlay gradient** — a multi-stop CSS gradient positioned at the image edge, fading from 100% opaque (background color) to fully transparent. This smoothly blends the image into the solid background where text is rendered
4. **Text** — headline (and optional CTA) rendered in the clear area where the gradient has revealed the background

The overlay gradient is per-template: bottom-to-top for square, top-to-bottom for story, left-to-right for landscape. The 100% opaque stop aligns with the image edge so the rolloff is smooth and the product remains fully visible.

**Render modes** control how the product image is fitted:
- **Placement** (default for provided images) — `object-fit: contain`, product shown in full
- **Overlay** (default for generated/enhanced images) — `object-fit: cover`, image fills the canvas for a more immersive look

### Asset Resolution Order

For each product, the pipeline looks for images in this order:

1. **Explicit path** — `image` field in the campaign brief
2. **Previously enhanced** — `assets/products/{slug}/enhanced.{png,jpg,jpeg,webp}`
3. **Convention-based** — `assets/products/{slug}/source.{png,jpg,jpeg,webp}`
4. **Previously generated** — `assets/products/{slug}/generated.{png,jpg,jpeg,webp}`
5. **AI generation** — generates via the configured image model (requires `--api-key`)

If `--enhance-images` is set and the resolved image is a source/explicit image, it is sent through img-to-img AI enhancement before composition. Enhanced images are cached at `assets/products/{slug}/enhanced.*`.

## Output Structure

Each generation run produces a new versioned directory (`001`, `002`, …) so previous outputs are never overwritten. The campaign folder includes the region.

```
assets/
  products/
    classic-sneaker/
      source.png          # user-provided
      enhanced.png        # AI-enhanced (when --enhance-images used)
    retro-runner/
      generated.png       # AI-generated

output/
  summer-kicks-2026-us/
    001/
      classic-sneaker/
        1-1.png
        9-16.png
        16-9.png
      retro-runner/
        1-1.png
        9-16.png
        16-9.png
      meta.json
    002/
      ...
```

`meta.json` includes the version number, campaign metadata, branding configuration, per-product generation details (render mode, image/copy generation flags, timestamps, aspect ratios), and overall creation/update timestamps.

---

## Design Decisions

- **Offline by default** — The pipeline works entirely locally with existing assets. AI image generation, enhancement, and AI copy are opt-in via explicit CLI flags.
- **Single API key via Vercel AI Gateway** — One `AI_GATEWAY_API_KEY` routes to any supported model (Gemini, OpenAI, Flux, etc.) without provider-specific configuration.
- **Overlay gradient composition** — A multi-stop CSS gradient is positioned at the product image edge, fading from the solid background color to transparent. This creates a smooth rolloff into the image without obscuring the product subject.
- **Separate generation from composition** — Asset resolution and image generation run as a distinct phase before template rendering. Generated and enhanced images are cached in `assets/` and reused across runs.
- **Accessible by default** — All text and CTA colors are programmatically checked against WCAG 2.1 AA contrast ratios (4.5:1 minimum). Colors that fail are auto-corrected to white or black.
- **Brand-aware generation** — When branding is defined, AI image prompts include color palette hints, style direction, and composition guidance to leave breathing room around the product subject.
- **Dynamic typography** — Short headlines scale up (to 150% of base) to fill the text zone; long headlines scale down (to 80%) to fit. Text wraps naturally within the zone.
- **Versioned output** — Each generation run creates a new 3-digit versioned subdirectory (`001`, `002`, …) so previous outputs are preserved.
- **Single image per product** — Each product resolves to one image used across all aspect ratios. This keeps the pipeline efficient and avoids combinatorial explosion.
- **Template-driven layout** — Templates define canvas size, text zones, fade masks, image offsets, and typography. Adding a new aspect ratio or layout is a single object in `templates.ts`.
- **Convention over configuration** — Products are resolved by slug-based directory conventions (`assets/products/{slug}/source.*`), reducing the amount of explicit configuration needed in campaign briefs.
- **Graceful degradation** — Enhancement failures fall back to the original image, generation failures skip the product, AI copy falls back to the campaign message.

---

## Assumptions & Limitations

- English-only text rendering (single font, no RTL support)
- No A/B variant generation — one creative per product per template
- AI-generated image quality and style varies by model
- Img-to-img enhancement depends on model support for image input (Gemini 2.5 Flash supports this)
- Contrast checking uses WCAG 2.1 relative luminance against the canvas background — it does not sample the product image itself
- No built-in preview server — outputs are static files
