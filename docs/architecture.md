# Architecture Overview

---

## 🧩 System Overview

The system is a linear pipeline:

1. Load Campaign Brief
2. Resolve Product Assets
3. Generate Background (if needed)
4. Compose Creatives (3 aspect ratios)
5. Export Outputs

---

## 🔁 Pipeline Flow

```
Campaign JSON
↓
Product Loop
↓
Asset Check → (Generate if missing)
↓
Background Generation (1x)
↓
Template Composition (3x ratios)
↓
Export Images
```

---

## 🧱 Core Modules

### 1. Input Parser

- Reads JSON campaign brief
- Validates structure

### 2. Asset Resolver

- Checks local file existence
- Falls back to AI generation

### 3. Image Generator

- Generates background images
- Ensures center-safe composition

### 4. Composer (Satori)

- Renders layout templates
- Applies text + images

### 5. Exporter

- Converts SVG → PNG/WebP
- Saves to structured folders

---

## 🧠 Key Design Principles

- Deterministic output
- Minimal dependencies between steps
- Replaceable AI layer
- Template-driven rendering

---

## 🖼️ Rendering Strategy

- Use **background-size: cover**
- Center-focused composition
- Text overlay via template (not AI)

see docs/templates.md

---

## ⚡ Performance Considerations

- Generate once, reuse across ratios
- Avoid re-generating assets unnecessarily
- Use fast SVG → PNG pipeline (Resvg)

---
