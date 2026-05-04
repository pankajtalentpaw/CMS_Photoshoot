import {
  PromptInputs,
  ApparelInputs,
  JewelleryInputs,
  AccessoriesInputs,
} from "../../types";
import { buildDrapingRules } from "../Apparel";
import { buildPerViewDirectives } from "../../ai-studio";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — VIRTUAL TRY-ON ENGINE
 *  Supported hubs: Apparel · Jewellery (worn) · Accessories (worn)
 *  Dispatcher: buildVirtualTryOnPrompt → hub-specific builder
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

// ── PRODUCT TYPE ISOLATION (VTON) ─────────────────────────────────────────

const VTON_PRODUCT_TYPE_ISOLATION: Record<string, string> = {
  Saree:         "Replace ONLY with saree (blouse + petticoat support). FORBIDDEN: Any other garment category.",
  Lehenga:       "Replace ONLY with lehenga set. FORBIDDEN: Saree drape or gown mix.",
  Kurti:         "Replace ONLY with kurti. FORBIDDEN: Saree / lehenga styling.",
  "Kurta Set":   "Replace ONLY with full kurta set. FORBIDDEN: Unrelated garment mix.",
  "Salwar Suit": "Replace ONLY with full salwar suit. FORBIDDEN: Unrelated garment mix.",
  Blouse:        "Replace ONLY with the blouse. FORBIDDEN: Full saree unless in PRODUCT_IMAGE.",
  "Dupatta Set": "Add dupatta with neutral base. FORBIDDEN: Full bridal unless in source.",
  Sherwani:      "Replace ONLY with sherwani. FORBIDDEN: Casual / western merge.",
  Kurta:         "Replace ONLY with kurta. FORBIDDEN: Western merge.",
  "Nehru Jacket":"Replace ONLY with Nehru jacket (over source kurta). FORBIDDEN: Western merge.",
  "Ethnic Set":  "Replace ONLY with full ethnic set as shown in source. FORBIDDEN: Western mixing.",
  Dress:         "Replace ONLY with this western dress type. FORBIDDEN: Ethnic blending.",
  Top:           "Replace ONLY with top. FORBIDDEN: Ethnic blending.",
  Shirt:         "Replace ONLY with shirt. FORBIDDEN: Ethnic blending.",
  Skirt:         "Replace ONLY with skirt. FORBIDDEN: Ethnic blending.",
  "Co-ord Set":  "Replace ONLY with co-ord set. FORBIDDEN: Mixing with other garments.",
  "Gown / Partywear": "Replace ONLY with gown / partywear exactly as source. FORBIDDEN: Ethnic blending.",
  Blazer:        "Replace ONLY with blazer. FORBIDDEN: Ethnic blending.",
  "T-shirt":     "Replace ONLY with t-shirt. FORBIDDEN: Ethnic blending.",
};

function buildVTONProductTypeIsolation(productType: string): string {
  const directive =
    VTON_PRODUCT_TYPE_ISOLATION[productType] ||
    `Replace ONLY with ${productType} as shown in PRODUCT_IMAGE. FORBIDDEN: Cross-category mixing.`;
  return `
── PRODUCT TYPE ISOLATION — MANDATORY ──────────────────────────────────────
${directive}
No AI-assumed additions. No substitution. No mixing. Zero deviation.
`.trim();
}

// ── APPAREL VTON ──────────────────────────────────────────────────

const VTON_GARMENT_EXTRACTION = `
── GARMENT EXTRACTION — EXACT REPLICATION ─────────────────────────────────
COLOUR      Exact hex-level match · zero brightness/saturation drift.
PRINT       All-over · block · digital · woven at full fidelity · correctly scaled to body.
EMBROIDERY  Zari · resham · mirror · cutdana · sequin → 1:1 match. No averaging.
BORDERS     Exact width · motif · colour — pallu and hem borders match.
TEXTURE     Faithful reproduction of fabric type, weave, and surface detail.
CUT         Neckline · sleeve length · hem length · silhouette exactly from source.
`.trim();

