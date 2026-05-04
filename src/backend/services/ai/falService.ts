import { env } from "@/shared/config/env";
import type { ApparelInputs, JewelleryInputs, AccessoriesInputs } from "./types";
import { buildVirtualTryOnPrompt } from "./hubs/VirtualTryOn";

type VTONInputs = (ApparelInputs | JewelleryInputs | AccessoriesInputs) & {
  modelRefUrl: string;
};

// FASHN v1.5 API requires category: tops | bottoms | one-pieces
type FashnCategory = "tops" | "bottoms" | "one-pieces";

function resolveFashnCategory(inputs: VTONInputs): FashnCategory {
  if (inputs.hub === "Apparel") {
    const pt = (inputs as ApparelInputs).productType ?? "";
    const bottomsTypes = ["Skirt", "Trousers", "Bottomwear"];
    const topsTypes = [
      "Kurti", "Kurta", "Blouse", "Top", "Shirt", "Gents Shirt",
      "T-shirt", "Blazer", "Jacket", "Nehru Jacket",
    ];
    if (bottomsTypes.includes(pt)) return "bottoms";
    if (topsTypes.includes(pt)) return "tops";
    // Everything else (Saree, Lehenga, full sets, gowns) is one-piece
    return "one-pieces";
  }
  // Jewellery and Accessories — fal.ai doesn't natively support these,
  // but "tops" is the least-wrong category for upper-body accessories.
  return "tops";
}

export const falService = {
  async triggerVirtualTryOn(inputs: VTONInputs) {
    if (!env.FAL_KEY) {
      throw new Error("FAL_KEY is not configured");
    }

    if (!inputs.modelRefUrl) {
      throw new Error("[falService] modelRefUrl is required for Virtual Try-On");
    }

    const prompt = buildVirtualTryOnPrompt(inputs);
    const category = resolveFashnCategory(inputs);

    try {
      const response = await fetch("https://fal.run/fal-ai/fashn/tryon/v1.5", {
        method: "POST",
        headers: {
          Authorization: `Key ${env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_image: inputs.modelRefUrl,
          garment_image: inputs.productImageUrl,
          category,
          garment_photo_type: "auto",
          mode: "quality",
          prompt,
          nsfw_filter: true,
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`fal.ai error: ${err}`);
      }

      return response.json();
    } catch (error: unknown) {
      console.error("❌ [falService] triggerVirtualTryOn error:", error);
      throw error;
    }
  },
};
