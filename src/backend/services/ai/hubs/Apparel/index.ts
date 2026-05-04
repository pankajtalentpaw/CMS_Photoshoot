import { ApparelInputs } from "../../types";
import {
  buildStudioBackground,
  buildOutputStyle,
  buildPerViewDirectives,
  STUDIO_QUALITY_GATES,
  STUDIO_IDENTITY_LOCK,
} from "../../ai-studio";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — APPAREL HUB PROMPT ENGINE
 *  Covers: Ladies · Gents · Kids | Ethnic · Western · Custom
 *  Garment types: Saree · Lehenga · Kurti · Kurta · Kurta Set ·
 *                 Salwar Suit · Dupatta Set · Blouse · Sherwani ·
 *                 Nehru Jacket · Ethnic Set · Dress · Top · Shirt ·
 *                 Skirt · Co-ord Set · Gown / Partywear · Blazer ·
 *                 Jacket · Trousers · T-shirt · Casual Set ·
 *                 Kids Kurta Set · Kids Lehenga · Festive Set ·
 *                 Frock · Bottomwear · Partywear Set
 * ─────────────────────────────────────────────────────────────────
 */

const FABRIC_PHYSICS_TABLE = `
── FABRIC IDENTIFICATION & PHYSICS ─────────────────────────────────────────
Identify the fabric from PRODUCT_IMAGE and apply the correct physics:
  Silk        → High sheen · structured drape · crisp fold lines · liquid flow.
  Chiffon     → Translucent · floaty · light folds · background visible through sheer layers.
  Cotton      → Matte · soft · relaxed drape · no artificial sheen.
  Georgette   → Medium flow · subtle texture · moderate weight drape.
  Net/Organza → Sheer layers · stiff body · visible petticoat beneath · clear air gaps.
  Velvet      → Deep pile · directional sheen changes with angle · heavy · minimal flow.
  Crepe       → Matte · heavy · clean structured fall · no surface shine.
  Tissue      → Metallic sheen · semi-stiff · reflects light strongly.
Opaque fabrics: zero background bleed-through.
Sheer fabrics: correct opacity — background only visible where physically accurate.
`.trim();

const GARMENT_EXTRACTION = `
── GARMENT EXTRACTION — ZERO DEVIATION ────────────────────────────────────
COLOUR      Exact hex-level match. No brightening · darkening · saturation shift.
            Render faithfully under output lighting — never recolour.
PRINT       All-over · block · digital · woven patterns at full fidelity.
            Scale correctly to body. No tiling errors. No distortion.
EMBROIDERY  Zari · resham · mirror · cutdana · sequin · gota patti.
            Render every element individually. No averaging. No blur.
BORDERS     Exact width · motif · colour. Pallu and hem borders match.
CUT         Neckline · sleeve length · hem length · silhouette exactly from source.
`.trim();

const CLOTH_PHYSICS = `
── CLOTH & MATERIAL PHYSICS ────────────────────────────────────────────────
Gravity-driven drape. Correct tension at shoulder · waist · hip.
Seams and stitching reproduced from source.
Multi-layer contact shadows and ambient occlusion applied throughout.
No floating · no clipping · no misalignment at any seam.
No gaps · no pulls · no warping.
CRITICAL: No blouse gap on saree drapes.
`.trim();