const VTON_FABRIC_PHYSICS = `
── FABRIC PHYSICS — REALISTIC SIMULATION ──────────────────────────────────
Gravity-driven drape based on fabric weight identified from PRODUCT_IMAGE.
  Silk        → liquid-like flow · high sheen · structured crisp folds.
  Chiffon     → floaty · ultra-light · translucent layers separate.
  Cotton      → matte · soft · relaxed gravity drape.
  Georgette   → medium flow · subtle texture.
  Net/Organza → stiff body · sheer · petticoat visible beneath.
  Velvet      → heavy · minimal flow · directional pile sheen.
  Crepe       → heavy · matte · clean structured fall.
  Tissue      → semi-stiff · metallic sheen · reflects light.
Natural folds · tension · shadows at all contact points.
Accurate garment-body interaction. Zero clipping · zero floating · zero deformation.
`.trim();

const VTON_CLOTH_PHYSICS = `
── CLOTH PHYSICS ──────────────────────────────────────────────────────────
Multi-layer contact shadows and ambient occlusion throughout.
No gaps · no pulls · no warping · no seam misalignment.
CRITICAL: No blouse gap on saree drapes.
Output must appear as a real photograph of the same person in the new garment.
`.trim();

export function buildApparelVTONPrompt(inputs: ApparelInputs): string {
  const {
    segment = "Ladies",
    wearType = "Ethnic Wear",
    productType = "Garment",
    outputViews,
    aiNotes,
  } = inputs;

  const isKids = /kids/i.test(segment);

  const kidsBlock = isKids
    ? `
── KIDS PROPORTIONS — STRICT. AGE-APPROPRIATE. ────────────────────────────
Scale all garment dimensions to child body proportions.
Ensure fit · length · volume · silhouette → child-appropriate.
No adult styling cues · no exaggerated shaping · no adult posing.
`.trim()
    : "";

  const typeIsolation = buildVTONProductTypeIsolation(productType);
  const drapingRules = buildDrapingRules(productType);

  const viewsBlock =
    outputViews && outputViews.length > 0
      ? `\n${buildPerViewDirectives(outputViews)}\n`
      : "";

  const notesBlock = aiNotes
    ? `\n── AI DIRECTOR NOTES ─────────────────────────────────────────────────────\n${aiNotes}\nNotes never override Identity Lock or any extraction lock.\n`
    : "";

  return `
[MODE: VIRTUAL TRY-ON] [HUB: APPAREL] [SEGMENT: ${segment}] [WEAR TYPE: ${wearType}] [PRODUCT: ${productType}]

── TASK — REDRESS (STRICT. CONTROLLED.) ───────────────────────────────────
Redress the subject in MODEL_REF using the clothing from PRODUCT_IMAGE.
Replace ONLY the clothing · preserve the original garment category and structure.
Face · identity · skin · body shape · proportions → 100% preserved.
No change to pose · posture · camera angle · framing · lighting.
Hair · makeup · accessories → unchanged unless part of PRODUCT_IMAGE.
Output must appear as a real photograph of the same person in the new garment.

── IDENTITY CONSTRAINTS ───────────────────────────────────────────────────
${VTON_IDENTITY_LOCK}
${kidsBlock ? `\n${kidsBlock}\n` : ""}
${typeIsolation}

${VTON_GARMENT_EXTRACTION}

${VTON_FABRIC_PHYSICS}

${drapingRules}

${VTON_CLOTH_PHYSICS}
${viewsBlock}${notesBlock}
── NEGATIVE PROMPT — STRICT ENFORCEMENT ───────────────────────────────────
${VTON_NEGATIVE_PROMPT}
--no category mixing, no blouse gap, no embroidery averaging,
no garment colour drift, no pattern scale error, no generic AI garment.
`.trim();
}

// ── JEWELLERY VTON ────────────────────────────────────────────────

const JEWELLERY_VTON_EXTRACTION = `
── JEWELLERY EXTRACTION — EXACT REPLICATION ───────────────────────────────
METAL FINISH   Exact tone (Gold · Silver · Rose Gold · Oxidised · Antique). Zero shift.
STONE COLOUR   Every gemstone exact. Emerald ≠ jade. Ruby ≠ garnet.
STONE SETTING  Kundan · Prong · Bezel · Pavé · Polki — preserved exactly.
TEXTURE        Filigree · engraving · polished · matte · hammered at full resolution.
SCALE          Correct size relative to body — not oversized · not miniaturised.
COMPONENTS     Every chain · pendant · earring back · clasp · tassel · jhumka present.
`.trim();

