# Digital Atelier — Products Hub Prompt Reference

**File:** `src/backend/services/ai/hubs/Products/index.ts`
**Export:** `buildProductsPrompt(inputs: ProductsInputs): string`

---

## Supported Families

`Home Decor` · `Beauty / Cosmetics` · `Handicrafts` · `Packaged Products` · `Gifts / Lifestyle` · `Custom`

---

## Family Isolation (MANDATORY)

Each product family outputs only that product. No unrelated product additions.

---

## Product Extraction (Zero Deviation — 5 Dimensions)

| Dimension | Rule |
|-----------|------|
| **SHAPE** | Exact form. No rounding or smoothing of edges. |
| **COLOUR** | Exact — especially critical for cosmetics and packaging. No drift. |
| **LABEL / TEXT** | All text · logos · graphics legible at full resolution. |
| **FINISH** | Matte · Gloss · Frosted · Metallic · Textured. Correct light response. |
| **SIZE** | Relative scale physically correct. Not oversized, not miniaturised. |

---

## Family-Specific Rendering Rules

### Home Decor
- Styled in room setting — product is the clear hero
- Props complement, do not compete
- Warm ambient light
- Show in-use context: vase with flowers · cushion on sofa · lamp switched on

### Beauty / Cosmetics ⚠️
- Surface: white marble or soft pastel — clean and premium
- **Label: fully legible and in sharp focus at all times**
- Macro detail of texture/formula if relevant (serum droplet, powder swatch)
- **No fingerprints on packaging**
- Product upright · cap aligned · label facing camera

### Handicrafts
- Warm artisanal setting
- Surface: jute · wood · terracotta — natural materials
- Natural or warm window light — no harsh studio lighting
- Indian / tribal / folk aesthetic — craft-origin context

### Packaged Products ⚠️
- Background: clean white or gradient
- Package: upright · label facing camera · fully lit
- **No shadows obscuring label text**
- **Label 100% readable**
- Group shot if multiple SKUs in source
- Barcode and small print: legible at full resolution

### Gifts / Lifestyle
- Styled flat lay or gift arrangement per source
- Ribbon · tissue paper · gift box context if relevant
- Warm festive or lifestyle mood — not sterile studio
- Props: festive or lifestyle-appropriate, complementary only

---

## Negative Prompt Additions (Products-specific)

```
no unrelated product additions, no AI-assumed props not in source,
no colour drift, no label text distortion, no label text blur,
no barcode blur, no shape rounding or smoothing,
no incorrect finish (matte ≠ gloss), no incorrect scale,
no fingerprints on packaging, no shadows on label text,
no background competing with product
```
