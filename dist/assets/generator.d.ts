export type GeneratorOptions = {
    model: string;
};
export declare function generateProductImage(product: {
    name: string;
    description: string;
    slug: string;
}, campaignContext: {
    audience: string;
    message: string;
}, options: GeneratorOptions): Promise<string>;
//# sourceMappingURL=generator.d.ts.map