const JEWELLERY_VTON_PLACEMENT = `
── ANATOMICAL PLACEMENT — ABSOLUTE ─────────────────────────────────────────
Necklace       Place at correct collar / décolletage position. Layered correctly if multi-strand.
Earrings       At earlobes only. Symmetrical. Correct drop length. No floating.
Bangles        At wrists. Naturally stacked if multiple. Correct inner diameter.
Maang Tikka    Centred on hair parting. Correct chain length and pendant drop.
Rings          On correct finger. Correct size proportion relative to finger.
Anklets        At ankles. Correct weight and drape.
All pieces must be placed at anatomically correct positions.
No floating jewellery. No jewellery on wrong body part.
No jewellery overlap obscuring key detail unless physically correct.
`.trim();

const JEWELLERY_LIGHTING = `
── JEWELLERY LIGHTING ON MODEL ─────────────────────────────────────────────
Gold           Warm key light 3200K — avoid cold blue tones on gold.
Silver         Cool diffused 5500K — soft-box presentation.
Kundan         Side lighting for stone depth and setting detail.
Pearls         Soft diffused front light — no harsh specular.
Diamond        Point source or ring light for maximum sparkle.
Antique        Warm raking light — emphasise texture and patina.
Polki          Warm ambient fill — preserve uncut stone surface.
Temple         Warm amber accent.
`.trim();

export function buildJewelleryVTONPrompt(inputs: JewelleryInputs): string {
  const {
    jewelleryGenre = "Fashion",
    jewelleryStyle,
    outputViews,
    aiNotes,
  } = inputs;

  const viewsBlock =
    outputViews && outputViews.length > 0
      ? `\n${buildPerViewDirectives(outputViews)}\n`
      : "";

  const notesBlock = aiNotes
    ? `\n── AI DIRECTOR NOTES ─────────────────────────────────────────────────────\n${aiNotes}\nNotes never override Identity Lock or any extraction lock.\n`
    : "";

  return `
[MODE: VIRTUAL TRY-ON] [HUB: JEWELLERY] [GENRE: ${jewelleryGenre}]${jewelleryStyle ? ` [STYLE: ${jewelleryStyle}]` : ""}

── TASK — JEWELLERY PLACEMENT (STRICT. CONTROLLED.) ───────────────────────
Place the jewellery from PRODUCT_IMAGE onto the subject in MODEL_REF.
Do NOT change: face · identity · skin · body · pose · clothing · hair · makeup.
Only add: the jewellery from PRODUCT_IMAGE at the anatomically correct position.
Output must appear as a real photograph of the same person wearing the jewellery.

── IDENTITY CONSTRAINTS ───────────────────────────────────────────────────
${VTON_IDENTITY_LOCK}

${JEWELLERY_VTON_EXTRACTION}

${JEWELLERY_VTON_PLACEMENT}

${JEWELLERY_LIGHTING}
${viewsBlock}${notesBlock}
── NEGATIVE PROMPT — STRICT ENFORCEMENT ───────────────────────────────────
${VTON_NEGATIVE_PROMPT}
--no floating jewellery, no jewellery on wrong body part,
no metal tone shift, no stone colour change,
no missing jewellery components, no scale distortion,
no AI-added components not in PRODUCT_IMAGE.
`.trim();
}

// ── ACCESSORIES VTON ──────────────────────────────────────────────

