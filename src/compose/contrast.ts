/**
 * WCAG 2.1 contrast utilities for accessible color usage.
 * All colors are expected as hex strings (e.g. "#ff0000" or "#f00").
 */

/** Parse a hex color string to [r, g, b] (0-255). */
export function parseHex(hex: string): [number, number, number] {
  let h = hex.replace(/^#/, "");
  if (h.length === 3) {
    h = h[0]! + h[0]! + h[1]! + h[1]! + h[2]! + h[2]!;
  }
  const n = parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

/** Convert [r, g, b] back to a hex string. */
export function toHex(rgb: [number, number, number]): string {
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

/** Relative luminance per WCAG 2.1. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** WCAG contrast ratio between two hex colors. Returns value between 1 and 21. */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ensure foreground color has sufficient contrast against background.
 * If the ratio is below `minRatio` (default 4.5 for WCAG AA normal text),
 * returns white or black — whichever provides better contrast.
 */
export function ensureContrast(
  fg: string,
  bg: string,
  minRatio = 4.5,
): string {
  if (contrastRatio(fg, bg) >= minRatio) return fg;
  const whiteRatio = contrastRatio("#ffffff", bg);
  const blackRatio = contrastRatio("#000000", bg);
  return whiteRatio >= blackRatio ? "#ffffff" : "#000000";
}