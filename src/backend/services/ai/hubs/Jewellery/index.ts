import { JewelleryInputs } from "../../types";
import {
  buildStudioBackground,
  buildOutputStyle,
  buildPerViewDirectives,
  STUDIO_QUALITY_GATES,
  STUDIO_IDENTITY_LOCK,
} from "../../ai-studio";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — JEWELLERY HUB PROMPT ENGINE
 *  Genres: Bridal · Fashion · Traditional / Vintage · Daily Wear / Minimal · Custom
 * ─────────────────────────────────────────────────────────────────
 */

const JEWELLERY_EXTRACTION = `
── JEWELLERY EXTRACTION — ZERO DEVIATION ───────────────────────────────────
METAL FINISH   Exact tone: Gold · Silver · Rose Gold · Oxidised · Antique.
               No tone shift under any lighting condition.
STONE COLOUR   Every gemstone exact. Emerald ≠ jade. Ruby ≠ garnet.
               Sapphire ≠ amethyst. Render each stone individually.
STONE SETTING  Kundan · Prong · Bezel · Pavé · Polki — preserved exactly.
               Setting structure and stone alignment from source.
TEXTURE        Filigree · engraving · polished · matte · hammered at full resolution.
               No smoothing · no averaging · no AI simplification.
SCALE          Correct size relative to body. Not oversized. Not miniaturised.
               Earring length, necklace drop, bangle diameter — all exact.
COMPONENTS     Every chain · pendant · earring back · clasp · tassel · jhumka present.
               No missing components. No AI-added components not in source.
`.trim();

const JEWELLERY_LIGHTING_TABLE = `
── JEWELLERY LIGHTING RULES ────────────────────────────────────────────────
Gold           Warm key light 3200K. Avoid cold blue tones.
Silver         Cool diffused 5500K. Soft box. No harsh highlights.
Rose Gold      Warm-neutral key. Soft fill. Preserve pink undertone.
Kundan         Side lighting for stone depth and setting detail.
Pearls         Soft diffused front light. Avoid harsh specular highlights.
Diamond        Point source or ring light for maximum sparkle.
Antique        Warm raking light. Emphasise texture and patina.
Polki          Warm ambient fill. Preserve uncut stone surface irregularity.
Temple         Warm amber accent. Deep red or ivory backdrop.
Oxidised       Diffused warm light. Emphasise surface texture and depth.
`.trim();

const GENRE_ISOLATION: Record<string, string> = {
  Bridal:
    "OUTPUT: Full jewellery set only (necklace + earrings + maang tikka + bangles if in source). FORBIDDEN: Minimal / studs-only output.",
  Fashion:
    "OUTPUT: That specific jewellery item only. FORBIDDEN: Full set unless source shows complete set.",
  "Traditional / Vintage":
    "OUTPUT: That heritage style only (Kundan / Temple / Polki / Antique Finish). FORBIDDEN: Modern / minimal conversion.",
  "Daily Wear / Minimal":
    "OUTPUT: Lightweight / simple pieces only. FORBIDDEN: Bridal heaviness or heavy layering.",
  Custom:
    "OUTPUT: Exactly as described in AI_NOTES and shown in PRODUCT_IMAGE. FORBIDDEN: Cross-genre mixing.",
};

function buildGenreIsolation(genre: string): string {
  const directive =
    GENRE_ISOLATION[genre] ||
    `OUTPUT: ${genre} jewellery exactly as shown in PRODUCT_IMAGE. FORBIDDEN: Cross-genre mixing.`;
  return `
── GENRE ISOLATION — MANDATORY ─────────────────────────────────────────────
${directive}
No AI-assumed additions. No substitution. Zero deviation.
`.trim();
}

