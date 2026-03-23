import { type GeneratorOptions } from "./generator.js";
import type { CampaignBrief, ResolvedProduct } from "../types.js";
export type AssetPipelineOptions = {
    generator?: GeneratorOptions | undefined;
};
export declare function resolveAllAssets(brief: CampaignBrief, options: AssetPipelineOptions): Promise<ResolvedProduct[]>;
//# sourceMappingURL=pipeline.d.ts.map