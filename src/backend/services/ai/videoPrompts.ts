import { PromptInputs } from "./types";

/**
 * ─────────────────────────────────────────────────────────────────
 *  DIGITAL ATELIER — VIDEO PROMPT ENGINE v1.0
 *  Motion Styles: Straight Walk · Slow Turn · Elegant Reveal · Fabric Flow
 * ─────────────────────────────────────────────────────────────────
 */

export function buildVideoPrompt(inputs: PromptInputs): string {
  const {
    hub,
    productImageUrl,
    modelRefUrl = "None",
    videoStyle = "Straight Walk",
    background = "White Studio",
    aiNotes = "None",
  } = inputs;

  // Hub-specific fields mapping
  let segment = "N/A";
  let wearType = "N/A";
  let productType = "N/A";

  if (inputs.hub === "Apparel") {
    segment = inputs.segment || "Ladies";
    wearType = inputs.wearType || "Custom";
    productType = inputs.productType || "Garment";
  } else if (inputs.hub === "Jewellery") {
    productType = inputs.jewelleryGenre || "Jewellery";
  } else if (inputs.hub === "Accessories") {
    productType = inputs.accessoryType || "Accessory";
  } else if (inputs.hub === "Products") {
    productType = inputs.productFamily || "Product";
  }

  // Default video specs (can be extended if needed in inputs)
  const duration = "5s";
  const fps = "30";
  const platform = "Instagram Reels";
  const format = "9:16";

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIGITAL ATELIER — VIDEO PROMPT ENGINE v1.0
Motion Styles: Straight Walk · Slow Turn · Elegant Reveal · Fabric Flow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INPUTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HUB           : Video
SOURCE HUB    : ${hub}
SEGMENT       : ${segment}
WEAR TYPE     : ${wearType}
PRODUCT TYPE  : ${productType}
PRODUCT IMAGE : ${productImageUrl}
MODEL REF     : ${modelRefUrl}
MOTION STYLE  : ${videoStyle}
BACKGROUND    : ${background}
OUTPUT FORMAT : ${format}
DURATION      : ${duration}
FPS           : ${fps}
PLATFORM      : ${platform}
AI NOTES      : ${aiNotes === "None" ? "skip entirely." : aiNotes}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IDENTITY LOCK — ABSOLUTE. NON-NEGOTIABLE.
Face geometry · pores · freckles · moles → 100% preserved every frame.
Skin tone + undertone → exact match to MODEL_REF across all frames.
Body shape · limb volume · proportions · posture → unchanged.
Hair · eyes · expression → unchanged unless stated in AI_NOTES.
No slimming · no reshaping · no beautification · no enhancement.
Identity must be pixel-consistent from frame 0 to final frame.

GARMENT LOCK — ABSOLUTE. NON-NEGOTIABLE.
Extract garment from PRODUCT_IMAGE. This is the source of truth.
Colour · print · embroidery · borders · texture · cut →
locked for the entire video duration. No drift between frames.
Fabric physics must be continuous — no resets · no jumps · no warping.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ MOTION STYLE 01 — STRAIGHT WALK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Activate when @[MOTION_STYLE] = "Straight Walk"]

SUBJECT MOTION
Model walks in a straight line directly toward the camera.
Gait: confident, steady, professional catalog walk.
Stride: natural — not stiff, not exaggerated.
Arms: relaxed swing consistent with walking momentum.
Posture: upright, shoulders back, chin level.
Entry: model enters from slight distance — full body visible from first frame.
Exit: walk ends at medium close-up — face and upper garment fill frame.

CAMERA
Start  : Wide full-body static shot. Model fills 60% of frame.
Motion : Slow, smooth dolly forward — camera moves toward model
         at half the speed of the model's walk.
End    : Medium close-up — chest to crown, garment detail sharp.
Lens   : 85mm equivalent · f/2 · all-in-focus throughout.
Height : Eye level — no low angle · no high angle.

