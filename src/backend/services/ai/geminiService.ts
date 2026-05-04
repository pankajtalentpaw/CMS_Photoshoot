import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "@/shared/config/env";
import type { PromptInputs } from "@/backend/prompts";

const genAI = env.GEMINI_API_KEY ? new GoogleGenerativeAI(env.GEMINI_API_KEY) : null;

const SYSTEM_PROMPT = `
You are a Senior Creative Director for Digital Atelier — an AI-powered product photography platform for Indian fashion and lifestyle sellers.

Your role is to generate a concise Creative Director's Brief (3–5 sentences max) that supplements the AI image generation prompt. You receive structured product inputs and return styling directives that enhance detail, mood, and commercial quality.

PLATFORM CONTEXT:
- Output goes to RunComfy (ComfyUI) workflows, not Stable Diffusion XL.
- Target marketplaces: Meesho · Myntra · Amazon India · Ajio · Nykaa · Flipkart
- Images must be marketplace-ready: clean, sharp, commercially viable.

HUBS AND FOCUS AREAS:
- Apparel: Fabric physics (silk/chiffon/cotton/georgette/velvet), draping rules per garment (Saree=Nivi drape, Lehenga=full circular flare), embroidery and print fidelity.
- Jewellery: Metal tone accuracy (Gold=3200K warm, Silver=5500K cool), stone colour exactness (Emerald≠jade, Ruby≠garnet), genre-appropriate backdrop (Bridal=mandap, Traditional=deep red/ivory).
- Accessories: Material exactness (Black leather≠dark brown), hardware precision, Watch time=10:10, structured bag shape retention.
- Products: Label legibility at full resolution, no colour drift, family-appropriate setting (Beauty=white marble, Handicrafts=jute/wood).

RULES:
1. Return ONLY the brief — no preamble, no bullet headers, no markdown.
2. Max 5 sentences. Focus on what the AI needs to get right visually.
3. Reinforce critical rules for the hub (e.g., "no garment colour drift", "label must be legible").
4. If aiNotes are provided, incorporate them into the brief naturally.
5. Do not invent product details not present in the input.
`.trim();

function buildHubContext(inputs: PromptInputs): string {
  const base = `Hub: ${inputs.hub}. Background: ${inputs.background ?? "White Studio"}. Style: ${inputs.outputStyle ?? "Catalog"}.`;

  switch (inputs.hub) {
    case "Apparel":
      return `${base} Segment: ${inputs.segment ?? "Ladies"}. Wear type: ${inputs.wearType ?? "Ethnic Wear"}. Product type: ${inputs.productType ?? "unspecified"}.`;
    case "Jewellery":
      return `${base} Genre: ${inputs.jewelleryGenre ?? "Fashion"}. Style: ${inputs.jewelleryStyle ?? "unspecified"}.`;
    case "Accessories":
      return `${base} Accessory type: ${inputs.accessoryType ?? "Custom"}.`;
    case "Products":
      return `${base} Product family: ${inputs.productFamily ?? "Custom"}.`;
  }
}

function buildFallback(inputs: PromptInputs): string {
  const hubContext = buildHubContext(inputs);
  return `${hubContext}${inputs.aiNotes ? ` Director notes: ${inputs.aiNotes}.` : ""}`;
}

export const geminiService = {
  async refinePrompt(inputs: PromptInputs): Promise<string> {
    if (!genAI) {
      return buildFallback(inputs);
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const userPrompt = `
Generate a Creative Director's Brief for the following product shoot:

${buildHubContext(inputs)}
${inputs.modelRefUrl ? "Model reference image: provided." : "No model reference — isolated product shot."}
${inputs.videoStyle ? `Video motion style: ${inputs.videoStyle}.` : ""}
${inputs.outputViews?.length ? `Required views: ${inputs.outputViews.join(", ")}.` : ""}
${inputs.aiNotes ? `Director's notes from client: ${inputs.aiNotes}` : ""}
${inputs.highDetail ? "High detail mode active — maximum texture and material fidelity required." : ""}
`.trim();

      const result = await model.generateContent([SYSTEM_PROMPT, userPrompt]);
      return result.response.text().trim();
    } catch (error: unknown) {
      console.error("❌ [geminiService] refinePrompt error:", error);
      return buildFallback(inputs);
    }
  },
};
