# Digital Atelier — Virtual Try-On Prompt Reference

**File:** `src/backend/services/ai/hubs/VirtualTryOn/index.ts`
**Exports:**
- `buildVirtualTryOnPrompt(inputs)` — dispatcher
- `buildApparelVTONPrompt(inputs)` — Apparel VTON
- `buildJewelleryVTONPrompt(inputs)` — Jewellery worn mode
- `VTON_IDENTITY_LOCK` — shared constant
- `VTON_NEGATIVE_PROMPT` — shared constant

---

## Supported Hubs

| Hub | Support | Notes |
|-----|---------|-------|
| Apparel | ✅ Full | All segments (Ladies/Gents/Kids) and product types |
| Jewellery | ✅ Full | Worn-on-model mode with anatomical placement |
| Accessories | ❌ Not supported | No worn-on-model equivalent |
| Products | ❌ Not supported | No worn-on-model equivalent |

---

## Dispatcher Logic

```
buildVirtualTryOnPrompt(inputs)
  ├── hub === "Apparel"   → buildApparelVTONPrompt
  ├── hub === "Jewellery" → buildJewelleryVTONPrompt
  └── others              → throw Error (not yet supported)
```

---

## Identity Lock (ABSOLUTE — applies to ALL VTON modes)

- Face geometry · pores · freckles · moles · micro-details → **100% preserved**
- Skin tone + undertone → exact match to MODEL_REF. **Zero shift.**
- Body shape · limb volume · proportions · posture → **unchanged**
- Hair colour · length · texture · style → **unchanged**
- No slimming · no reshaping · no enhancement · no beautification
- Identity must be pixel-consistent across all views and all frames
- **If identity mismatch → REJECT AND REGENERATE**

---

## Apparel VTON

**Task:** Redress subject in MODEL_REF with clothing from PRODUCT_IMAGE. Replace ONLY the clothing.

**Includes:**
- Full garment extraction (colour/print/embroidery/borders/cut)
- Fabric physics per identified material (8 fabric types)
- Draping rules per product type (Saree/Lehenga/Kurta Set/etc.)
- Kids proportions guard (when segment = Kids)

**Does NOT change:**
- Face · identity · skin · body shape · proportions
- Pose · posture · camera angle · framing · lighting
- Hair · makeup · accessories (unless part of PRODUCT_IMAGE)

---

## Jewellery VTON (Worn Mode)

**Task:** Place jewellery from PRODUCT_IMAGE onto subject in MODEL_REF. Add ONLY the jewellery.

**Anatomical Placement Rules:**

| Piece | Placement |
|-------|-----------|
| Necklace | Correct collar / décolletage position. Layered correctly if multi-strand. |
| Earrings | At earlobes only. Symmetrical. Correct drop length. No floating. |
| Bangles | At wrists. Naturally stacked if multiple. Correct inner diameter. |
| Maang Tikka | Centred on hair parting. Correct chain length and pendant drop. |
| Rings | On correct finger. Correct size proportion relative to finger. |
| Anklets | At ankles. Correct weight and drape. |

**Does NOT change:** face · identity · skin · body · pose · clothing · hair · makeup

**Jewellery-specific negative additions:**
```
no floating jewellery, no jewellery on wrong body part,
no metal tone shift, no stone colour change,
no missing components, no scale distortion
```

---

## Shared Negative Prompt (All VTON modes)

```
No face alteration, no identity change, no skin tone shift,
no body distortion, no slimming, no reshaping,
no broken anatomy, no extra limbs, no missing limbs,
no waxy skin, no fabric warping, no texture stretching,
no generic AI garments, no floating fabric, no clipping,
no identity drift, no temporal inconsistency
```

---

## Re-export Shim

`src/backend/services/ai/virtual-try-on.ts` is now a thin shim that re-exports from `hubs/VirtualTryOn/index.ts`. All legacy imports remain working without changes.