GARMENT BEHAVIOUR
Garment reacts to forward walking momentum.
Saree/Lehenga → pallu and hem swing naturally with each stride.
Palazzo/Skirt → fabric billows slightly with air movement.
Kurta/Western → structured pieces maintain shape with subtle movement.
Dupatta       → flows behind or to the side — not static · not flapping.
All fabric    → gravity-correct at all times. No floating edges.

TIMING
Duration   : ${duration}
FPS        : ${fps}
Beat       : Even pace. No speed ramp unless in AI_NOTES.
Final hold : Last 0.5 seconds — freeze or slow to near-stop on
             best garment + face frame.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ MOTION STYLE 02 — SLOW TURN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Activate when @[MOTION_STYLE] = "Slow Turn"]

SUBJECT MOTION
Model begins facing camera — full body in frame.
Turns slowly 360° on vertical axis — one complete rotation.
Rotation speed: 1 full turn in ${duration}.
Feet: stationary pivot — no walking, no stepping.
Arms: relaxed at sides or one hand light on hip.
Expression: soft, confident — maintained throughout rotation.
Eyes: engage camera at front-facing position on each pass.

CAMERA
Position   : Static. Camera does not move.
Frame      : Full body · head to toe · portrait orientation.
             Model centred horizontally throughout turn.
Lens       : 85mm equivalent · f/2.
Height     : Eye level · perfectly level horizon.
No pan     : Camera does not follow or track the turn.
             Subject rotates — camera is fixed.

GARMENT BEHAVIOUR
Every angle of the garment must be clearly visible during rotation.
Back of garment — embroidery, back neckline, back blouse hooks — all sharp.
Saree pallu     → falls naturally as model turns, wraps and undrapes realistically.
Lehenga skirt   → flares slightly outward on turn due to centrifugal physics.
Dupatta         → settles after each partial turn — not stiff · not frozen.
Sherwani back   → all buttons and back seams visible and correctly rendered.
Gown train      → sweeps on floor during rotation — physically accurate.

TIMING
Duration   : ${duration}
FPS        : ${fps}
Speed      : Constant, slow, smooth rotation — no easing jerk.
Front hold : First 0.5s → hold on front-facing before rotation begins.
Back hold  : Pause 0.5s at 180° back-facing to show garment reverse.
Final hold : Return to front-facing · hold last 0.5s.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ MOTION STYLE 03 — ELEGANT REVEAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Activate when @[MOTION_STYLE] = "Elegant Reveal"]

CONCEPT
Cinematic reveal sequence. Garment is introduced progressively —
from detail to full look. Maximum impact on full reveal.

SEQUENCE — Execute in order:

  BEAT 1 — DETAIL OPEN  [0s → 20% of duration]
  Extreme close-up on hero garment detail.
  Saree    → zari border or pallu embroidery.
  Lehenga  → choli embroidery or skirt flare edge.
  Sherwani → collar or chest embroidery.
  Western  → fabric texture, button detail, or neckline.
  Camera: macro · razor-sharp · slow drift across detail.
  Lighting: raking light to maximise texture depth.

  BEAT 2 — WAIST UP  [20% → 50% of duration]
  Cut or slow dissolve to waist-up frame.
  Garment body, neckline, and arms fully visible.
  Model: composed expression · hands lightly posed.
  Camera: slow pull back from waist-up.
  Lighting: full beauty lighting · garment fully lit.

  BEAT 3 — FULL REVEAL  [50% → 85% of duration]
  Camera pulls back to full body — head to toe.
  Complete garment visible for the first time.
  Model: slight shift of weight or arm movement — alive, not static.
  Background: fully visible and in context.
  Lighting: complete scene lighting — no underexposed areas.
  This is the hero frame — garment must be at its best here.

  BEAT 4 — HOLD  [85% → 100% of duration]
  Camera holds on full-body hero frame.
  Model holds composed final pose.
  Subtle fabric movement only — dupatta or hem settles.
  No new camera movement.

