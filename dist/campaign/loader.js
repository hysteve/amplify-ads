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
        if (typeof prod["description"] !== "string" || prod["description"].trim() === "") {
            throw new Error(`Product at index ${i} is missing required field: "description"`);
        }
        return {
            name: prod["name"],
            description: prod["description"],
            slug: typeof prod["slug"] === "string" && prod["slug"].trim() !== ""
                ? prod["slug"]
                : slugify(prod["name"]),
            image: typeof prod["image"] === "string" && prod["image"].trim() !== ""
                ? prod["image"]
                : undefined,
        };
    });
    const name = obj["name"];
    const branding = validateBranding(obj["branding"]);
    return {
        name,
        slug: typeof obj["slug"] === "string" && obj["slug"].trim() !== ""
            ? obj["slug"]
            : slugify(name),
        region: obj["region"],
        audience: obj["audience"],
        message: obj["message"],
        products,
        branding,
    };
}
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
function validateBranding(raw) {
    if (raw === undefined || raw === null)
        return undefined;
    if (typeof raw !== "object" || Array.isArray(raw)) {
        throw new Error("branding must be an object");
    }
    const b = raw;
    const result = {};
    for (const key of ["primaryColor", "secondaryColor", "textColor", "backgroundColor"]) {
        if (b[key] !== undefined) {
            if (typeof b[key] !== "string" || !HEX_RE.test(b[key])) {
                throw new Error(`branding.${key} must be a hex color (e.g. "#ff6600")`);
            }
            result[key] = b[key];
        }
    }
    if (b["style"] !== undefined) {
        if (typeof b["style"] !== "string" || b["style"].trim() === "") {
            throw new Error("branding.style must be a non-empty string");
        }
        result.style = b["style"];
    }
    return Object.keys(result).length > 0 ? result : undefined;
}
//# sourceMappingURL=loader.js.map