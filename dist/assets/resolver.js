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
async function findSourceImage(slug) {
    for (const ext of IMAGE_EXTENSIONS) {
        const p = resolve("assets", "products", slug, `source.${ext}`);
        if (await fileExists(p))
            return p;
    }
    return null;
}
async function findGeneratedImage(slug) {
    for (const ext of IMAGE_EXTENSIONS) {
        const p = resolve("assets", "products", slug, `generated.${ext}`);
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
            return { slug, name: product.name, found: true, imagePath: explicitPath };
        }
    }
    // 2. Convention-based source image
    const source = await findSourceImage(slug);
    if (source) {
        return { slug, name: product.name, found: true, imagePath: source };
    }
    // 3. Previously generated image
    const generated = await findGeneratedImage(slug);
    if (generated) {
        return { slug, name: product.name, found: true, imagePath: generated };
    }
    // 4. Needs generation
    return { slug, name: product.name, found: false };
}
//# sourceMappingURL=resolver.js.map