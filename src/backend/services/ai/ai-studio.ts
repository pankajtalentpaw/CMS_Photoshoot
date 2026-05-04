import type { Hub, Background, PromptInputs } from "@/backend/prompts";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — AI STUDIO SHARED UTILITIES
 *  Shared constants and helpers imported by all hub builders.
 *
 *  IMPORT RULE: Hub files import FROM this file.
 *               This file must NOT import FROM hub files.
 *               (Prevents circular dependency)
 * ─────────────────────────────────────────────────────────────────
 */

export const STUDIO_QUALITY_GATES = `
QUALITY GATES — ALL MUST PASS:
✓ Output matches selected category/type exactly
✓ No cross-category elements present
✓ Only items visible in PRODUCT_IMAGE are rendered
✓ Item colour exact match to source — zero drift
✓ All surface detail reproduced — zero AI averaging
✓ Model identity 100% preserved from MODEL_REF (when provided)
✓ Fabric / material physics correct for identified type
✓ Background and subject lighting are consistent
✓ Composition matches OUTPUT_STYLE and view directive
✓ Label / logo text legible (Products)
✓ Single image — no collage · no watermark · no UI text overlay
✓ Resolution ≥ 1024×1024 (target 2048×2048)
✓ Marketplace-safe: Meesho · Myntra · Amazon · Ajio · Nykaa ready
`.trim();

export const STUDIO_IDENTITY_LOCK = `
── IDENTITY LOCK — ABSOLUTE · NON-NEGOTIABLE ────────────────────────────────
Face geometry · pores · freckles · moles · all micro-details → 100% preserved.
Skin tone + undertone → exact match to MODEL_REF. Zero shift under any lighting.
Body shape · limb volume · proportions · posture → strictly unchanged.
Hair colour · length · density · texture · style → strictly unchanged.
Eye colour · shape · position → unchanged.
Expression → unchanged unless explicitly requested in AI_NOTES.
No slimming · no reshaping · no enhancement · no beautification · no retouching.
Identity must be pixel-consistent across every output view.
If identity mismatch occurs → REJECT AND REGENERATE.
`.trim();

const VIEW_DIRECTIVES: Record<string, string> = {
  Front:
    "Model facing camera directly · full body 3:4 · garment front fully visible · centred.",
  Left:
    "Model turned 45–90° left · left side fully visible · natural shoulder posture.",
  Right:
    "Model turned 45–90° right · right side fully visible · natural shoulder posture.",
  Back:
    "Model turned full back to camera · garment rear fully visible · back neckline and details sharp.",
  "Close-up":
    "Waist-up or bust-up · face and upper garment in sharp focus · background softly blurred.",
  Detail:
    "Extreme macro on hero detail (embroidery · border · stone · hardware · label · texture). No full body. Sharp throughout.",
  Custom:
    "Apply exactly as specified in AI_NOTES. Maintain all extraction and identity locks.",
};

export function buildPerViewDirectives(views: string[]): string {
  if (!views || views.length === 0) return "";

  const lines = views.map((v) => {
    const directive = VIEW_DIRECTIVES[v] || "Render as specified — maintain all locks.";
    return `  ${v.padEnd(12)}: ${directive}`;
  });

  return `
── MULTI-VIEW BUNDLE ───────────────────────────────────────────────────────
Each view is generated independently. 100% fidelity across all views.
${lines.join("\n")}
`.trim();
}

export function buildStudioBackground(bg: string, backgroundImageUrl?: string): string {
  if (backgroundImageUrl) {
    return `BACKGROUND_IMAGE: The THIRD image in the input array is the EXACT background scene to use.
DO NOT synthesise or imagine a background. USE ONLY that provided image as the environment.
Place the model — wearing the garment from the second image — seamlessly INTO this exact background scene.
Preserve every pixel of the background: colours, textures, lighting, depth, perspective, and spatial context.
Composite the subject with correct shadow casting and edge integration. Zero background hallucination.
The background must be indistinguishable from the original provided image.`;
  }

  const map: Record<string, string> = {
    "White Studio":
      "Pure white seamless sweep · soft-box front fill · faint natural floor shadow.",
    "Premium Studio":
      "Dark luxury studio · matte black textures · architectural square LED ceiling panels · cinematic moody lighting.",
    "Saree Festival":
      "Elite festival studio · deep crimson backdrop · large glowing circular halo · warm atmospheric studio light.",
    Outdoor:
      "Garden or heritage monument · natural directional sunlight · soft fill · accurate cast shadows.",
    "Modern Office":
      "Modern zen lounge · sage green feature wall · minimalist wooden shelf · soft daylight · architectural stone accent.",
  };
  return map[bg] || `${bg} — professional environment. Light direction and colour temperature matched to subject.`;
}

export function buildOutputStyle(style: string): string {
  const map: Record<string, string> = {
    Catalog:
      "Full body 3:4 · centred · neutral expression · hands relaxed · no props · marketplace-standard.",
    Premium:
      "Editorial · off-centre · 3/4 body · dramatic lighting · confident gaze · rich colour grade · luxury feel.",
    "Social Media":
      "Vertical 9:16 · waist-up · vibrant · high energy · optimised for Instagram / Reels.",
    Lifestyle:
      "Environmental portrait 3:4 or 4:5 · candid feel · warm atmospheric light · airy edit.",
  };
  return map[style] || style;
}

/**
 * Fallback generic studio prompt for legacy call paths that do not supply a hub.
 * Hub-aware routing is done in promptEngine.ts — this is only for backward-compatibility.
 */
export function buildAiStudioPrompt(inputs: PromptInputs): string {
  const {
    background = "White Studio",
    outputStyle = "Catalog",
    aiNotes,
    outputViews,
  } = inputs;

  const bgPrompt = buildStudioBackground(background);
  const stylePrompt = buildOutputStyle(outputStyle);

  const viewsBlock =
    outputViews && outputViews.length > 0
      ? `\n── MULTI-VIEW BUNDLE ───────────────────────────────────────────────────────\nVIEWS: ${outputViews.join(", ")}\nEach perspective must maintain 100% garment and identity consistency.\n`
      : "";

  const notesBlock = aiNotes ? `\nAI DIRECTOR NOTES: ${aiNotes}\n` : "";

  return `
[MODE: AI STUDIO] [HUB: ${inputs.hub}]

── EDITORIAL CONFIGURATION ──────────────────────────────────────────────────
BACKGROUND: ${bgPrompt}
STYLE: ${stylePrompt}
${viewsBlock}${notesBlock}
── QUALITY STANDARDS ────────────────────────────────────────────────────────
${STUDIO_QUALITY_GATES}

── NEGATIVE PROMPT ──────────────────────────────────────────────────────────
--no blur, no low res, no watermark, no text, no collage,
no identity drift, no background pop.
`.trim();
}