const PRODUCT_TYPE_ISOLATION: Record<string, string> = {
  // ── Ladies / Ethnic ──────────────────────────────────────────────────────
  Saree:
    "OUTPUT: Saree only (blouse + petticoat support). FORBIDDEN: Lehenga / kurti / gown / fusion.",
  Lehenga:
    "OUTPUT: Lehenga set (lehenga + choli + dupatta). FORBIDDEN: Saree drape / gown mix.",
  Kurti:
    "OUTPUT: Kurti only (neutral bottom if needed). FORBIDDEN: Saree / lehenga styling.",
  "Kurta Set":
    "OUTPUT: Full set (kurta + bottom + dupatta if present). FORBIDDEN: Unrelated garment mix.",
  "Salwar Suit":
    "OUTPUT: Full set (kurta + bottom + dupatta if present). FORBIDDEN: Unrelated garment mix.",
  "Dupatta Set":
    "OUTPUT: Dupatta with neutral base garment. FORBIDDEN: Full bridal styling unless in source.",
  Blouse:
    "OUTPUT: Blouse-focused output. FORBIDDEN: Full saree/lehenga unless in PRODUCT_IMAGE.",
  // ── Ladies / Western ─────────────────────────────────────────────────────
  Dress:
    "OUTPUT: Selected western dress type only. FORBIDDEN: Ethnic blending.",
  Top:
    "OUTPUT: Top only with neutral bottom. FORBIDDEN: Ethnic blending.",
  Shirt:
    "OUTPUT: Shirt with appropriate bottom. FORBIDDEN: Ethnic blending.",
  Skirt:
    "OUTPUT: Skirt with appropriate top. FORBIDDEN: Ethnic blending.",
  "Co-ord Set":
    "OUTPUT: Co-ord set exactly as in source. FORBIDDEN: Mixing with other garment types.",
  "Gown / Partywear":
    "OUTPUT: Gown / partywear silhouette exactly as source. FORBIDDEN: Ethnic blending.",
  // ── Gents / Ethnic ───────────────────────────────────────────────────────
  Kurta:
    "OUTPUT: Kurta (with churidar / pyjama if present in source). FORBIDDEN: Western merge.",
  Sherwani:
    "OUTPUT: Ethnic menswear structure. FORBIDDEN: Casual / western merge.",
  "Nehru Jacket":
    "OUTPUT: Nehru jacket (with kurta/pyjama if present in source). FORBIDDEN: Western merge.",
  "Ethnic Set":
    "OUTPUT: Full ethnic set exactly as in source (kurta + bottom + jacket if present). FORBIDDEN: Western mixing.",
  // ── Gents / Western ──────────────────────────────────────────────────────
  "Gents Shirt":
    "OUTPUT: Formal or casual shirt with appropriate bottom. FORBIDDEN: Ethnic blending.",
  "T-shirt":
    "OUTPUT: T-shirt with appropriate bottom. FORBIDDEN: Ethnic blending.",
  Blazer:
    "OUTPUT: Blazer (with shirt/trouser if present in source). FORBIDDEN: Ethnic blending.",
  Jacket:
    "OUTPUT: Jacket with appropriate bottom. FORBIDDEN: Ethnic blending.",
  Trousers:
    "OUTPUT: Trousers with appropriate top. FORBIDDEN: Ethnic blending.",
  "Casual Set":
    "OUTPUT: Casual co-ord set exactly as in source. FORBIDDEN: Ethnic blending.",
  // ── Kids / Ethnic ─────────────────────────────────────────────────────────
  "Kids Kurta Set":
    "OUTPUT: Kids kurta set (kurta + pyjama + jacket if in source). Child proportions only. FORBIDDEN: Adult styling.",
  "Kids Lehenga":
    "OUTPUT: Kids lehenga set (lehenga + choli + dupatta if in source). Child proportions only. FORBIDDEN: Adult styling.",
  "Festive Set":
    "OUTPUT: Kids festive ethnic set exactly as in source. Child proportions only. FORBIDDEN: Adult styling.",
  // ── Kids / Western ────────────────────────────────────────────────────────
  Frock:
    "OUTPUT: Frock / dress exactly as in source. Child proportions only. FORBIDDEN: Adult styling.",
  Bottomwear:
    "OUTPUT: Kids bottomwear with appropriate top. Child proportions only. FORBIDDEN: Adult styling.",
  "Partywear Set":
    "OUTPUT: Kids partywear set exactly as in source. Child proportions only. FORBIDDEN: Adult styling.",
};

