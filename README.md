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

## ⚙️ Features

- Accept campaign brief (JSON)
- Support multiple products
- Reuse local assets when available
- Generate missing assets via AI
- Compose creatives using templates (multiple aspect ratios)
- Export PNG/WebP outputs
- Interactive CLI mode
- Clean output directory structure

---

## 🧱 Tech Stack

- Node.js (TypeScript)
- Satori (SVG rendering)
- Resvg (SVG → PNG)
- Sharp (optional format conversion)
- Vercel AI SDK (image generation)
- Commander / Inquirer (CLI)
- Chalk / Ora (CLI UX)

---

## 🚀 Usage

```bash
npm install
npm run build

# Run with input file
node dist/cli.js generate ./campaign.json

# Interactive mode
node dist/cli.js interactive # interactive mode
```

## Commands

```bash
# Commands
cmd generate [campaign-file.json] # run the command with a campaign file (required)
cmd interactive # run interactive mode

# Flags
--model # the selected LM model string for product image generation
--model-provider # the selected LM model provider for image generation
--model-api-key # your API key for the generative model
--out-dir # the destination directory for creative
```

## 📂 Output Structure

see docs/output_and_campaign_brief_schema_outline.md

```txt
assets/
  products/
    protein-bar/
      generated.png
    energy-drink/
      generated.png

output/
  spring-fitness-push/
    us-fuel-your-workout/
      meta.json
      protein-bar/
        1-1.png
        9-16.png
        16-9.png
      energy-drink/
        1-1.png
        9-16.png
        16-9.png
```

---

## 🧠 Design Decisions

    •	Separate generation from composition
    •	Use single image per product for efficiency
    •	Use template-driven layout for consistency
    •	Optimize for local execution and simplicity

---

## ⚠️ Assumptions & Limitations

    •	English-only text rendering (MVP)
    •	No advanced brand validation
    •	No performance tracking
    •	Image generation may vary by provider

---

## 📹 Demo

Record a short demo showing:
• CLI usage
• Generated outputs
• Folder structure

```

```
