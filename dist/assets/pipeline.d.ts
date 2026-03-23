import { type GeneratorOptions } from "./generator.js";
import type { Branding, CampaignBrief, RenderMode, ResolvedProduct } from "../types.js";
export type AssetPipelineOptions = {
    generator?: GeneratorOptions | undefined;
    enhanceImages?: boolean | undefined;
    branding?: Branding | undefined;
    /** Override default render mode selection. */
    overlayMode?: RenderMode | undefined;
};
export declare function resolveAllAssets(brief: CampaignBrief, options: AssetPipelineOptions): Promise<ResolvedProduct[]>;
//# sourceMappingURL=pipeline.d.ts.map