function buildGenreDirective(genre: string): string {
  const directives: Record<string, string> = {
    Bridal: `
── BRIDAL GENRE DIRECTIVE ──────────────────────────────────────────────────
Full set: necklace layered correctly · maang tikka centred · earrings symmetrical · bangles stacked.
Rich warm lighting. Background: mandap · floral drape · or deep jewel tone.
Maximum grandeur — every piece must be clearly visible and sharply rendered.`.trim(),

    Fashion: `
── FASHION GENRE DIRECTIVE ─────────────────────────────────────────────────
Clean isolated or styled on model. Minimalist background.
Highlight design and shine. No competing props or background elements.
High-contrast clean presentation.`.trim(),

    "Traditional / Vintage": `
── TRADITIONAL / VINTAGE GENRE DIRECTIVE ───────────────────────────────────
Warm amber / candlelight tones. Temple / Kundan against deep red · green · or ivory backdrop.
Antique → matte warm lighting · no harsh flash · emphasise patina.
Heritage setting — wood panel · draped fabric · terracotta or stone surface.`.trim(),

    "Daily Wear / Minimal": `
── DAILY WEAR / MINIMAL GENRE DIRECTIVE ─────────────────────────────────────
White or soft pastel background. Lightweight pieces.
Natural light feel. No drama. Clean and airy presentation.
Lifestyle or desk-context acceptable.`.trim(),

    Custom: `
── CUSTOM GENRE DIRECTIVE ───────────────────────────────────────────────────
Apply exactly as specified in AI_NOTES.
Maintain all extraction locks. No override of METAL FINISH or STONE COLOUR.`.trim(),
  };

  return (
    directives[genre] ||
    `── GENRE DIRECTIVE ───────────────────────────────────────────────────────────\nRender ${genre} jewellery with appropriate styling and lighting.`
  );
}

function buildShotDirective(modelRefUrl?: string | null): string {
  if (modelRefUrl) {
    return `
── SHOT DIRECTIVE — WORN ON MODEL ──────────────────────────────────────────
Jewellery worn on body. Correct anatomical placement. Correct scale.
Necklace: at correct collar/décolletage position.
Earrings: at earlobes — symmetrical.
Bangles/Bracelets: at correct wrist position — stacked naturally.
Maang Tikka: centred on parting — correct length and drop.
Rings: on correct finger — correct size proportion relative to finger.
Anklets: at ankles — correct weight and drape.
No floating jewellery. No anatomically incorrect placement.`.trim();
  }
  return `
── SHOT DIRECTIVE — ISOLATED ────────────────────────────────────────────────
No model. Isolated flat lay or prop stand.
Macro detail preferred. 45° or overhead angle.
Hand included for scale only if genre requires it.
Clean surface — no competing props.`.trim();
}

const JEWELLERY_NEGATIVE_PROMPT = `
── NEGATIVE PROMPT ─────────────────────────────────────────────────────────
--no genre mixing, no hybrid styling unless in PRODUCT_IMAGE,
no AI-added components not in source, no missing components,
no metal tone shift, no stone colour change (Emerald ≠ jade, Ruby ≠ garnet),
no setting style change, no texture smoothing or averaging,
no scale distortion, no floating jewellery, no anatomically incorrect placement,
no face change, no skin tone shift, no body distortion,
no blur, no low resolution, no watermark, no collage,
no text overlay, no UI elements, no identity drift,
no harsh flash on antique pieces, no cold light on gold pieces
`.trim();

export function buildJewelleryPrompt(inputs: JewelleryInputs): string {
  const {
    jewelleryGenre = "Fashion",
    jewelleryStyle,
    background = "White Studio",
    backgroundImageUrl,
    outputStyle = "Catalog",
    outputViews,
    modelRefUrl,
    aiNotes,
  } = inputs;

  const header = `[MODE: AI STUDIO] [HUB: JEWELLERY] [GENRE: ${jewelleryGenre}]${jewelleryStyle ? ` [STYLE: ${jewelleryStyle}]` : ""}`;

  const genreIsolation = buildGenreIsolation(jewelleryGenre);
  const genreDirective = buildGenreDirective(jewelleryGenre);
  const shotDirective = buildShotDirective(modelRefUrl);
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

${genreIsolation}

${JEWELLERY_EXTRACTION}

${JEWELLERY_LIGHTING_TABLE}

${genreDirective}

${shotDirective}
${identityLock}
── BACKGROUND ───────────────────────────────────────────────────────────────
${bgPrompt}

── OUTPUT STYLE ─────────────────────────────────────────────────────────────
${stylePrompt}
${viewsBlock}${notesBlock}
── QUALITY GATES ────────────────────────────────────────────────────────────
${STUDIO_QUALITY_GATES}

${JEWELLERY_NEGATIVE_PROMPT}
`.trim();
}
