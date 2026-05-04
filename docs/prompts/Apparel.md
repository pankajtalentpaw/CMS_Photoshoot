# Digital Atelier — Apparel Hub Prompt Reference

**File:** `src/backend/services/ai/hubs/Apparel/index.ts`
**Export:** `buildApparelPrompt(inputs: ApparelInputs): string`

---

## Supported Segments

| Segment | Wear Types |
|---------|-----------|
| Ladies  | Ethnic Wear · Western Wear · Custom |
| Gents   | Ethnic Wear · Western Wear · Custom |
| Kids    | Ethnic Wear · Western Wear · Custom |

---

## Product Type Matrix

### Ladies / Ethnic
Saree · Kurti · Kurta Set · Salwar Suit · Lehenga · Dupatta Set · Blouse · Other

### Ladies / Western
Dress · Top · Shirt · Blouse · Skirt · Co-ord Set · Gown / Partywear · Other

### Gents / Ethnic
Kurta · Sherwani · Nehru Jacket · Ethnic Set

### Gents / Western
Shirt · T-shirt · Blazer · Jacket · Trousers · Casual Set

### Kids / Ethnic
Kids Kurta Set · Kids Lehenga · Festive Set

### Kids / Western
Frock · Shirt · Top · Bottomwear · Partywear Set

---

## Product-Type Isolation (MANDATORY)

| Product Type | Allowed Output | Forbidden |
|---|---|---|
| Saree | Saree only (blouse + petticoat support) | Lehenga / kurti / gown / fusion |
| Lehenga | Full set (lehenga + choli + dupatta) | Saree drape / gown mix |
| Kurti | Kurti only (neutral bottom if needed) | Saree / lehenga styling |
| Kurta Set | Full set (kurta + bottom + dupatta if present) | Unrelated garment mix |
| Salwar Suit | Full set (kurta + bottom + dupatta if present) | Unrelated garment mix |
| Dupatta Set | Dupatta with neutral base garment | Full bridal styling unless in source |
| Blouse | Blouse-focused output | Full saree/lehenga unless in PRODUCT_IMAGE |
| Sherwani | Ethnic menswear structure | Casual / western merge |
| Western | Selected western type only | Ethnic blending |

---

## Garment Extraction (Zero Deviation)

- **COLOUR** — Exact hex-level match. No brightening/darkening/saturation shift.
- **PRINT** — All-over · block · digital · woven. Full fidelity. No tiling errors.
- **EMBROIDERY** — Zari · resham · mirror · cutdana · sequin · gota patti. Every element individually rendered.
- **BORDERS** — Exact width · motif · colour. Pallu and hem borders match.
- **CUT** — Neckline · sleeve length · hem length · silhouette exactly from source.

---

## Fabric Physics Table

| Fabric | Physics |
|--------|---------|
| Silk | High sheen · structured drape · crisp fold lines |
| Chiffon | Translucent · floaty · light folds · background visible through sheer layers |
| Cotton | Matte · soft · relaxed drape · no artificial sheen |
| Georgette | Medium flow · subtle texture · moderate weight |
| Net / Organza | Sheer layers · stiff body · visible petticoat beneath |
| Velvet | Deep pile · directional sheen · heavy · minimal flow |
| Crepe | Matte · heavy · clean structured fall |
| Tissue | Metallic sheen · semi-stiff · strong light reflection |

---

## Draping Rules Per Garment

### Saree
- Drape: Nivi (default unless source shows otherwise)
- Petticoat: neatly tucked at waist, not visible above waistband
- Pleats: 5–7 uniform centred front pleats, sharp folds
- Pallu: over left shoulder, natural diagonal fall, full design visible
- Blouse: fitted — **no gap, no pull, no stretch**
- **CRITICAL: Zero blouse gap**

### Lehenga
- Skirt: full circular flare, even ankle-length hem
- Choli: fitted bodice, neckline exactly from source
- Dupatta: per source image placement

### Kurta Set / Salwar Suit
- Kurta: straight or A-line per source
- Bottom: churidar gathers at ankle OR palazzo wide and even
- Dupatta: diagonal chest drape or over both shoulders

### Kurti
- Show with neutral bottom (white or black) unless source specifies

### Dupatta Set
- Natural drape over both/one shoulder, full length visible

### Blouse
- Neckline · sleeve · back design all visible
- Plain petticoat unless source shows full saree

### Sherwani
- All buttons fastened, straight placket
- Even knee-length hem
- Churidar: fitted with clean ankle gathers

### Gown / Partywear
- Train fully visible if present
- Silhouette exactly per source — **no volume flattening**

### Western Fit
- Structured or relaxed per source fabric weight
- Natural body-conforming silhouette, seams reproduced exactly

### Kids
- All proportions to child body
- Age-appropriate styling only — no adult cues

---

## Cloth Physics Rules

- Gravity-driven drape with correct tension at shoulder, waist, hip
- Seams and stitching reproduced from source
- No floating · no clipping · no misalignment
- Opaque fabrics: zero background bleed-through
- Sheer fabrics: correct opacity only where physically accurate

---

## Negative Prompt Additions (Apparel-specific)

```
no category mixing, no blouse gap, no embroidery averaging,
no garment colour drift, no pattern scale error, no tile distortion,
no generic AI garment, no floating fabric, no clipping
```