export function buildDrapingRules(productType: string): string {
  const rules: Record<string, string> = {
    // ── Ethnic Ladies ────────────────────────────────────────────────────────
    Saree: `
── SAREE DRAPING RULES ──────────────────────────────────────────────────────
Drape style: Nivi (default unless source shows otherwise).
Petticoat: neatly tucked at waist — not visible above waistband.
Pleats: 5–7 uniform centred front pleats · sharp folds · evenly spaced.
Pallu: over left shoulder · natural diagonal fall · full design visible · not covering face.
Blouse: fitted front and back — no pull · no gap · no stretch. Back hooks aligned.
CRITICAL: Zero blouse gap between blouse and saree waistband.`.trim(),

    Lehenga: `
── LEHENGA DRAPING RULES ───────────────────────────────────────────────────
Skirt: full circular flare · even ankle-length hem · uniform gather at waist.
Choli: fitted bodice · neckline exactly from source · no pull or gap.
Dupatta: over both shoulders or one shoulder per source image.
Embroidery on skirt hem: fully visible and unobstructed.`.trim(),

    "Kurta Set": `
── KURTA SET DRAPING RULES ─────────────────────────────────────────────────
Kurta: straight or A-line per source · hem length exactly from source.
Bottom: churidar — gathers at ankle · or palazzo — wide and even.
Dupatta: diagonal chest drape or over both shoulders per source.`.trim(),

    "Salwar Suit": `
── SALWAR SUIT DRAPING RULES ───────────────────────────────────────────────
Kurta: straight or A-line per source · hem length exactly from source.
Salwar: correct fit per source — straight / patiala / churidar.
Dupatta: diagonal chest drape or over both shoulders.`.trim(),

    Kurti: `
── KURTI DRAPING RULES ──────────────────────────────────────────────────────
Show with neutral bottom (white or black) unless source shows specific paired bottom.
Kurti length: exactly from source — short / mid / long / floor-length.
Neckline and sleeve: exactly from source.`.trim(),

    "Dupatta Set": `
── DUPATTA SET DRAPING RULES ───────────────────────────────────────────────
Draped naturally over both shoulders or one shoulder.
Full length visible — print and embroidery fully unobstructed.
Show with neutral base garment (plain kurta or suit).`.trim(),

    Blouse: `
── BLOUSE RENDERING RULES ──────────────────────────────────────────────────
Neckline · sleeve style · back design all clearly visible.
Show with plain petticoat unless source shows full saree.
Back blouse detail (hooks, ties, keyhole) reproduced exactly.`.trim(),

    // ── Ethnic Gents ─────────────────────────────────────────────────────────
    Kurta: `
── KURTA DRAPING RULES ──────────────────────────────────────────────────────
Kurta: straight or A-line per source · hem length exactly from source.
Bottom: churidar or pyjama if present in source — fit exactly from source.
Collar: mandarin or band per source · no alteration.`.trim(),

    Sherwani: `
── SHERWANI DRAPING RULES ──────────────────────────────────────────────────
All buttons fastened · straight placket · no pull or misalignment.
Even knee-length hem — consistent on all sides.
Churidar: fitted through leg with clean ankle gathers.
Collar: standing or folded per source.`.trim(),

    "Nehru Jacket": `
── NEHRU JACKET DRAPING RULES ──────────────────────────────────────────────
Jacket: straight fit · mandarin collar · all buttons fastened.
Worn over kurta/shirt from source — show full layered look.
Hem: hip-length unless source shows otherwise.`.trim(),

    "Ethnic Set": `
── ETHNIC SET DRAPING RULES ─────────────────────────────────────────────────
Render complete set as shown in source: kurta + bottom + jacket/waistcoat if present.
All buttons and fastenings aligned and fastened.
Proportions and hem lengths exactly from source.`.trim(),

    // ── Western Ladies ────────────────────────────────────────────────────────
    Dress: `
── DRESS DRAPING RULES ──────────────────────────────────────────────────────
Silhouette: A-line / wrap / shift / bodycon exactly from source — no alteration.
Hem length: exactly from source — mini / midi / maxi.
Neckline and sleeves: exactly from source.`.trim(),

    Top: `
── TOP DRAPING RULES ────────────────────────────────────────────────────────
Show with neutral bottom (white or black jeans/trousers) unless source shows specific pairing.
Neckline · sleeve length · hem: exactly from source.
No ethnic bottom unless source shows it.`.trim(),

    Shirt: `
── SHIRT DRAPING RULES ──────────────────────────────────────────────────────
Collar: exactly from source — spread / button-down / mandarin.
Buttons: fastened unless source shows open / casual wear.
Show with neutral bottom unless source shows specific pairing.`.trim(),

    Skirt: `
── SKIRT DRAPING RULES ──────────────────────────────────────────────────────
Length: exactly from source — mini / midi / maxi.
Silhouette: A-line / pencil / pleated / wrap exactly from source.
Show with neutral tucked-in top unless source shows specific pairing.`.trim(),

    "Co-ord Set": `
── CO-ORD SET DRAPING RULES ─────────────────────────────────────────────────
Render both pieces exactly as shown in source — top and bottom together.
Pattern / print / colour must match exactly across top and bottom.
No mixing of pieces from other garments.`.trim(),

    "Gown / Partywear": `
── GOWN / PARTYWEAR DRAPING RULES ─────────────────────────────────────────
Train: fully visible if present — length exactly from source.
Silhouette: A-line / mermaid / ball gown exactly per source — no flattening.
Volume and structure: maximum drama — no deflating of layers.`.trim(),

    // ── Western Gents ─────────────────────────────────────────────────────────
    "Gents Shirt": `
── GENTS SHIRT DRAPING RULES ───────────────────────────────────────────────
Collar: exactly from source — spread / button-down / band.
Buttons: fastened unless source shows casual open style.
Tucked or untucked per source. Show with appropriate bottom.`.trim(),

    "T-shirt": `
── T-SHIRT DRAPING RULES ────────────────────────────────────────────────────
Fit: slim / regular / oversized exactly from source.
Neckline: crew / V-neck / polo exactly from source.
Show with neutral jeans or trousers unless source shows specific bottom.`.trim(),

    Blazer: `
── BLAZER DRAPING RULES ─────────────────────────────────────────────────────
Single or double-breasted per source — buttons fastened.
Lapel: exactly from source — notch / peak / shawl.
Show with shirt and trousers if present in source.`.trim(),

    Jacket: `
── JACKET DRAPING RULES ─────────────────────────────────────────────────────
Style: bomber / denim / leather / utility exactly from source.
Zip or buttons per source — show fastened or open as in source.
Show with appropriate bottom from source or neutral alternative.`.trim(),

    Trousers: `
── TROUSERS DRAPING RULES ───────────────────────────────────────────────────
Fit: slim / regular / wide-leg exactly from source.
Hem: exact break and length from source.
Show with appropriate top from source or neutral alternative.`.trim(),

    "Casual Set": `
── CASUAL SET DRAPING RULES ─────────────────────────────────────────────────
Render both pieces exactly as shown in source — top and bottom together.
Pattern / print / colour must match exactly across both pieces.
No mixing of pieces from other garments.`.trim(),

    // ── Kids ──────────────────────────────────────────────────────────────────
    "Kids Kurta Set": `
── KIDS KURTA SET DRAPING RULES ─────────────────────────────────────────────
All proportions scaled to child body — no adult silhouette.
Kurta: correct length for child · neckline from source.
Bottom: churidar / pyjama as shown in source.
Jacket / waistcoat if present in source — render exactly.`.trim(),

    "Kids Lehenga": `
── KIDS LEHENGA DRAPING RULES ───────────────────────────────────────────────
All proportions scaled to child body — no adult silhouette.
Skirt: circular flare · ankle-length or per source.
Choli: fitted to child — no adult styling cues.
Dupatta if in source — light and manageable proportions.`.trim(),

    "Festive Set": `
── KIDS FESTIVE SET DRAPING RULES ──────────────────────────────────────────
Render complete festive set as shown in source.
All proportions scaled to child body — no adult styling.
Colours and embellishments exactly from source.`.trim(),

    Frock: `
── FROCK DRAPING RULES ──────────────────────────────────────────────────────
All proportions scaled to child body.
Silhouette: A-line / princess / gathered exactly from source.
Hem length: exactly from source — knee-length typical.`.trim(),

    Bottomwear: `
── KIDS BOTTOMWEAR DRAPING RULES ────────────────────────────────────────────
All proportions scaled to child body.
Fit: per source — leggings / trousers / shorts.
Show with appropriate top from source or neutral alternative.`.trim(),

    "Partywear Set": `
── KIDS PARTYWEAR SET DRAPING RULES ─────────────────────────────────────────
Render complete partywear set as shown in source.
All proportions scaled to child body — no adult styling cues.
Embellishments and colour exactly from source.`.trim(),
  };

  return (
    rules[productType] ||
    `── GARMENT FIT ───────────────────────────────────────────────────────────────\nFit, drape, and silhouette exactly as shown in PRODUCT_IMAGE.`
  );
}

