import type { TemplateSpec } from "./types.js";

const SQUARE: TemplateSpec = {
  id: "square",
  aspectRatio: "1:1",
  canvas: { width: 1080, height: 1080, padding: 60 },
  zones: {
    text: { x: 60, y: 60, width: 500, height: 400, align: "left" },
    product: { x: 580, y: 280, width: 440, height: 740, anchor: "bottom-right" },
  },
  overlay: { type: "linear-gradient", direction: "to right", opacity: 0.65 },
  typography: { headlineSize: 56 },
};

const STORY: TemplateSpec = {
  id: "story",
  aspectRatio: "9:16",
  canvas: { width: 1080, height: 1920, padding: 60 },
  zones: {
    text: { x: 60, y: 100, width: 960, height: 400, align: "center" },
    product: { x: 140, y: 600, width: 800, height: 1200, anchor: "bottom-center" },
  },
  overlay: { type: "linear-gradient", direction: "to bottom", opacity: 0.55 },
  typography: { headlineSize: 64 },
};

const LANDSCAPE: TemplateSpec = {
  id: "landscape",
  aspectRatio: "16:9",
  canvas: { width: 1920, height: 1080, padding: 80 },
  zones: {
    text: { x: 80, y: 80, width: 800, height: 500, align: "left" },
    product: { x: 1000, y: 140, width: 840, height: 860, anchor: "right-center" },
  },
  overlay: { type: "linear-gradient", direction: "to right", opacity: 0.6 },
  typography: { headlineSize: 60 },
};

export const TEMPLATES: TemplateSpec[] = [SQUARE, STORY, LANDSCAPE];

export function getTemplate(id: string): TemplateSpec | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
