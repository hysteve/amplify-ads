import type { Branding } from "../types.js";
export type GeneratorOptions = {
    model: string;
};
export type GenerateImageContext = {
    audience: string;
    message: string;
    branding?: Branding | undefined;
};
/**
 * Generate a product image via AI, with brand-aware prompting.
 * The image is composed to work as a full-bleed ad background
 * with the subject positioned to leave room for text overlays.
 */
export declare function generateProductImage(product: {
    name: string;
    description: string;
    slug: string;
}, context: GenerateImageContext, options: GeneratorOptions): Promise<string>;
/**
 * Enhance an existing product image via img-to-img generation.
 * Recomposes the product shot as a full-bleed ad background.
 */
export declare function enhanceProductImage(product: {
    name: string;
    description: string;
    slug: string;
}, sourceImagePath: string, context: GenerateImageContext, options: GeneratorOptions): Promise<string>;
//# sourceMappingURL=generator.d.ts.map