# Amplify Ads — Creative Automation Pipeline (POC)

## Overview

This document defines the architecture, data model, asset strategy, rendering system, and phased implementation plan for a local-first CLI tool that generates social ad creatives across multiple aspect ratios.

The system is intentionally scoped to meet MVP requirements while demonstrating thoughtful design and extensibility.

---

## Goals

- Accept a campaign brief (JSON)
- Support multiple products
- Reuse existing assets when available
- Generate missing assets using AI
- Produce creatives in 3 aspect ratios (1:1, 9:16, 16:9)
- Render campaign messaging on final images
- Export outputs in a clean folder structure
- Run locally via CLI

---

## System Architecture

Pipeline:

1. Load campaign input
2. Resolve product assets
3. Generate missing assets (if needed)
4. Compose creatives (3 ratios)
5. Export outputs

Key principle:

- Asset reuse first
- Generation only when needed
- Deterministic composition

---

## Data Model

Campaign:

- products: list of products
- region: string
- audience: string
- message: string

Product:

- name: string
- slug: derived identifier
- optional image path override

Internal Asset:

- product slug
- resolved image path (source or generated)

---

## Asset Strategy

Two layers:

```
ASSETS (reusable inputs)
  assets/
    product-slug/
      source.jpg (optional)
      generated.jpg (fallback)
```

```
OUTPUT (final creatives)
  output/
    product-slug/
      1-1.png
      9-16.png
      16-9.png

Resolution logic:

1. If explicit image path exists → use it
2. Else if assets/product-slug/source exists → use it
3. Else if generated exists → reuse it
4. Else → generate and persist

---

## Rendering Strategy

Each product uses a single resolved image as base.

For each aspect ratio:

- image is cropped using cover + center strategy
- gradient overlay is applied
- text is rendered on top

---

## Template System

Three templates:

1. Square (1:1)

- Balanced layout
- Text top-left
- Product bottom-right

2. Portrait (9:16)

- Mobile-first vertical
- Text top
- Product bottom center

3. Landscape (16:9)

- Banner layout
- Text left
- Product right

All templates:

- use safe padding
- avoid text overflow
- include gradient overlays for readability

---

## Composition Rules

Background (product image):

- cover
- centered or set to template offset

Overlay:

- applied behind text
- varies by ratio (diagonal, vertical, horizontal)

Text:

- headline required (campaign message)

Product:

- preserves aspect ratio
- stays within defined zone
- never overlaps text

---

## CLI Design

Commands:

generate <campaign.json>
interactive

UX:

- clear progress output
- spinners for generation
- success logs for saved files

---

## Dependencies

- Node.js + TypeScript
- satori
- @resvg/resvg-js
- sharp (optional)
- ai SDK
- commander
- inquirer
- ora
- chalk

---

## Implementation Plan

### Sprint 1 — Setup & Input

Goal:

- CLI + campaign parsing

Tasks:

- Initialize project
- CLI entry
- Load JSON
- Validate structure

Output:

- parsed campaign object

---

### Sprint 2 — Asset Handling

Goal:

- resolve or generate product images

Tasks:

- slugify product names
- implement asset lookup
- implement AI fallback
- persist generated images

Output:

- resolved image per product

---

### Sprint 3 — Composition

Goal:

- generate creatives for all ratios

Tasks:

- define 3 template configs
- implement Satori renderer
- apply overlay system
- render text + product
- export SVG → PNG

Output:

- 3 images per product

---

### Sprint 4 — Export & CLI UX

Goal:

- finalize outputs and improve UX

Tasks:

- structured output folders
- CLI progress indicators
- interactive prompts
- polish logs

Output:

- clean UX + organized outputs

---

## Design Decisions

- CLI-first for speed
- template-driven layouts for consistency
- asset caching for efficiency
- minimal AI usage for reliability
- separation of assets vs outputs

---

## Constraints

- no complex layout engine
- no database
- no UI required

---

## Definition of Done

- accepts valid campaign input
- processes ≥2 products
- reuses or generates assets
- outputs 3 ratios per product
- renders readable text
- saves files correctly
- runs locally without friction

---

## Future Enhancements (Not MVP)

- localization support - using `region` field to translate campaign message
- brand validation - separate brand config file or extended campaign brief schema
- performance scoring
- multiple creative variants - use text generation to fill copy variants on campaign brief
- background + product compositing

---

End of document.
```
