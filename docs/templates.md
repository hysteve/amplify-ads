# Satori Template Layouts

These templates define layout intent, positioning rules, and sizing guidance for three required aspect ratios:

- 1:1
- 9:16
- 16:9

They are intended for Satori-based composition and exported via Resvg.

---

## Shared Design Rules

### Visual structure

Each template uses:

- Background image (cover, centered)
- Contrast overlay
- Product image placement zone
- Message text block

### Shared styling guidance

- Headline should be short and large
- Use strong margin/padding at edges
- Keep content within a safe area of roughly 8–10% inset from outer frame

### Accessibility / readability

- Always place a gradient or tinted overlay behind text
- Prefer left-aligned text in most templates
- Avoid putting text directly over highly detailed image areas
- Clamp headline to 2–4 lines depending on ratio

### Composition strategy

- Product is the visual anchor
- Text is the communication anchor
- Background remains supportive, not primary

---

## Template Contract

Suggested layout object shape:

```ts
type TemplateSpec = {
  id: string;
  aspectRatio: "1:1" | "9:16" | "16:9";
  canvas: {
    width: number;
    height: number;
    padding: number;
  };
  zones: {
    text: {
      x: number;
      y: number;
      width: number;
      height: number;
      align: "left" | "center" | "right";
    };
    product: {
      x: number;
      y: number;
      width: number;
      height: number;
      anchor: "center" | "bottom-right" | "bottom-center" | "right-center";
    };
  };
  overlay: {
    type: "linear-gradient" | "solid";
    direction?: string;
    opacity: number;
  };
  typography: {
    headlineSize: number;
  };
};
```

---

# Template 1: Square 1:1

This is the safest and most balanced layout.

## Template: Square Focus

### ID

`square-focus`

### Aspect Ratio

`1:1`

### Canvas

- Width: 1080
- Height: 1080
- Base padding: 80

### Layout intent

Balanced composition with:

- text in upper-left / left-center
- product in lower-right
- background visible across full frame

This layout is ideal as the base visual reference for the other ratios.

### Zones

#### Text zone

- X: 80
- Y: 110
- Width: 540
- Height: 420
- Alignment: left

Purpose:

- headline

#### Product zone

- X: 610
- Y: 430
- Width: 390
- Height: 500
- Anchor: bottom-right

Purpose:

- product cutout or product image
- dominant but not overwhelming

### Overlay

- Type: linear-gradient
- Direction: left-to-right or top-left to bottom-right
- Opacity: medium
- Strongest behind text area
- Fade near product zone to preserve product clarity

### Typography

- Headline size: 72
- Headline max lines: 3

### Design notes

- Keep product large enough to feel premium
- Leave breathing room between text block and product block
- This template should feel like the “hero” default

### Best use case

- Balanced social post
- Product + messaging equally important

// TODO: Other aspect ratios
