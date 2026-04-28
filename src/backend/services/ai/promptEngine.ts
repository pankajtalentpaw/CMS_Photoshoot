import {
  PromptInputs,
  ApparelInputs,
} from "./types";

import { buildVirtualTryOnPrompt } from "./virtual-try-on";
import { buildAiStudioPrompt } from "./ai-studio";

export * from "./types";

/**
 * buildMasterPrompt
 * Master router for all AI prompt generation.
 * Type-safe, extensible, and production-ready.
 */
export function buildMasterPrompt(inputs: PromptInputs): string {
  // 🔒 Explicit routing (recommended)
  if (inputs.mode === "Virtual Try-On") {
    // Narrow type safely (no `any`)
    if (inputs.hub === "Apparel") {
      return buildVirtualTryOnPrompt(inputs as ApparelInputs);
    }

    // Future: support VTON for other hubs
    throw new Error(
      `[VTON] Unsupported hub "${inputs.hub}". Currently only Apparel is supported.`
    );
  }

  // 🎯 Default → AI Studio (editorial / creative generation)
  return buildAiStudioPrompt(inputs);
}