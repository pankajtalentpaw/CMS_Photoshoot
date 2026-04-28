// export interface LegacyPromptInputs {
//   mode: "Virtual Try-On" | "AI Studio";
//   isKidsMode: boolean;
//   garmentType: "Fabric" | "Ready-made";
//   genderHint: string;
//   categoryHint: string;
//   styleHint: string;
//   viewHint: string;
//   backgroundHint: string;
//   mergedPrompt: string;
// }

// const negativePrompt =
//   "no face change, no body distortion, no slimming, no blur, no low-res, no waxy skin, no broken anatomy, no extra limbs, no fabric distortion, no texture stretching, no lighting mismatch";

// export function buildLegacyPrompt(inputs: LegacyPromptInputs): string {
//   const {
//     mode,
//     isKidsMode,
//     garmentType,
//     genderHint,
//     categoryHint,
//     styleHint,
//     viewHint,
//     backgroundHint,
//     mergedPrompt,
//   } = inputs;

//   const isVirtualTryOn = mode === "Virtual Try-On";

//   if (isVirtualTryOn) {
//     return [
//       "Task: Redress the subject in the model/person image with the clothing from the garment/product image.",
//       "Replace only the clothing while strictly preserving the subject's face, identity, expression, body proportions, posture, and skin tone.",
//       "Identity Lock (hard constraints): preserve 100% facial identity (pores, freckles, moles, micro-details); maintain exact body shape and pose; no body reshaping; no facial or anatomical alterations.",
//       ...(isKidsMode ? ["If the subject is a child, keep age and identity unchanged."] : []),
//       `Fabric Pipeline: ${garmentType}.`,
//       ...(garmentType === "Ready-made"
//         ? [
//             "Ready-made: directly map the garment with accurate fit, scale, alignment, and perspective.",
//             `Refine using Output Style: ${styleHint}, Output Format: ${viewHint}.`,
//           ]
//         : [
//             `Fabric: generate garment using Person Type: ${genderHint}${categoryHint ? ` and Clothing Category: ${categoryHint}` : ""}.`,
//             "Define realistic material properties (thickness, weight, elasticity, gravity-driven drape), then apply with precise tailoring, seams, and cloth simulation.",
//             `Style using Output Style: ${styleHint}, Output Format: ${viewHint}.`,
//           ]),
//       "Rendering Fidelity: high photorealism, accurate fabric texture and color, patterns, stitching, seams; natural folds and draping; correct fit and perspective.",
//       "Photography Direction: professional catalog pose (S-curve or 3/4 turn); clean studio or selected environment; soft neutral diffused lighting.",
//       "Camera: 85mm prime lens look; aperture f/22 (all-in-focus clarity).",
//       "Physics & Grounding: realistic cloth physics, tension lines, strong contact shadows + ambient occlusion; no floating/clipping.",
//       mergedPrompt ? `AI Director Notes (optional): ${mergedPrompt}` : "",
//       `Negative Prompt: ${negativePrompt}.`,
//     ]
//       .filter(Boolean)
//       .join(" ");
//   }

//   // AI Studio Prompt
//   return [
//     "Task: Take the clothing from the uploaded product image and put it directly onto the selected model image.",
//     "Constraint 1: Use the exact selected model; do NOT generate a new person.",
//     "Constraint 2: Keep the face, identity, body proportions, skin tone, and pose exactly the same.",
//     "Ensure a realistic fit, accurate fabric draping, natural folds, and correct alignment/perspective.",
//     `Use Background: ${backgroundHint}. Match lighting, shadows, and color grading to this background.`,
//     `Style Output Using: ${styleHint}.`,
//     mergedPrompt ? `AI Director Notes: ${mergedPrompt}` : "",
//     "Photography: clean, ultra-realistic, high-quality premium fashion image.",
//     "Output: the exact same model wearing the product, with proper lighting and artifact-free clarity.",
//     `Negative Prompt: ${negativePrompt}, no person swap, no face swap, no pose change, no identity drift.`,
//   ]
//     .filter(Boolean)
//     .join(" ");
// }
export interface LegacyPromptInputs {
  mode: "Virtual Try-On" | "AI Studio";
  isKidsMode: boolean;
  garmentType: "Fabric" | "Ready-made";
  genderHint: string;
  categoryHint: string;
  styleHint: string;
  viewHint: string;
  backgroundHint: string;
  mergedPrompt: string;
}

