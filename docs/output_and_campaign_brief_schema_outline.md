# Campaign Brief Schema Outline

The output follows a file structure that derives slugs from the name of the campaign and, campaign variant, and product names, like this:

```
[campaign-name-slug]/
  [region][-message-slug][-num]/
    [product-name-slug]
```

## Type Shape

```ts
type CampaignBrief = {
  slug?: string;
  name: string; // slug derived from name if not present
  region: string;
  audience: string;
  message: string;
  products: ProductBrief[];
};

type ProductBrief = {
  slug?: string;
  name: string; // slug derived from name if not present
  image?: string; // if excluded or path is missing, generate an image
};
```

### Config Example 1: Minimal

```json
{
  "name": "Spring Fitness Push",
  "region": "US",
  "audience": "Fitness enthusiasts",
  "message": "Fuel your workout with clean energy",
  "products": [{ "name": "Protein Bar" }, { "name": "Energy Drink" }]
}
```

Output:

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

### Config Example 2: Full

```json
{
  "slug": "spring-fitness-push",
  "name": "Spring Fitness Push",
  "region": "US",
  "audience": "Fitness enthusiasts",
  "message": "Fuel your workout with clean energy",
  "products": [
    {
      "name": "Protein Bar",
      "slug": "protein-bar",
      "image": "assets/products/protein-bar/source.png"
    },
    {
      "name": "Energy Drink",
      "slug": "energy-drink",
      "image": "assets/products/energy-drink/source.png"
    }
  ]
}
```

Output (with other existing campaign creative)

```txt
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
    us-hydration-that-lasts/
      meta.json
      protein-bar/
      energy-drink/
    uk-energize-your-morning/
      meta.json
      protein-bar/
      energy-drink/
    uk-energize-your-morning-2/
      meta.json
      protein-bar/
      energy-drink/
```

---

## Meta File (meta.json) — Purpose & Structure

The meta.json file lives at the root of each campaign variant output folder and serves as the source of truth for generated state and identity.

Purpose
• Determine whether a campaign run is equivalent to a previous run (for overwrite/resume logic)
• Track what has been generated (products and aspect ratios)
• Enable additive, non-destructive updates
• Support resume behavior (generate only missing assets)

⸻

Core Principles
• Append-only for generated products — never remove historical entries
• Reflect materialized outputs, not just the latest brief
• Keep structure simple and deterministic

```json
{
  "campaign": {
    "name": "string",
    "slug": "string",
    "message": "string",
    "region": "string",
    "audience": "string"
  },
  "generatedProducts": [
    {
      "slug": "string",
      "name": "string",
      "createdAt": "ISO timestamp",
      "updatedAt": "ISO timestamp",
      "ratios": ["1:1", "9:16", "16:9"],
      "sourceImage": "string",
      "imageGenerationModel": "string"
    }
  ],
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

## Rendering Rules

- Required minimum render input:
  - `message`
  - `products`
  - `region`
  - `audience`

- Product image resolution:
  - `product.image` if provided
  - else convention-based lookup in `assets/<slug>/`
