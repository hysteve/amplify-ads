import type { TemplateSpec } from "./types.js";

/**
 * SQUARE — 1:1
 * Text bottom-left, subject centered slightly upper (image offset y:-100).
 * Overlay gradient at the bottom fades image into the background for text.
 */
const SQUARE: TemplateSpec = {
  id: "square",
  aspectRatio: "1:1",
  canvas: { width: 1080, height: 1080, padding: 60 },
  text: { x: 50, y: 540, width: 740, height: 500, align: "left", justify: "end" },
  overlay: { direction: "to top", x: 0, y: 380, width: 1080, height: 700 },
  imageOffset: { x: 0, y: -100 },
  subjectHint: "center the product in the upper half of the frame, leave the bottom 40% clear for text",
  typography: { headlineSize: 62 },
};

/**
 * STORY — 9:16
 * Text centered at top, subject fills the lower two-thirds (image offset y:80).
 * Overlay gradient at the top fades image into the background for text.
 */
const STORY: TemplateSpec = {
  id: "story",
  aspectRatio: "9:16",
  canvas: { width: 1080, height: 1920, padding: 60 },
  text: { x: 60, y: 80, width: 960, height: 540, align: "center", justify: "center" },
  overlay: { direction: "to bottom", x: 0, y: 0, width: 1080, height: 900 },
  imageOffset: { x: 0, y: 80 },
  subjectHint: "center the product in the lower two-thirds of the frame, leave the top 35% clear",
  typography: { headlineSize: 72 },
};

/**
 * LANDSCAPE — 16:9
 * Text on the left, subject pushed to the right (image offset x:200).
 * Overlay gradient on the left fades image into the background for text.
 */
const LANDSCAPE: TemplateSpec = {
  id: "landscape",
  aspectRatio: "16:9",
  canvas: { width: 1920, height: 1080, padding: 80 },
  text: { x: 70, y: 70, width: 760, height: 760, align: "left", justify: "center" },
  overlay: { direction: "to right", x: 0, y: 0, width: 1100, height: 1080 },
  imageOffset: { x: 200, y: 0 },
  subjectHint: "position the product clearly in the right half of the frame, leave the left 40% clear for text",
  typography: { headlineSize: 66 },
};

export const TEMPLATES: TemplateSpec[] = [SQUARE, STORY, LANDSCAPE];

export function getTemplate(id: string): TemplateSpec | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
