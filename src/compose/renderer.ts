import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { TemplateSpec } from "../types.js";

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
  brandColor?: string | undefined;
};

async function loadFont(): Promise<ArrayBuffer> {
  const fontPath = resolve("assets", "fonts", "Inter-Bold.ttf");
  try {
    const buf = await readFile(fontPath);
    return buf.buffer as ArrayBuffer;
  } catch {
    // Fallback to system .ttf (satori can't read .ttc)
    const systemFont = process.platform === "darwin"
      ? "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
      : "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";
    const buf = await readFile(systemFont);
    return buf.buffer as ArrayBuffer;
  }
}

function productStyle(template: TemplateSpec): Record<string, string | number> {
  const { product } = template.zones;
  const base: Record<string, string | number> = {
    position: "absolute",
    width: product.width,
    height: product.height,
    objectFit: "contain",
  };

  switch (product.anchor) {
    case "bottom-right":
      base.right = template.canvas.padding;
      base.bottom = template.canvas.padding;
      break;
    case "bottom-center":
      base.left = product.x;
      base.bottom = template.canvas.padding;
      break;
    case "right-center":
      base.right = template.canvas.padding;
      base.top = product.y;
      break;
    case "center":
      base.left = product.x;
      base.top = product.y;
      break;
  }

  return base;
}

function overlayBackground(template: TemplateSpec): string {
  const { overlay } = template;
  if (overlay.type === "solid") {
    return `rgba(0,0,0,${overlay.opacity})`;
  }
  const dir = overlay.direction ?? "to right";
  return `linear-gradient(${dir}, rgba(0,0,0,${overlay.opacity}), transparent)`;
}

export async function renderAd(input: RendererInput): Promise<Buffer> {
  const { template, productImagePath, copy, format = "png", brandColor = "#ffffff" } = input;
  const { canvas, zones, typography } = template;

  const fontData = await loadFont();

  // Read product image as base64 data URI
  const imgBuf = await readFile(productImagePath);
  const ext = productImagePath.endsWith(".png") ? "png" : "jpeg";
  const dataUri = `data:image/${ext};base64,${imgBuf.toString("base64")}`;

  const textChildren: unknown[] = [
    {
      type: "div" as const,
      props: {
        style: {
          color: brandColor,
          fontSize: typography.headlineSize,
          fontWeight: 700,
          lineHeight: 1.15,
          textShadow: "0 2px 8px rgba(0,0,0,0.5)",
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
          marginTop: 24,
          display: "flex",
          justifyContent: zones.text.align === "center" ? "center" : "flex-start",
        },
        children: [
          {
            type: "div" as const,
            props: {
              style: {
                backgroundColor: brandColor,
                color: "#1a1a2e",
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

  const element = {
    type: "div" as const,
    props: {
      style: {
        display: "flex",
        position: "relative" as const,
        width: canvas.width,
        height: canvas.height,
        backgroundColor: "#1a1a2e",
        overflow: "hidden",
      },
      children: [
        // Product image
        {
          type: "img" as const,
          props: {
            src: dataUri,
            style: productStyle(template),
          },
        },
        // Gradient overlay
        {
          type: "div" as const,
          props: {
            style: {
              position: "absolute" as const,
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: overlayBackground(template),
            },
          },
        },
        // Text zone
        {
          type: "div" as const,
          props: {
            style: {
              position: "absolute" as const,
              left: zones.text.x,
              top: zones.text.y,
              width: zones.text.width,
              height: zones.text.height,
              display: "flex",
              flexDirection: "column" as const,
              justifyContent: "flex-end" as const,
              textAlign: zones.text.align as "left" | "center" | "right",
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
