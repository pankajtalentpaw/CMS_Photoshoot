import { 
  PromptInputs, 
  Hub, 
  OutputStyle, 
  Background,
  VideoStyle,
} from "./types";
import { buildVideoPrompt } from "./videoPrompts";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — AI STUDIO ENGINE v5.0
 *  Specialized logic for high-end editorial and catalog generation.
 * ─────────────────────────────────────────────────────────────────
 */

export const STUDIO_QUALITY_GATES = `
QUALITY GATES — ALL MUST PASS:
✓ Output matches selected category/type exactly
✓ Model's face and body visible and photorealistic
✓ Item colour exact match to source — zero drift
✓ All surface detail reproduced — zero AI averaging
✓ Correct composition for selected OUTPUT_STYLE
✓ Professional studio lighting applied to subject and background
✓ Single image — no collage · no watermark · no text overlay
✓ Marketplace-safe: Amazon · Myntra · Ajio ready
`.trim();

function hubToSubjectLabel(hub: Hub): string {
  const map: Record<Hub, string> = {
    Apparel: "Human Model (fashion subject)",
    Jewellery: "Human Model wearing jewellery set",
    Accessories: "Human Model with accessory styled",
    Products: "Product / object on neutral surface",
  };
  return map[hub] ?? "Subject";
}

export function buildStudioBackground(bg: string): string {
  const map: Record<string, string> = {
    "White Studio": "Pure white seamless sweep · soft-box front light · faint natural floor shadow.",
    "Premium Studio": "Dark charcoal textured wall · Rembrandt lighting · warm gold rim light.",
    "Saree Festival": "Decorated mandap corridor · marigold garlands · diyas · warm amber light.",
    "Outdoor": "Garden or heritage monument · natural directional sunlight · accurate cast shadows.",
    "Modern Office": "Contemporary interior · large windows · diffused daylight · neutral clean tones.",
  };
  return map[bg] || `${bg} — professional studio environment.`;
}

export function buildOutputStyle(style: string): string {
  const map: Record<string, string> = {
    "Catalog": "Full body portrait 3:4 · centred · neutral expression · Marketplace-standard.",
    "Premium": "Editorial · off-centre · 3/4 body · dramatic lighting · luxury feel.",
    "Social Media": "Vertical 9:16 · waist-up · vibrant · high energy · optimized for Reels.",
    "Lifestyle": "Environmental portrait · candid feel · warm atmospheric light.",
  };
  return map[style] || style;
}

export function buildAiStudioPrompt(inputs: PromptInputs): string {
  const {
    hub,
    background = "White Studio",
    outputStyle = "Catalog",
    aiNotes: notes,
    outputViews,
    videoStyle,
  } = inputs;

  const subjectLabel = hubToSubjectLabel(hub);
  const header = `[MODE: AI STUDIO] [HUB: ${hub}] [SUBJECT: ${subjectLabel}]`;
  const bgPrompt = buildStudioBackground(background);
  const stylePrompt = buildOutputStyle(outputStyle);

  let body = "";

  if (videoStyle) {
    // Delegate entirely to the dedicated per-style video prompt engine.
    return buildVideoPrompt(inputs);
  }

  const baseConfig = `
── EDITORIAL CONFIGURATION ─────────────────────────────────────────────────
BACKGROUND: ${bgPrompt}
STYLE: ${stylePrompt}
  `.trim();

  if (outputViews && outputViews.length > 0) {
    body = `
${baseConfig}

── MULTI-VIEW BUNDLE ───────────────────────────────────────────────────────
VIEWS: ${outputViews.join(", ")}
Each perspective must maintain 100% garment and identity consistency.
    `.trim();
  } else {
    body = baseConfig;
  }

  return `
${header}

${body}

── QUALITY STANDARDS ───────────────────────────────────────────────────────
${STUDIO_QUALITY_GATES}

${notes ? `\nAI DIRECTOR NOTES: ${notes}\n` : ""}

── NEGATIVE PROMPT ─────────────────────────────────────────────────────────
--no blur, no low res, no watermark, no text, no collage, no flickering,
no ghosting, no morphing, no identity drift, no background pop.
  `.trim();
}