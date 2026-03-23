import { readFile } from "node:fs/promises";
import { slugify } from "../utils/slugify.js";
import type { CampaignBrief } from "../types.js";

export async function loadCampaign(filePath: string): Promise<CampaignBrief> {
  const raw = await readFile(filePath, "utf-8");

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error(`Invalid JSON in campaign file: ${filePath}`);
  }

  return validateCampaign(data);
}

function validateCampaign(data: unknown): CampaignBrief {
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new Error("Campaign brief must be a JSON object");
  }

  const obj = data as Record<string, unknown>;

  const requiredStrings = ["name", "region", "audience", "message"] as const;
  for (const field of requiredStrings) {
    if (typeof obj[field] !== "string" || (obj[field] as string).trim() === "") {
      throw new Error(`Campaign brief is missing required field: "${field}"`);
    }
  }

  if (!Array.isArray(obj["products"]) || obj["products"].length === 0) {
    throw new Error("Campaign brief must include at least one product");
  }

  const products = obj["products"].map((p: unknown, i: number) => {
    if (typeof p !== "object" || p === null || Array.isArray(p)) {
      throw new Error(`Product at index ${i} must be an object`);
    }
    const prod = p as Record<string, unknown>;

    if (typeof prod["name"] !== "string" || prod["name"].trim() === "") {
      throw new Error(`Product at index ${i} is missing required field: "name"`);
    }

    return {
      name: prod["name"] as string,
      slug:
        typeof prod["slug"] === "string" && prod["slug"].trim() !== ""
          ? (prod["slug"] as string)
          : slugify(prod["name"] as string),
      image:
        typeof prod["image"] === "string" && prod["image"].trim() !== ""
          ? (prod["image"] as string)
          : undefined,
    };
  });

  const name = obj["name"] as string;

  return {
    name,
    slug:
      typeof obj["slug"] === "string" && obj["slug"].trim() !== ""
        ? (obj["slug"] as string)
        : slugify(name),
    region: obj["region"] as string,
    audience: obj["audience"] as string,
    message: obj["message"] as string,
    products,
  };
}
