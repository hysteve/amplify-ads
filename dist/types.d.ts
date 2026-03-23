export type Branding = {
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    textColor?: string | undefined;
    backgroundColor?: string | undefined;
    style?: string | undefined;
};
export type ProductBrief = {
    slug?: string;
    name: string;
    description: string;
    image?: string | undefined;
};
export type CampaignBrief = {
    slug?: string;
    name: string;
    region: string;
    audience: string;
    message: string;
    products: ProductBrief[];
    branding?: Branding | undefined;
};
export type RenderMode = "placement" | "overlay";
export type ResolvedProduct = {
    slug: string;
    name: string;
    imagePath: string;
    generated: boolean;
    enhanced: boolean;
    renderMode: RenderMode;
};
export type TemplateSpec = {
    id: string;
    aspectRatio: "1:1" | "9:16" | "16:9";
    canvas: {
        width: number;
        height: number;
        padding: number;
    };
    /** Where headline + CTA text is rendered. */
    text: {
        x: number;
        y: number;
        width: number;
        height: number;
        align: "left" | "center" | "right";
        /** Vertical alignment of content within the text zone. */
        justify: "start" | "end" | "center";
    };
    /**
     * Overlay gradient that fades the product image into the background color.
     * Positioned so the fully-opaque stop aligns with the image edge per template.
     */
    overlay: {
        direction: string;
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** Pixel offset applied to the full-bleed image position. */
    imageOffset: {
        x: number;
        y: number;
    };
    /** Prompt hint: where the product subject should be positioned in AI images. */
    subjectHint: string;
    typography: {
        headlineSize: number;
    };
};
export type GeneratedProductMeta = {
    slug: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    ratios: string[];
    sourceImage: string;
    imageGenerated: boolean;
    imageEnhanced: boolean;
    renderMode: RenderMode;
    copyGenerated: boolean;
    copy: {
        headline: string;
        cta: string | undefined;
    };
};
export type Meta = {
    version: string;
    campaign: {
        name: string;
        slug: string;
        message: string;
        region: string;
        audience: string;
    };
    branding: Branding | undefined;
    generation: {
        imageModel: string | undefined;
        copyModel: string | undefined;
        format: string;
        templates: string[];
        enhanceImages: boolean;
    };
    products: GeneratedProductMeta[];
    createdAt: string;
    updatedAt: string;
};
//# sourceMappingURL=types.d.ts.map