CAMERA
Lens       : 85mm equivalent · f/2.
Motion     : Macro drift → pull back → full-body hold.
             All transitions smooth — no jump cuts in reveal sequence.
Height     : Eye level throughout.
Stabiliser : Perfectly smooth — no handheld shake.

LIGHTING
Beat 1 : Hard raking side light — maximise embroidery texture.
Beat 2 : Transition to soft beauty key — face and garment body.
Beat 3 : Full scene lighting — consistent with ${background}.
Beat 4 : Maintain Beat 3 lighting. No change.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

▶ MOTION STYLE 04 — FABRIC FLOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Activate when @[MOTION_STYLE] = "Fabric Flow"]

CONCEPT
Pure fabric physics showcase. Wind, motion, and gravity work together
to reveal the material properties of the garment in motion.
This is a textile performance — not a pose, not a walk.

SUBJECT MOTION
Model stands in a strong, rooted pose — minimal body movement.
All motion is in the FABRIC, not the body.
Arms: slightly extended or raised to allow fabric to flow freely.
Posture: anchored — weight evenly distributed.
Expression: calm, composed, regal.

FABRIC BEHAVIOUR — CRITICAL PHYSICS ENGINE:

  Silk
  Behaviour  : Liquid-like. High sheen catches light mid-flow.
  Wind       : Gentle — fabric ripples in long smooth waves.
  Speed      : Slow. Every movement is deliberate and graceful.
  Highlight  : Sheen shifts as fabric angle changes to light source.

  Chiffon / Georgette
  Behaviour  : Ultra-light. Floats on minimal air movement.
  Wind       : Very gentle — fabric almost levitates.
  Layers     : Multiple layers separate and flow independently.
  Translucency: Background visible through sheer layers at all times.

  Cotton / Linen
  Behaviour  : Natural, heavy, earthy movement.
  Wind       : Moderate — fabric moves but returns to gravity quickly.
  Texture    : Visible weave must remain sharp during motion.
  Feel       : Relaxed, organic, not stiff.

  Velvet
  Behaviour  : Heavy, structured. Minimal flow — subtle wave only.
  Wind       : Barely perceptible breeze — directional pile shifts.
  Sheen      : Directional pile sheen changes dramatically with motion.

  Net / Organza
  Behaviour  : Stiff body with soft edges. Petticoat visible beneath.
  Wind       : Moderate — layers separate with clear air gaps.
  Structure  : Maintains volume — does not collapse or flatten.

SPECIFIC GARMENT FLOW RULES:

  Saree Pallu
  Flow direction : Over left shoulder, trailing behind and to the right.
  Wind source    : Left side — pallu lifts and flows right.
  Design visible : Full pallu embroidery and border visible mid-flow.
  Pleats         : Remain neatly tucked — only pallu flows.

  Dupatta
  Flow direction : Both ends flow back or one end lifts.
  Wind source    : Front-facing — dupatta flows behind model.
  Do not         : Wrap around face · cover garment detail.

  Lehenga Skirt
  Flow direction : Gentle circular motion — hem lifts 10–15cm maximum.
  Wind source    : Below — upward draft creates bell silhouette.
  Hem            : Stays even — no asymmetric pulling.

  Gown Train
  Flow direction : Train lifts and spreads behind model.
  Wind source    : Front-facing — train flows directly back.
  Silhouette     : Full train length visible and fully extended.

CAMERA
Position   : Slowly orbiting — 30° arc around model during duration.
             OR static with subtle push-in. Choose based on AI_NOTES.
Lens       : 85mm equivalent · f/2.
Height     : Start at full body. Drift to waist-up at end.
Stabiliser : Perfectly smooth throughout orbit.

