// src/services/falService.ts
import { env } from "@/shared/config/env";

/**
 * Service to handle GPU inference calls via fal.ai.
 * Targeted Model: fal-ai/fashn/tryon/v1.5 (optimized for fashion)
 */
export const falService = {
  /**
   * Triggers a Virtual Try-On generation.
   */
  async triggerVirtualTryOn(params: {
    garmentImageUrl: string;
    modelImageUrl: string;
    prompt: string;
  }) {
    const { garmentImageUrl, modelImageUrl, prompt } = params;

    if (!env.FAL_KEY) {
      throw new Error("FAL_KEY is not configured");
    }

    try {
      const response = await fetch("https://fal.run/fal-ai/fashn/tryon/v1.5", {
        method: "POST",
        headers: {
          "Authorization": `Key ${env.FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_image: modelImageUrl,
          garment_image: garmentImageUrl,
          ...(prompt ? { prompt } : {}),
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`fal.ai Error: ${err}`);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      console.error("❌ [falService] triggerVirtualTryOn Error:", error);
      throw error;
    }
  }
};