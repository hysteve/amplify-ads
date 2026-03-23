import { readFile } from "node:fs/promises";
import { slugify } from "../utils/slugify.js";
export async function loadCampaign(filePath) {
    const raw = await readFile(filePath, "utf-8");
    let data;
    try {
        data = JSON.parse(raw);
    }
    catch {
        throw new Error(`Invalid JSON in campaign file: ${filePath}`);
    }
    return validateCampaign(data);
}
function validateCampaign(data) {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
        throw new Error("Campaign brief must be a JSON object");
    }
    const obj = data;
    const requiredStrings = ["name", "region", "audience", "message"];
    for (const field of requiredStrings) {
        if (typeof obj[field] !== "string" || obj[field].trim() === "") {
            throw new Error(`Campaign brief is missing required field: "${field}"`);
        }
    }
    if (!Array.isArray(obj["products"]) || obj["products"].length === 0) {
        throw new Error("Campaign brief must include at least one product");
    }
    const products = obj["products"].map((p, i) => {
        if (typeof p !== "object" || p === null || Array.isArray(p)) {
            throw new Error(`Product at index ${i} must be an object`);
        }
        const prod = p;
        if (typeof prod["name"] !== "string" || prod["name"].trim() === "") {
            throw new Error(`Product at index ${i} is missing required field: "name"`);
        }
        return {
            name: prod["name"],
            slug: typeof prod["slug"] === "string" && prod["slug"].trim() !== ""
                ? prod["slug"]
                : slugify(prod["name"]),
            image: typeof prod["image"] === "string" && prod["image"].trim() !== ""
                ? prod["image"]
                : undefined,
        };
    });
    const name = obj["name"];
    return {
        name,
        slug: typeof obj["slug"] === "string" && obj["slug"].trim() !== ""
            ? obj["slug"]
            : slugify(name),
        region: obj["region"],
        audience: obj["audience"],
        message: obj["message"],
        products,
    };
}
//# sourceMappingURL=loader.js.map