export type ProductBrief = {
  slug?: string;
  name: string;
  image?: string | undefined;
};

export type CampaignBrief = {
  slug?: string;
  name: string;
  region: string;
  audience: string;
  message: string;
  products: ProductBrief[];
};

export type ResolvedProduct = {
  slug: string;
  name: string;
  imagePath: string;
  generated: boolean;
};

export type TemplateSpec = {
  id: string;
  aspectRatio: "1:1" | "9:16" | "16:9";
  canvas: {
    width: number;
    height: number;
    padding: number;
  };
  zones: {
    text: {
      x: number;
      y: number;
      width: number;
      height: number;
      align: "left" | "center" | "right";
    };
    product: {
      x: number;
      y: number;
      width: number;
      height: number;
      anchor:
        | "center"
        | "bottom-right"
        | "bottom-center"
        | "right-center";
    };
  };
  overlay: {
    type: "linear-gradient" | "solid";
    direction?: string;
    opacity: number;
  };
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
  imageGenerationModel?: string;
};

export type Meta = {
  campaign: {
    name: string;
    slug: string;
    message: string;
    region: string;
    audience: string;
  };
  generatedProducts: GeneratedProductMeta[];
  createdAt: string;
  updatedAt: string;
};