function buildProductTypeIsolation(productType: string): string {
  const directive =
    PRODUCT_TYPE_ISOLATION[productType] ||
    `OUTPUT: ${productType} only — exactly as shown in PRODUCT_IMAGE. FORBIDDEN: Cross-category mixing.`;
  return `
── PRODUCT TYPE ISOLATION — MANDATORY ──────────────────────────────────────
${directive}
No AI-assumed additions. No substitution. No mixing. Zero deviation.
`.trim();
}

function buildKidsGuard(segment: string): string {
  if (!/kids/i.test(segment)) return "";
  return `
── KIDS PROPORTIONS — STRICT ───────────────────────────────────────────────
Scale ALL garment dimensions to child body proportions.
Fit · length · volume · silhouette → child-appropriate.
No adult styling cues · no adult posing · no exaggerated shaping.
Age-appropriate only.
`.trim();
}

const APPAREL_NEGATIVE_PROMPT = `
── NEGATIVE PROMPT ─────────────────────────────────────────────────────────
--no category mixing, no hybrid/fusion unless in PRODUCT_IMAGE,
no AI-added extra items, no assumption-based styling,
no replacement of product type, no face change, no skin tone shift,
no body distortion, no slimming, no reshaping, no body enhancement,
no blur, no low resolution, no waxy skin, no plastic skin,
no broken anatomy, no extra limbs, no missing limbs,
no fabric warping, no texture stretching, no pattern scale error,
no tile distortion, no embroidery averaging, no garment colour drift,
no generic AI garment, no floating fabric, no clipping, no blouse gap,
no lighting mismatch, no background bleed through opaque fabric,
no watermark, no collage, no text overlay, no UI elements,
no identity drift, no over-smoothing, no HDR artefacts,
no chromatic aberration
`.trim();

