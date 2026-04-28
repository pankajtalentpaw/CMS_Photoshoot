// src/services/geminiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/shared/config/env";

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

interface RefinementInput {
  segment: string;
  style: string;
  model: string;
  background: string;
  directorNotes?: string;
}

/**
 * Service to refine user inputs into professional AI prompts using Gemini.
 */
export const geminiService = {
  /**
   * Transforms structured selections into a high-fidelity photographic prompt.
   */
  async refinePrompt(input: RefinementInput): Promise<string> {
    try {
      if (!genAI) {
        return `${input.segment} ${input.style} on a ${input.model} model, ${input.background} background.`;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const systemPrompt = `
        You are an expert Fashion Creative Director and Prompt Engineer for high-end AI image generation.
        Your task is to convert simple garment and scene selections into professional, descriptive photographic briefs for Stable Diffusion XL.
        
        STRICT RULES:
        1. Focus on fabric textures, embroidery details, and lighting physics.
        2. Always specify professional camera gear (e.g., Phase One XF, 80mm lens).
        3. Maintain high-end fashion editorial aesthetics.
        4. Do NOT include conversational text, only the prompt.
      `;

      const userPrompt = `
        Product: ${input.segment} ${input.style}
        Model: ${input.model}
        Setting: ${input.background}
        Notes: ${input.directorNotes || "None"}

        Generate a high-fidelity diffusion prompt.
      `;

      const result = await model.generateContent([systemPrompt, userPrompt]);
      const response = await result.response;
      return response.text().trim();
    } catch (error: unknown) {
      console.error("❌ [geminiService] Error refining prompt:", error);
      return `${input.segment} ${input.style} on a ${input.model} model, ${input.background} background.`;
    }
  }
};