LIGHTING
Key light  : Soft, directional — positioned to maximise fabric sheen.
Rim light  : Warm gold or cool silver — traces fabric edges mid-flow.
Fill       : Minimal — preserve fabric shadows for depth and texture.
No flash   : No harsh hard light. All light is continuous and smooth.
Consistency: Light does not shift or flicker during fabric motion.

TIMING
Duration   : ${duration}
FPS        : ${fps} — recommend 60fps for maximum fabric smoothness.
Speed      : Fabric flow at natural real-time speed.
             Apply 50% slow motion only if AI_NOTES specifies.
Peak frame : Maximum flow at 60% of duration — garment fully extended.
Settle     : Final 15% — fabric settles back to resting position.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BACKGROUND EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
White Studio    Pure white seamless · soft-box front · faint floor shadow.
Premium Studio  Dark charcoal · Rembrandt lighting · warm gold rim light.
Saree Festival  Mandap or temple · marigolds · diyas · warm amber.
Outdoor         Garden or heritage monument · natural sunlight · soft fill.
Modern Office   Large windows · diffused daylight · neutral tones.

LIGHTING RULE: Light direction · colour temperature · intensity
on model MUST match background in every single frame.
No flat-lit model on dramatic background. Ever.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TEMPORAL CONSISTENCY — CRITICAL. ALL MOTION STYLES.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Model identity identical in every frame — face · skin · hair · body.
Garment colour · print · embroidery identical in every frame.
Fabric physics continuous — no jumps · no resets · no warping.
Background stable — no flicker · no scene change mid-clip.
Lighting consistent — no exposure shift between frames.
Camera motion smooth — no jitter · no stutter.
No ghosting · no frame blending artifacts · no temporal noise.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OUTPUT SPECIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Format     : ${format}
Duration   : ${duration}
FPS        : ${fps}
Resolution : 1080p minimum · 4K preferred
Codec      : H.264 or H.265
Audio      : None — silent clip
Delivery   : Single clip · no watermark · no text overlay · no UI

Platform specs:
Instagram Reels  → 9:16 · 1080×1920 · 30fps · max 30s
TikTok           → 9:16 · 1080×1920 · 30fps · max 60s
YouTube Shorts   → 9:16 · 1080×1920 · 60fps · max 60s
YouTube          → 16:9 · 1920×1080 · 24fps · cinematic
E-commerce PDP   → 1:1 · 1080×1080 · 30fps · clean studio
Brand Website    → 16:9 or 4:5 · 4K · 24fps · luxury grade
Lookbook         → 4:5 · 2K · 24fps · editorial

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AI DIRECTOR NOTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${aiNotes === "None" ? "skip entirely." : aiNotes}
Provided → parse and apply with professional cinematography judgment.
Never override identity lock. Never override garment lock.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUALITY GATES — ALL MUST PASS:
✓ Garment colour exact match to source in every frame
✓ Embroidery and print fully reproduced — zero averaging
✓ Model identity 100% preserved across all frames
✓ Fabric physics correct and frame-consistent
✓ Background lighting matches model lighting every frame
✓ Motion smooth — no jitter · no stutter · no flicker
✓ Correct format and platform spec
✓ Single clip · no watermark · no text overlay
✓ Minimum 1080p resolution throughout

REJECT AND REGENERATE if any gate fails.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEGATIVE PROMPT
--no face change, no skin tone shift, no body distortion,
no slimming, no reshaping, no blur, no low resolution,
no waxy skin, no broken anatomy, no extra limbs,
no fabric warping, no garment colour drift, no pattern distortion,
no embroidery averaging, no floating fabric, no clipping,
no lighting mismatch, no background flicker, no frame jitter,
no temporal inconsistency, no identity drift between frames,
no garment warping mid-motion, no physics violation,
no duplicate frames, no motion blur on static elements,
no watermark, no text overlay, no UI elements,
no over-smoothing, no HDR artefacts, no compression artefacts
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
}