const ACCESSORIES_VTON_PLACEMENT: Record<string, string> = {
  Eyewear: `
── EYEWEAR PLACEMENT — ABSOLUTE ─────────────────────────────────────────────
Place eyewear on face — frame bridge centred on nose.
Lens colour and tint exactly from source — no shift.
Frame silhouette precisely from source — no rounding.
Temple arms resting over ears — correct length and curvature.
No reflections obscuring lens unless source shows artistic reflection.
Do NOT change: face · nose shape · eye colour · facial structure.`.trim(),

  Watches: `
── WATCH PLACEMENT — ABSOLUTE ───────────────────────────────────────────────
Place watch on left wrist (standard) unless source shows right wrist.
Crown at 3 o'clock exactly.
Dial readable and in sharp focus. TIME: 10:10 unless source differs.
Bracelet / strap correctly clasped — no gaps in link chain.
Case finish (polished / brushed / matte) exactly from source.
Brand text and logo legible at full resolution.`.trim(),

  "Scarves / Small Accessories": `
── SCARF / ACCESSORY PLACEMENT — ABSOLUTE ───────────────────────────────────
Drape scarf naturally around neck or shoulders per source context.
Print / pattern tiles correctly — no distortion at folds or drape.
Fringe / tassels reproduced at correct length and density.
Fabric weight and drape physics correct per identified material.`.trim(),

  Bags: `
── BAG PLACEMENT — ABSOLUTE ─────────────────────────────────────────────────
Bag held in hand or carried on shoulder per source image context.
Structured shape retained — no sagging unless source shows soft bag.
Strap / handle at correct natural holding position.
Logo / branding legible. Hardware visible and correctly rendered.
Grounding shadow at hand-contact point.`.trim(),

  Footwear: `
── FOOTWEAR PLACEMENT — ABSOLUTE ────────────────────────────────────────────
Place footwear on both feet — correct toe shape and heel height from source.
Sole thickness exactly from source.
Laces / buckles / straps reproduced from source.
Natural foot posture — no floating. Ground contact shadow present.`.trim(),

  Belts: `
── BELT PLACEMENT — ABSOLUTE ────────────────────────────────────────────────
Belt worn at natural waist position.
Buckle centred — style exactly from source.
Grain direction consistent. Stitching along edges exact.
Holes visible if shown in source.`.trim(),
};

export function buildAccessoriesVTONPrompt(inputs: AccessoriesInputs): string {
  const {
    accessoryType = "Bags",
    outputViews,
    aiNotes,
  } = inputs;

  const placementRules =
    ACCESSORIES_VTON_PLACEMENT[accessoryType] ||
    `── ACCESSORY PLACEMENT ──────────────────────────────────────────────────────\nPlace ${accessoryType} exactly as shown in PRODUCT_IMAGE at the anatomically correct position.`;

  const viewsBlock =
    outputViews && outputViews.length > 0
      ? `\n${buildPerViewDirectives(outputViews)}\n`
      : "";

  const notesBlock = aiNotes
    ? `\n── AI DIRECTOR NOTES ─────────────────────────────────────────────────────\n${aiNotes}\nNotes never override Identity Lock or any extraction lock.\n`
    : "";

  return `
[MODE: VIRTUAL TRY-ON] [HUB: ACCESSORIES] [TYPE: ${accessoryType}]

── TASK — ACCESSORY PLACEMENT (STRICT. CONTROLLED.) ───────────────────────
Place the accessory from PRODUCT_IMAGE onto the subject in MODEL_REF.
Do NOT change: face · identity · skin · body · pose · clothing · hair · makeup.
Only add or replace: the ${accessoryType} from PRODUCT_IMAGE at the correct position.
Output must appear as a real photograph of the same person with the accessory.

── IDENTITY CONSTRAINTS ───────────────────────────────────────────────────
${VTON_IDENTITY_LOCK}

── ACCESSORY EXTRACTION — ZERO DEVIATION ───────────────────────────────────
MATERIAL   Exact material physics — leather · canvas · metal · fabric as identified.
COLOUR     Exact. Black leather ≠ dark brown. Navy ≠ black. No drift.
HARDWARE   Buckles · zips · clasps · logos · rivets reproduced precisely.
STITCHING  Visible stitching lines · thread colour exact from source.
SHAPE      Silhouette and proportions exactly as source. No rounding.

${placementRules}
${viewsBlock}${notesBlock}
── NEGATIVE PROMPT — STRICT ENFORCEMENT ───────────────────────────────────
${VTON_NEGATIVE_PROMPT}
--no cross-accessory styling, no AI-added hardware not in source,
no colour shift, no shape rounding, no logo distortion,
no floating accessory, no incorrect anatomical placement.
`.trim();
}

// ── DISPATCHER ────────────────────────────────────────────────────

export function buildVirtualTryOnPrompt(inputs: PromptInputs): string {
  if (inputs.hub === "Apparel") {
    return buildApparelVTONPrompt(inputs as ApparelInputs);
  }
  if (inputs.hub === "Jewellery") {
    return buildJewelleryVTONPrompt(inputs as JewelleryInputs);
  }
  if (inputs.hub === "Accessories") {
    return buildAccessoriesVTONPrompt(inputs as AccessoriesInputs);
  }
  throw new Error(
    `[VTON] Unsupported hub "${inputs.hub}". Supported: Apparel · Jewellery · Accessories.`
  );
}
