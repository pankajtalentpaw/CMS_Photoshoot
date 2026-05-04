import { ProductsInputs } from "../../types";
import {
  buildStudioBackground,
  buildOutputStyle,
  buildPerViewDirectives,
  STUDIO_QUALITY_GATES,
} from "../../ai-studio";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — PRODUCTS HUB PROMPT ENGINE
 *  Families: Home Decor · Beauty / Cosmetics · Handicrafts ·
 *            Packaged Products · Gifts / Lifestyle · Custom
 * ─────────────────────────────────────────────────────────────────
 */

const PRODUCT_EXTRACTION = `
── PRODUCT EXTRACTION — ZERO DEVIATION ─────────────────────────────────────
SHAPE        Exact form from source. No rounding · no smoothing of edges.
             Reproduce every contour, corner, and profile precisely.
COLOUR       Exact — especially critical for cosmetics and packaging.
             No drift · no brightening · no saturation shift.
LABEL / TEXT All text · logos · graphics legible at full resolution.
             Brand name · product name · ingredient text · barcodes — all sharp.
FINISH       Matte · Gloss · Frosted · Metallic · Textured.
             Correct material light response — no substitute finish.
SIZE         Relative scale physically correct in final image.
             Product must not appear oversized or miniaturised.
`.trim();

const FAMILY_ISOLATION: Record<string, string> = {
  "Home Decor":
    "OUTPUT: That specific home decor product only. FORBIDDEN: Unrelated product additions.",
  "Beauty / Cosmetics":
    "OUTPUT: That specific beauty / cosmetic product only. FORBIDDEN: Unrelated product additions.",
  Handicrafts:
    "OUTPUT: That specific handicraft product only. FORBIDDEN: Unrelated product additions.",
  "Packaged Products":
    "OUTPUT: That specific packaged product only (group shot if multiple SKUs in source). FORBIDDEN: Unrelated product additions.",
  "Gifts / Lifestyle":
    "OUTPUT: Gift or lifestyle product styled appropriately. FORBIDDEN: Unrelated product additions.",
  Custom:
    "OUTPUT: Exactly as described in AI_NOTES and shown in PRODUCT_IMAGE. FORBIDDEN: Unrelated product additions.",
};

function buildFamilyIsolation(family: string): string {
  const directive =
    FAMILY_ISOLATION[family] ||
    `OUTPUT: ${family} product only — exactly as shown in PRODUCT_IMAGE. FORBIDDEN: Unrelated product additions.`;
  return `
── FAMILY ISOLATION — MANDATORY ─────────────────────────────────────────────
${directive}
No AI-assumed additions. No substitution. Zero deviation.
`.trim();
}

function buildFamilyRules(family: string): string {
  const rules: Record<string, string> = {
    "Home Decor": `
── HOME DECOR — RENDERING RULES ─────────────────────────────────────────────
Styled in appropriate room setting. Props complement product — do not compete.
Warm ambient light. Show product in-use context:
  Vase → with flowers · Cushion → on sofa · Lamp → switched on · Frame → on wall.
Product must be the clear hero — not overwhelmed by setting.
Background: warm lifestyle interior — not stark studio.`.trim(),

    "Beauty / Cosmetics": `
── BEAUTY / COSMETICS — RENDERING RULES ─────────────────────────────────────
Surface: white marble or soft pastel surface — clean and premium.
Label: fully legible and in sharp focus at all times.
Macro detail of texture / formula if relevant (serum droplet · powder swatch · lip colour).
No fingerprints on packaging.
No shadows obscuring label text.
Product upright · cap aligned · label facing camera.
Optional: product open showing formula if source shows open product.`.trim(),

    Handicrafts: `
── HANDICRAFTS — RENDERING RULES ────────────────────────────────────────────
Warm artisanal setting. Surface: jute · wood · terracotta — natural materials.
Natural or warm window light. Soft fill. No harsh studio lighting.
Craft-origin context: Indian / tribal / folk aesthetic.
Props that complement craft heritage — not compete.
Texture and hand-made character must be clearly visible.`.trim(),

    "Packaged Products": `
── PACKAGED PRODUCTS — RENDERING RULES ──────────────────────────────────────
Background: clean white or gradient — no texture unless source requires.
Package: upright · label facing camera directly · fully lit.
No shadows obscuring label text — label must be 100% readable.
Group shot: if multiple SKUs visible in source, show all in neat arrangement.
Barcode and small print: legible at full resolution if in source.
No fingerprints · no surface reflections blocking label.`.trim(),

    "Gifts / Lifestyle": `
── GIFTS / LIFESTYLE — RENDERING RULES ──────────────────────────────────────
Styled flat lay or gift arrangement per source context.
Ribbon · tissue paper · gift box context if relevant and shown in source.
Warm festive or lifestyle mood — not sterile studio.
Arrangement: curated and intentional — not cluttered.
Props: festive or lifestyle-appropriate — complementary only.`.trim(),

    Custom: `
── CUSTOM PRODUCT — RENDERING RULES ─────────────────────────────────────────
Render exactly as shown in PRODUCT_IMAGE and described in AI_NOTES.
All extraction rules (shape · colour · label · finish · size) apply fully.`.trim(),
  };

  return (
    rules[family] ||
    `── PRODUCT RENDERING ───────────────────────────────────────────────────────\nRender exactly as shown in PRODUCT_IMAGE. All extraction rules apply.`
  );
}

const PRODUCTS_NEGATIVE_PROMPT = `
── NEGATIVE PROMPT ─────────────────────────────────────────────────────────
--no unrelated product additions, no AI-assumed props not in source,
no colour drift, no label text distortion, no label text blur,
no barcode blur or distortion, no shape rounding or smoothing,
no incorrect finish (matte ≠ gloss), no incorrect scale,
no fingerprints on packaging, no shadows on label text,
no blur, no low resolution, no watermark, no collage,
no text overlay, no UI elements, no floating product,
no background competing with product, no harsh studio light on handicrafts
`.trim();

export function buildProductsPrompt(inputs: ProductsInputs): string {
  const {
    productFamily = "Packaged Products",
    background = "White Studio",
    backgroundImageUrl,
    outputStyle = "Catalog",
    outputViews,
    aiNotes,
  } = inputs;

  const header = `[MODE: AI STUDIO] [HUB: PRODUCTS] [FAMILY: ${productFamily}]`;

  const familyIsolation = buildFamilyIsolation(productFamily);
  const familyRules = buildFamilyRules(productFamily);
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

${familyIsolation}

${PRODUCT_EXTRACTION}

${familyRules}

── BACKGROUND ───────────────────────────────────────────────────────────────
${bgPrompt}

── OUTPUT STYLE ─────────────────────────────────────────────────────────────
${stylePrompt}
${viewsBlock}${notesBlock}
── QUALITY GATES ────────────────────────────────────────────────────────────
${STUDIO_QUALITY_GATES}

${PRODUCTS_NEGATIVE_PROMPT}
`.trim();
}
