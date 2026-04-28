# Virtual Try-On Prompt System v5.0

This document contains the structured prompts and logic for the **Virtual Try-On** mode.

## 1. Core Task Directive
The primary goal of Virtual Try-On is to redress a subject from a reference image with a garment from a product image while maintaining absolute identity and physical realism.

### Task Description
> "Task: Redress the subject in the model/person image with the clothing from the garment/product image. Replace only the clothing while strictly preserving the subject's face, identity, expression, body proportions, posture, and skin tone."

## 2. Global Constraints

### Identity Lock (Hard Constraints)
- **Face Geometry**: Preserve 100% facial identity (pores, freckles, moles, micro-details).
- **Body Shape**: Maintain exact body shape, limb volume, and proportions.
- **Posture**: No pose change or anatomical alterations.
- **Skin Tone**: Exact match to MODEL_REF. No shift or "beautification".
- **Kids Mode**: If segment = Kids, scale proportions to a child's body and ensure age-appropriate styling.

### Quality Gates
- ✓ Item colour must be an exact hex-level match to source.
- ✓ All surface details (embroidery, print, texture) reproduced with zero AI averaging.
- ✓ Fabric physics must be correct for the identified material weight.
- ✓ No cross-category elements (e.g., no saree elements appearing in a western dress).

## 3. Apparel Draping & Extraction Rules

### Garment Extraction (Source of Truth)
- **Colour**: Faithful reproduction under output lighting.
- **Print**: Digital/woven patterns at full fidelity.
- **Embroidery**: Render zari, resham, and sequins individually.
- **Fabric Identification**:
  - *Silk*: High sheen, stiff folds.
  - *Chiffon*: Translucent, floaty drape.
  - *Velvet*: Deep pile, heavy structure.

### Draping Physics
- **Saree**: Nivi drape; 5-7 uniform front pleats; Pallu over left shoulder with natural diagonal fall.
- **Lehenga**: Full circular flare; even ankle-length hem; fitted choli bodice.
- **Sherwani**: Fastened buttons; straight placket; fitted churidar with clean ankle gathers.
- **Western**: Structured or relaxed fit per fabric weight; natural body-conforming silhouette.

## 4. Legacy Pipeline Logic (Fallback)

### Fabric vs Ready-made
- **Ready-made**: Directly map garment with accurate fit, scale, and perspective.
- **Fabric**: Generate garment using specific Person Type and Category; define material properties (thickness, elasticity, gravity-driven drape) before applying tailoring.

## 5. Negative Prompts
`--no face change, no body distortion, no slimming, no body reshaping, no identity drift, no person swap, no pose change, no fabric warping, no texture stretching, no lighting mismatch, no watermark, no collage.`
