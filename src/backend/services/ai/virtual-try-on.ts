import { ApparelInputs } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — VIRTUAL TRY-ON ENGINE v5.1
 *  Clean, deterministic, production-safe prompt builder
 * ─────────────────────────────────────────────────────────────────
 */

export const VTON_IDENTITY_LOCK = `
IDENTITY LOCK — ABSOLUTE. NON-NEGOTIABLE.
Face geometry · bone structure · pores · freckles · moles · all micro-details → 100% preserved.
Skin tone + undertone → exact match to MODEL_REF. Zero shift under any lighting.
Body shape · limb volume · proportions · posture → strictly unchanged.
Hair colour · length · density · texture · style → strictly unchanged.
No slimming · no reshaping · no enhancement · no beautification · no retouching.
No skin smoothing · no symmetry correction · no feature alteration.
Identity must remain pixel-consistent across all views · all angles · all video frames.
No identity drift · no morphing · no flicker · no generative deviation.
If identity mismatch occurs → REJECT AND REGENERATE.
`.trim();

export const VTON_NEGATIVE_PROMPT = `
NEGATIVE CONSTRAINTS — STRICT. NON-NEGOTIABLE.
No category mixing · no hybridization · no fusion of identities.
No face alteration · no identity change · no facial reconstruction.
No skin tone shift · no undertone shift · no color inconsistency.
No body distortion · no slimming · no reshaping · no enhancement.
No broken anatomy · no extra limbs · no missing limbs.
No waxy skin · no plastic skin · no over-smoothing · no artificial texture.
No fabric warping · no texture stretching · no deformation artifacts.
No generic AI garments · no low-detail clothing synthesis.
No floating fabric · no clipping · no garment-body separation · no blouse gap.
No identity drift · no temporal inconsistency · no flicker across frames.
`.trim();

export function buildVirtualTryOnPrompt(inputs: ApparelInputs): string {
  const {
    segment = "Ladies",
    productType = "Garment",
    aiNotes: notes,
  } = inputs;

  const isKids = /kids/i.test(segment);

  return `
[MODE: VIRTUAL TRY-ON] [SEGMENT: ${segment}] [PRODUCT: ${productType}]

── TASK — REDRESS (STRICT. CONTROLLED.) ───────────────────────────────
Redress the subject in MODEL_REF using the clothing from PRODUCT_IMAGE.
Replace ONLY the clothing · preserve the original garment category and structure.
Face · identity · skin · body shape · proportions → 100% preserved.
No change to pose · posture · camera angle · framing · lighting.
Hair · makeup · accessories → unchanged unless part of PRODUCT_IMAGE.
Ensure accurate garment fit, alignment, and natural draping.
Preserve fabric texture · color · patterns · embroidery exactly.
Output must appear as a real photograph of the same person.

── IDENTITY CONSTRAINTS ───────────────────────────────────────────────
${VTON_IDENTITY_LOCK}

${isKids ? `
── KIDS PROPORTIONS — STRICT. AGE-APPROPRIATE. ────────────────────────
Scale all garment dimensions to child body proportions.
Ensure fit · length · volume · silhouette → child-appropriate.
No adult styling cues · no exaggerated shaping.
` : ""}

── GARMENT EXTRACTION — EXACT REPLICATION ─────────────────────────────
COLOUR   Exact hex-level match · zero brightness/saturation drift.
TEXTURE  Faithful reproduction of fabric type and weave.
DETAILS  Embroidery · prints · stitching → 1:1 match.

── DRAPING PHYSICS — REALISTIC SIMULATION ─────────────────────────────
Gravity-driven drape based on fabric weight.
Natural folds · tension · shadows at contact points.
Accurate garment-body interaction.
Zero clipping · zero floating · zero deformation.

${notes ? `
── AI DIRECTOR NOTES ─────────────────────────────────────────────────
${notes}
` : ""}

── NEGATIVE PROMPT — STRICT ENFORCEMENT ───────────────────────────────
${VTON_NEGATIVE_PROMPT}
`.trim();
}