# Digital Atelier — Accessories Hub Prompt Reference

**File:** `src/backend/services/ai/hubs/Accessories/index.ts`
**Export:** `buildAccessoriesPrompt(inputs: AccessoriesInputs): string`

---

## Supported Types

`Bags` · `Footwear` · `Watches` · `Eyewear` · `Belts` · `Scarves / Small Accessories` · `Custom`

---

## Type Isolation (MANDATORY)

Each accessory type must output only that specific accessory. No cross-accessory styling.

---

## Accessory Extraction (Zero Deviation — 5 Dimensions)

| Dimension | Rule |
|-----------|------|
| **MATERIAL** | Leather grain · canvas weave · metal finish · rubber · fabric. Exact physics. |
| **COLOUR** | Exact. **Black leather ≠ dark brown. Navy ≠ black.** No drift. |
| **HARDWARE** | Buckles · zips · clasps · logos · rivets reproduced precisely. |
| **STITCHING** | Visible stitching lines · thread colour exact from source. |
| **SHAPE** | Silhouette and proportions exactly as source. No rounding or smoothing. |

---

## Type-Specific Rendering Rules

### Bags
- Structured shape retained — no sagging unless source shows soft bag
- Handles correctly positioned, strap length from source
- Grounding shadow beneath bag (no floating)
- Interior visible only if source shows open bag
- Logo / branding legible at full resolution

### Footwear
- Show as pair from 3/4 angle unless source shows single shoe
- Correct toe shape · heel height · sole thickness from source
- Laces / buckles / straps reproduced from source
- Clean sole unless lifestyle context

### Watches ⚠️
- Crown position: **3 o'clock** — exactly
- Dial: readable and in sharp focus
- **TIME: Set to 10:10 unless source image shows different time**
- Crystal: sapphire/mineral glass reflection if applicable
- Bracelet/strap: correctly linked, no gaps
- Brand text and logo: legible at full resolution

### Eyewear
- Lens colour and tint exactly from source
- Frame silhouette precisely from source
- Temple arms: correct length and curvature
- No reflections obscuring lens unless artistic

### Belts
- Flat lay or worn per source context
- Buckle: centred, style from source
- Grain direction: consistent along full length
- Holes: visible and evenly spaced if in source

### Scarves / Small Accessories
- Flat lay · folded display · or worn per source
- Print/pattern tiles correctly — no distortion at edges or folds
- Fringe/tassels: reproduced at correct length and density if present

---

## Negative Prompt Additions (Accessories-specific)

```
no cross-accessory styling, no AI-added hardware not in source,
no colour shift (Black ≠ dark brown, Navy ≠ black),
no watch time other than 10:10 (unless source differs),
no sagging bags unless source shows soft bag,
no lens reflections obscuring eyewear,
no shape rounding or smoothing, no logo distortion
```
