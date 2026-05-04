import { AccessoriesInputs } from "../../types";
import {
  buildStudioBackground,
  buildOutputStyle,
  buildPerViewDirectives,
  STUDIO_QUALITY_GATES,
  STUDIO_IDENTITY_LOCK,
} from "../../ai-studio";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — ACCESSORIES HUB PROMPT ENGINE
 *  Types: Bags · Footwear · Watches · Eyewear · Belts · Scarves / Small Accessories · Custom
 * ─────────────────────────────────────────────────────────────────
 */

const ACCESSORY_EXTRACTION = `
── ACCESSORY EXTRACTION — ZERO DEVIATION ───────────────────────────────────
MATERIAL   Leather grain · canvas weave · metal finish · rubber · fabric.
           Identify and render exact material physics. No substitution.
COLOUR     Exact. Black leather ≠ dark brown. Navy ≠ black. No drift.
HARDWARE   Buckles · zips · clasps · logos · rivets reproduced precisely.
           Brand engravings and logos legible at full resolution.
STITCHING  Visible stitching lines · thread colour exact from source.
           No smoothing or AI-averaging of stitching detail.
SHAPE      Silhouette and proportions exactly as source.
           No rounding · no smoothing · no AI-assumed corrections.
`.trim();

const TYPE_ISOLATION: Record<string, string> = {
  Bags:
    "OUTPUT: That specific bag style only. FORBIDDEN: Cross-accessory styling.",
  Footwear:
    "OUTPUT: That specific footwear style only. FORBIDDEN: Cross-accessory styling.",
  Watches:
    "OUTPUT: That specific watch style only. FORBIDDEN: Cross-accessory styling.",
  Eyewear:
    "OUTPUT: That specific eyewear style only. FORBIDDEN: Cross-accessory styling.",
  Belts:
    "OUTPUT: That specific belt style only. FORBIDDEN: Cross-accessory styling.",
  "Scarves / Small Accessories":
    "OUTPUT: That specific accessory only. FORBIDDEN: Cross-accessory styling.",
  Custom:
    "OUTPUT: Exactly as described in AI_NOTES and shown in PRODUCT_IMAGE. FORBIDDEN: Cross-accessory mixing.",
};

function buildTypeIsolation(accessoryType: string): string {
  const directive =
    TYPE_ISOLATION[accessoryType] ||
    `OUTPUT: ${accessoryType} only — exactly as shown in PRODUCT_IMAGE. FORBIDDEN: Cross-accessory mixing.`;
  return `
── TYPE ISOLATION — MANDATORY ───────────────────────────────────────────────
${directive}
No AI-assumed additions. No substitution. Zero deviation.
`.trim();
}

