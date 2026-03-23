import type { ProductBrief } from "../types.js";
export type ResolutionResult = {
    slug: string;
    name: string;
} & ({
    found: true;
    imagePath: string;
} | {
    found: false;
});
export declare function resolveProduct(product: ProductBrief): Promise<ResolutionResult>;
//# sourceMappingURL=resolver.d.ts.map