const negativePrompt =
  "no face change, no body distortion, no slimming, no blur, no low-res, no waxy skin, no broken anatomy, no extra limbs, no fabric distortion, no texture stretching, no lighting mismatch";

export function buildLegacyPrompt(inputs: LegacyPromptInputs): string {
  const {
    mode,
    isKidsMode,
    garmentType,
    genderHint,
    categoryHint,
    styleHint,
    viewHint,
    backgroundHint,
    mergedPrompt,
  } = inputs;

  const isVirtualTryOn = mode === "Virtual Try-On";

  if (isVirtualTryOn) {
    return [
      "Task: Redress the subject in the model/person image with the clothing from the garment/product image.",
      "Replace only the clothing while strictly preserving the subject's face, identity, expression, body proportions, posture, and skin tone.",
      "Identity Lock (hard constraints): preserve 100% facial identity (pores, freckles, moles, micro-details); maintain exact body shape and pose; no body reshaping; no facial or anatomical alterations.",
      ...(isKidsMode ? ["If the subject is a child, keep age and identity unchanged."] : []),
      `Fabric Pipeline: ${garmentType}.`,
      ...(garmentType === "Ready-made"
        ? [
            "Ready-made: directly map the garment with accurate fit, scale, alignment, and perspective.",
            `Refine using Output Style: ${styleHint}, Output Format: ${viewHint}.`,
          ]
        : [
            `Fabric: generate garment using Person Type: ${genderHint}${categoryHint ? ` and Clothing Category: ${categoryHint}` : ""}.`,
            "Define realistic material properties (thickness, weight, elasticity, gravity-driven drape), then apply with precise tailoring, seams, and cloth simulation.",
            `Style using Output Style: ${styleHint}, Output Format: ${viewHint}.`,
          ]),
      "Rendering Fidelity: high photorealism, accurate fabric texture and color, patterns, stitching, seams; natural folds and draping; correct fit and perspective.",
      "Photography Direction: professional catalog pose (S-curve or 3/4 turn); clean studio or selected environment; soft neutral diffused lighting.",
      "Camera: 85mm prime lens look; aperture f/22 (all-in-focus clarity).",
      "Physics & Grounding: realistic cloth physics, tension lines, strong contact shadows + ambient occlusion; no floating/clipping.",
      mergedPrompt ? `AI Director Notes (optional): ${mergedPrompt}` : "",
      `Negative Prompt: ${negativePrompt}.`,
    ]
      .filter(Boolean)
      .join(" ");
  }

  // AI Studio Prompt
  return [
    "Task: Take the clothing from the uploaded product image and put it directly onto the selected model image.",
    "Constraint 1: Use the exact selected model; do NOT generate a new person.",
    "Constraint 2: Keep the face, identity, body proportions, skin tone, and pose exactly the same.",
    "Ensure a realistic fit, accurate fabric draping, natural folds, and correct alignment/perspective.",
    `Use Background: ${backgroundHint}. Match lighting, shadows, and color grading to this background.`,
    `Style Output Using: ${styleHint}.`,
    mergedPrompt ? `AI Director Notes: ${mergedPrompt}` : "",
    "Photography: clean, ultra-realistic, high-quality premium fashion image.",
    "Output: the exact same model wearing the product, with proper lighting and artifact-free clarity.",
    `Negative Prompt: ${negativePrompt}, no person swap, no face swap, no pose change, no identity drift.`,
  ]
    .filter(Boolean)
    .join(" ");
}