function buildTypeRules(accessoryType: string): string {
  const rules: Record<string, string> = {
    Bags: `
── BAGS — RENDERING RULES ───────────────────────────────────────────────────
Structured shape retained — no sagging unless source shows soft bag.
Handles correctly positioned — strap length from source.
Grounding shadow beneath bag — no floating.
Interior visible only if source shows open bag.
Logo / branding legible at full resolution.
All hardware (clasps, zips, D-rings) reproduced precisely.`.trim(),

    Footwear: `
── FOOTWEAR — RENDERING RULES ──────────────────────────────────────────────
Show as pair from 3/4 angle unless source shows single shoe.
Correct toe shape · heel height · sole thickness — exactly from source.
Laces / buckles / straps reproduced from source.
Clean sole unless lifestyle context requires wear.
Insole and tongue visible if source shows them.`.trim(),

    Watches: `
── WATCHES — RENDERING RULES ───────────────────────────────────────────────
Crown position: 3 o'clock — exactly.
Dial: readable and in sharp focus. All indices · hands · subdials visible.
TIME: Set to 10:10 unless source image shows a different time.
Crystal: sapphire / mineral glass reflection if applicable — no obscuring glare.
Bracelet / strap: correctly linked — no gaps · no misalignment.
Brand text and logo: legible at full resolution.
Case finish (polished / brushed / matte): exactly from source.`.trim(),

    Eyewear: `
── EYEWEAR — RENDERING RULES ───────────────────────────────────────────────
Lens colour and tint exactly from source — no shift.
Frame silhouette precisely from source — no rounding or exaggeration.
Temple arms: correct length and curvature from source.
Bridge: exact width from source.
No reflections obscuring lens unless source shows artistic reflection.
Nose pads reproduced if visible in source.`.trim(),

    Belts: `
── BELTS — RENDERING RULES ─────────────────────────────────────────────────
Flat lay or worn — per source image context.
Buckle: centred · style exactly from source.
Grain / texture direction: consistent along full length.
Holes: visible and evenly spaced if shown in source.
Stitching along edges reproduced exactly.`.trim(),

    "Scarves / Small Accessories": `
── SCARVES / SMALL ACCESSORIES — RENDERING RULES ────────────────────────────
Flat lay · folded display · or worn — per source image context.
Print / pattern: tiles correctly with no distortion at edges or folds.
Fringe / tassels: reproduced at correct length and density if present.
Fabric drape and weight: correct per identified material.`.trim(),

    Custom: `
── CUSTOM ACCESSORY — RENDERING RULES ───────────────────────────────────────
Render exactly as shown in PRODUCT_IMAGE and described in AI_NOTES.
All material · colour · hardware · shape extraction rules apply.`.trim(),
  };

  return (
    rules[accessoryType] ||
    `── ACCESSORY RENDERING ────────────────────────────────────────────────────────\nRender exactly as shown in PRODUCT_IMAGE. All extraction rules apply.`
  );
}

const ACCESSORIES_NEGATIVE_PROMPT = `
── NEGATIVE PROMPT ─────────────────────────────────────────────────────────
--no cross-accessory styling, no AI-added hardware not in source,
no colour shift (Black ≠ dark brown, Navy ≠ black),
no shape rounding or smoothing, no stitching averaging,
no logo distortion, no brand text blur,
no watch time other than 10:10 (unless source differs),
no sagging bags (unless source shows soft bag),
no lens reflections obscuring eyewear,
no blur, no low resolution, no watermark, no collage,
no text overlay, no UI elements, no floating accessory,
no incorrect proportions or scale
`.trim();

export function buildAccessoriesPrompt(inputs: AccessoriesInputs): string {
  const {
    accessoryType = "Bags",
    background = "White Studio",
    backgroundImageUrl,
    outputStyle = "Catalog",
    outputViews,
    modelRefUrl,
    aiNotes,
  } = inputs;

  const header = `[MODE: AI STUDIO] [HUB: ACCESSORIES] [TYPE: ${accessoryType}]`;

  const typeIsolation = buildTypeIsolation(accessoryType);
  const typeRules = buildTypeRules(accessoryType);
  // Identity lock applies for accessories worn/carried on a model (scarves, eyewear, watches on wrist, bags in hand)
  const identityLock = modelRefUrl ? `\n${STUDIO_IDENTITY_LOCK}\n` : "";
  const bgPrompt = buildStudioBackground(background, backgroundImageUrl ?? undefined);
  const stylePrompt = buildOutputStyle(outputStyle);

  const viewsBlock =
    outputViews && outputViews.length > 0
      ? `\n${buildPerViewDirectives(outputViews)}\n`
      : "";

  const notesBlock = aiNotes
    ? `\n── AI DIRECTOR NOTES ────────────────────────────────────────────────────────\n${aiNotes}\nNotes never override any IMMUTABLE extraction lock.\n`
    : "";

  return `
${header}

${typeIsolation}

${ACCESSORY_EXTRACTION}

${typeRules}
${identityLock}
── BACKGROUND ───────────────────────────────────────────────────────────────
${bgPrompt}

── OUTPUT STYLE ─────────────────────────────────────────────────────────────
${stylePrompt}
${viewsBlock}${notesBlock}
── QUALITY GATES ────────────────────────────────────────────────────────────
${STUDIO_QUALITY_GATES}

${ACCESSORIES_NEGATIVE_PROMPT}
`.trim();
}
