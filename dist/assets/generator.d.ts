export type GeneratorOptions = {
    model: string;
    apiKey?: string | undefined;
};
export declare function generateProductImage(productName: string, slug: string, campaignContext: {
    audience: string;
    message: string;
}, options: GeneratorOptions): Promise<string>;
//# sourceMappingURL=generator.d.ts.map