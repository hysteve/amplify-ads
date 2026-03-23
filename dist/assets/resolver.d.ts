import type { ProductBrief } from "../types.js";
export type ResolutionResult = {
    slug: string;
    name: string;
    description: string;
} & ({
    found: true;
    imagePath: string;
    source: "explicit" | "convention" | "generated" | "enhanced";
} | {
    found: false;
});
export declare function resolveProduct(product: ProductBrief): Promise<ResolutionResult>;
//# sourceMappingURL=resolver.d.ts.map