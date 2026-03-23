import { access } from "node:fs/promises";
import { resolve } from "node:path";
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg", "webp"];
async function fileExists(path) {
    try {
        await access(path);
        return true;
    }
    catch {
        return false;
    }
}
async function findImage(slug, prefix) {
    for (const ext of IMAGE_EXTENSIONS) {
        const p = resolve("assets", "products", slug, `${prefix}.${ext}`);
        if (await fileExists(p))
            return p;
    }
    return null;
}
export async function resolveProduct(product) {
    const slug = product.slug ?? product.name.toLowerCase().replace(/\s+/g, "-");
    // 1. Explicit image path
    if (product.image) {
        const explicitPath = resolve(product.image);
        if (await fileExists(explicitPath)) {
            return { slug, name: product.name, description: product.description, found: true, imagePath: explicitPath, source: "explicit" };
        }
    }
    // 2. Previously enhanced image
    const enhanced = await findImage(slug, "enhanced");
    if (enhanced) {
        return { slug, name: product.name, description: product.description, found: true, imagePath: enhanced, source: "enhanced" };
    }
    // 3. Convention-based source image
    const source = await findImage(slug, "source");
    if (source) {
        return { slug, name: product.name, description: product.description, found: true, imagePath: source, source: "convention" };
    }
    // 4. Previously generated image
    const generated = await findImage(slug, "generated");
    if (generated) {
        return { slug, name: product.name, description: product.description, found: true, imagePath: generated, source: "generated" };
    }
    // 5. Needs generation
    return { slug, name: product.name, description: product.description, found: false };
}
//# sourceMappingURL=resolver.js.map