export function buildApparelPrompt(inputs: ApparelInputs): string {
  const {
    segment = "Ladies",
    wearType = "Ethnic Wear",
    productType = "Garment",
    background = "White Studio",
    backgroundImageUrl,
    outputStyle = "Catalog",
    outputViews,
    modelRefUrl,
    aiNotes,
  } = inputs;

  const header = `[MODE: AI STUDIO] [HUB: APPAREL] [SEGMENT: ${segment}] [WEAR TYPE: ${wearType}] [PRODUCT TYPE: ${productType}]`;

  const isolationBlock = buildProductTypeIsolation(productType);
  const drapingRules = buildDrapingRules(productType);
  const kidsGuard = buildKidsGuard(segment);
  const identityLock = modelRefUrl
    ? `\n${STUDIO_IDENTITY_LOCK}\n`
    : "";
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

${isolationBlock}

${GARMENT_EXTRACTION}

${FABRIC_PHYSICS_TABLE}

${drapingRules}

${CLOTH_PHYSICS}
${kidsGuard ? `\n${kidsGuard}` : ""}${identityLock}
── BACKGROUND ───────────────────────────────────────────────────────────────
${bgPrompt}

── OUTPUT STYLE ─────────────────────────────────────────────────────────────
${stylePrompt}
${viewsBlock}${notesBlock}
── QUALITY GATES ────────────────────────────────────────────────────────────
${STUDIO_QUALITY_GATES}

${APPAREL_NEGATIVE_PROMPT}
`.trim();
}
