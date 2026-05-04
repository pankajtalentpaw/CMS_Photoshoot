# Digital Atelier — Jewellery Hub Prompt Reference

**File:** `src/backend/services/ai/hubs/Jewellery/index.ts`
**Export:** `buildJewelleryPrompt(inputs: JewelleryInputs): string`

---

## Supported Genres

| Genre | Styles |
|-------|--------|
| Bridal | Full Set · Choker Set · Necklace Set · Earrings · Bangles · Maang Tikka |
| Fashion | Earrings · Rings · Bracelets · Necklaces · Office-wear Sets |
| Traditional / Vintage | Temple · Kundan · Antique Finish · Polki · Festive Sets |
| Daily Wear / Minimal | Studs · Thin Chains · Light Bracelets · Minimal Rings |
| Custom | Free-form description |

---

## Genre Isolation (MANDATORY)

| Genre | Allowed Output | Forbidden |
|-------|----------------|----------|
| Bridal | Full set only (necklace + earrings + maang tikka + bangles) | Minimal / studs-only output |
| Traditional / Vintage | That heritage style only (Kundan/Temple/Polki) | Modern / minimal conversion |
| Daily Wear / Minimal | Lightweight / simple pieces only | Bridal heaviness |
| Fashion | That specific item only | Full set unless source shows complete set |
| Custom | As described in AI_NOTES and PRODUCT_IMAGE | Cross-genre mixing |

---

## Jewellery Extraction (Zero Deviation — 6 Dimensions)

| Dimension | Rule |
|-----------|------|
| **METAL FINISH** | Exact tone: Gold · Silver · Rose Gold · Oxidised · Antique. Zero tone shift. |
| **STONE COLOUR** | Every gemstone exact. Emerald ≠ jade. Ruby ≠ garnet. Sapphire ≠ amethyst. |
| **STONE SETTING** | Kundan · Prong · Bezel · Pavé · Polki — structure preserved exactly. |
| **TEXTURE** | Filigree · engraving · polished · matte · hammered at full resolution. |
| **SCALE** | Correct size relative to body — not oversized, not miniaturised. |
| **COMPONENTS** | Every chain · pendant · earring back · clasp · tassel · jhumka present. |

---

## Genre Directives

### Bridal
- Full set: necklace layered correctly, maang tikka centred, earrings symmetrical, bangles stacked
- Rich warm lighting
- Background: mandap · floral drape · deep jewel tone

### Fashion
- Clean isolated or styled on model
- Minimalist background
- Highlight design and shine

### Traditional / Vintage
- Warm amber / candlelight tones
- Temple/Kundan: deep red, green, or ivory backdrop
- Antique: matte warm lighting, no harsh flash

### Daily Wear / Minimal
- White or soft pastel background
- Natural light feel, no drama

---

## Lighting Table Per Material

| Material | Lighting Rule |
|----------|--------------|
| Gold | Warm key light **3200K** — avoid cold blue tones |
| Silver | Cool diffused **5500K** — soft box |
| Rose Gold | Warm-neutral key — preserve pink undertone |
| Kundan | Side lighting for stone depth and setting detail |
| Pearls | Soft diffused front light — no harsh specular |
| Diamond | Point source or ring light — maximum sparkle |
| Antique | Warm raking light — emphasise texture and patina |
| Polki | Warm ambient fill — preserve uncut stone surface |
| Temple | Warm amber accent — deep red or ivory backdrop |
| Oxidised | Diffused warm light — emphasise surface texture |

---

## Shot Directive

### With MODEL_REF (worn on body)
- Jewellery worn at anatomically correct position
- Correct scale relative to body
- Full Identity Lock applies (face, skin, body — 100% preserved)

### Without MODEL_REF (isolated)
- Flat lay or prop stand
- Macro detail, 45° or overhead angle
- Hand for scale if genre requires
- Clean surface, no competing props

---

## Negative Prompt Additions (Jewellery-specific)

```
no genre mixing, no AI-added components not in source,
no metal tone shift, no stone colour change (Emerald ≠ jade, Ruby ≠ garnet),
no setting style change, no texture smoothing,
no scale distortion, no floating jewellery,
no cold light on gold pieces, no harsh flash on antique pieces
```
