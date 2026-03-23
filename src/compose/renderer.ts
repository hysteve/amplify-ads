import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { Branding, RenderMode, TemplateSpec } from "../types.js";
import { ensureContrast } from "./contrast.js";

export type AdCopy = {
  headline: string;
  cta?: string | undefined;
};

export type OutputFormat = "png" | "webp";

type RendererInput = {
  template: TemplateSpec;
  productImagePath: string;
  copy: AdCopy;
  format?: OutputFormat | undefined;
  branding?: Branding | undefined;
  renderMode?: RenderMode | undefined;
};

// ---------------------------------------------------------------------------
// Font loading
// ---------------------------------------------------------------------------

async function loadFont(): Promise<ArrayBuffer> {
  const fontPath = resolve("assets", "fonts", "Inter-Bold.ttf");
  try {
    const buf = await readFile(fontPath);
    return buf.buffer as ArrayBuffer;
  } catch {
    const systemFont = process.platform === "darwin"
      ? "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
      : "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
    const buf = await readFile(systemFont);
    return buf.buffer as ArrayBuffer;
  }
}

// ---------------------------------------------------------------------------
// Dynamic font sizing
// ---------------------------------------------------------------------------

function dynamicHeadlineSize(text: string, templateSize: number): number {
  const len = text.length;
  if (len <= 10) return Math.round(templateSize * 1.5);
  if (len <= 18) return Math.round(templateSize * 1.3);
  if (len <= 28) return Math.round(templateSize * 1.1);
  if (len <= 45) return templateSize;
  return Math.round(templateSize * 0.8);
}

// ---------------------------------------------------------------------------
// Color resolution
// ---------------------------------------------------------------------------

type ResolvedColors = {
  background: string;
  headline: string;
  ctaBackground: string;
  ctaText: string;
};

function resolveColors(branding: Branding | undefined): ResolvedColors {
  const bg = branding?.backgroundColor ?? "#1a1a2e";
  const primary = branding?.primaryColor ?? "#ffffff";
  const secondary = branding?.secondaryColor ?? primary;

  const headline = ensureContrast(branding?.textColor ?? "#ffffff", bg, 4.5);
  const ctaText = ensureContrast(bg, secondary, 4.5);

  return { background: bg, headline, ctaBackground: secondary, ctaText };
}

// ---------------------------------------------------------------------------
// Overlay gradient
// ---------------------------------------------------------------------------

/**
 * Build a CSS linear-gradient that fades the image into the background color.
 * The 100% opaque stop is at the start (image edge), fading to transparent
 * toward the image center so the product remains fully visible.
 */
function buildOverlayGradient(direction: string, bg: string): string {
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);

  // Offset the solid stop past 0% so the image edge is fully hidden,
  // then use a heavy ease that stays opaque longer before fading out.
  return [
    `linear-gradient(${direction}`,
    `rgba(${r},${g},${b},1) 0%`,
    `rgba(${r},${g},${b},1) 12%`,
    `rgba(${r},${g},${b},0.92) 25%`,
    `rgba(${r},${g},${b},0.7) 42%`,
    `rgba(${r},${g},${b},0.45) 58%`,
    `rgba(${r},${g},${b},0.2) 72%`,
    `rgba(${r},${g},${b},0.08) 85%`,
    `rgba(${r},${g},${b},0) 100%)`,
  ].join(", ");
}

// ---------------------------------------------------------------------------
// Main render function
// ---------------------------------------------------------------------------

export async function renderAd(input: RendererInput): Promise<Buffer> {
  const {
    template,
    productImagePath,
    copy,
    format = "png",
    branding,
  } = input;
  const { canvas, text, overlay, typography } = template;

  const colors = resolveColors(branding);
  const fontData = await loadFont();
  const headlineSize = dynamicHeadlineSize(copy.headline, typography.headlineSize);

  // Read product image as base64 data URI
  const imgBuf = await readFile(productImagePath);
  const ext = productImagePath.endsWith(".png") ? "png" : "jpeg";
  const dataUri = `data:image/${ext};base64,${imgBuf.toString("base64")}`;

  const overlayGradient = buildOverlayGradient(overlay.direction, colors.background);

  // --- Text content ---

  const justifyMap = { start: "flex-start", end: "flex-end", center: "center" } as const;

  const textChildren: unknown[] = [
    {
      type: "div" as const,
      props: {
        style: {
          color: colors.headline,
          fontSize: headlineSize,
          fontWeight: 700,
          lineHeight: 1.2,
          textShadow: "0 1px 4px rgba(0,0,0,0.3)",
        },
        children: copy.headline,
      },
    },
  ];

  if (copy.cta) {
    textChildren.push({
      type: "div" as const,
      props: {
        style: {
          marginTop: 20,
          display: "flex",
          justifyContent: text.align === "center" ? "center" : "flex-start",
        },
        children: [
          {
            type: "div" as const,
            props: {
              style: {
                backgroundColor: colors.ctaBackground,
                color: colors.ctaText,
                fontSize: 24,
                fontWeight: 700,
                padding: "12px 32px",
                borderRadius: 8,
              },
              children: copy.cta,
            },
          },
        ],
      },
    });
  }

  // --- Compose layout ---
  // Layer order: solid background → product image → overlay gradient → text

  const element = {
    type: "div" as const,
    props: {
      style: {
        display: "flex",
        position: "relative" as const,
        width: canvas.width,
        height: canvas.height,
        backgroundColor: colors.background,
        overflow: "hidden",
      },
      children: [
        // Product image — fills canvas, offset per template
        {
          type: "img" as const,
          props: {
            src: dataUri,
            style: {
              position: "absolute" as const,
              top: template.imageOffset.y,
              left: template.imageOffset.x,
              width: canvas.width,
              height: canvas.height,
              objectFit: "cover" as const,
            },
          },
        },
        // Overlay gradient — positioned at the image edge, fades image into background
        {
          type: "div" as const,
          props: {
            style: {
              position: "absolute" as const,
              left: overlay.x,
              top: overlay.y,
              width: overlay.width,
              height: overlay.height,
              background: overlayGradient,
            },
          },
        },
        // Text zone — sits on the solid background revealed by the gradient
        {
          type: "div" as const,
          props: {
            style: {
              position: "absolute" as const,
              left: text.x,
              top: text.y,
              width: text.width,
              height: text.height,
              display: "flex",
              flexDirection: "column" as const,
              justifyContent: justifyMap[text.justify],
              textAlign: text.align as "left" | "center" | "right",
            },
            children: textChildren,
          },
        },
      ],
    },
  };

  const svg = await satori(element as Parameters<typeof satori>[0], {
    width: canvas.width,
    height: canvas.height,
    fonts: [
      {
        name: "Inter",
        data: fontData,
        weight: 700,
        style: "normal" as const,
      },
    ],
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: "width" as const, value: canvas.width },
  });

  const pngData = resvg.render();
  const pngBuffer = Buffer.from(pngData.asPng());

  if (format === "webp") {
    return await sharp(pngBuffer).webp({ quality: 90 }).toBuffer();
  }

  return pngBuffer;
}
