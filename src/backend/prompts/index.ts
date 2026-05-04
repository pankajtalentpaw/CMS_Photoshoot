// Prompts Module
// This module centrally manages all LLM prompts used for generation.

import { PromptInputs, ApparelInputs, JewelleryInputs, AccessoriesInputs, ProductsInputs } from "../services/ai/types";
import { buildApparelPrompt } from "../services/ai/hubs/Apparel";
import { buildJewelleryPrompt } from "../services/ai/hubs/Jewellery";
import { buildAccessoriesPrompt } from "../services/ai/hubs/Accessories";
import { buildProductsPrompt } from "../services/ai/hubs/Products";
import { buildVirtualTryOnPrompt } from "../services/ai/hubs/VirtualTryOn";
import { buildVideoPrompt } from "../services/ai/videoPrompts";

export * from "../services/ai/types";
export * from "../services/ai/hubs/Apparel";
export * from "../services/ai/hubs/Jewellery";
export * from "../services/ai/hubs/Accessories";
export * from "../services/ai/hubs/Products";
export * from "../services/ai/hubs/VirtualTryOn";
export * from "../services/ai/videoPrompts";

/**
 * buildMasterPrompt
 * Master router for all AI prompt generation.
 * Dispatch order: Video → Virtual Try-On → AI Studio (hub-specific)
 */
export function buildMasterPrompt(inputs: PromptInputs): string {
  // Video generation
  if (inputs.videoStyle) {
    return buildVideoPrompt(inputs);
  }

  // Virtual Try-On — dispatch to hub-specific VTON builder
  if (inputs.mode === "Virtual Try-On") {
    return buildVirtualTryOnPrompt(inputs);
  }

  // AI Studio — dispatch to hub-specific studio builder
  switch (inputs.hub) {
    case "Apparel":
      return buildApparelPrompt(inputs as ApparelInputs);
    case "Jewellery":
      return buildJewelleryPrompt(inputs as JewelleryInputs);
    case "Accessories":
      return buildAccessoriesPrompt(inputs as AccessoriesInputs);
    case "Products":
      return buildProductsPrompt(inputs as ProductsInputs);
    default:
      throw new Error(`[promptModule] Unknown hub: "${(inputs as { hub: string }).hub}"`);
  }
}
