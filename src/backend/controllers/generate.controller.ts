import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { runComfyService } from "@/backend/services/ai/runComfyService";
import { generationService } from "@/backend/services/generationService";
import { geminiService } from "@/backend/services/ai/geminiService";
import type { PromptInputs } from "@/backend/prompts";
import { z } from "zod";



async function ensurePublicUrl(url: string | null | undefined, userId: string, baseUrl: string): Promise<string | null> {
  if (!url) return null;

  const isHttp = url.startsWith("http://") || url.startsWith("https://");
  const isLocalHost = url.includes("localhost") || url.includes("127.0.0.1");
  const isRelative = url.startsWith("/");

  // If it's already a public non-local URL, return it
  if (isHttp && !isLocalHost) return url;
  
  // If it's a relative path, construct the absolute URL
  if (isRelative) {
    return `${baseUrl}${url}`;
  }

  return url;
}

function isPublicHttpUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

const generateRequestSchema = z.object({
  userImage: z.string().nullable().optional(),
  clothImage: z.string().nullable().optional(),
  gender: z.enum(["Male", "Female", "Kids", "Man", "Woman", "Person"]).optional(),
  garmentType: z.enum(["Fabric", "Ready-made"]).optional(),
  category: z.string().min(1, "Category is required").nullable().optional(),
  style: z.string().min(1, "Style is required"),
  outputFormat: z.enum(["single", "triple", "multi-view"]).default("multi-view"),
  outputCount: z.number().int().min(1).max(8).optional(),
  notes: z.string().nullable().optional(),
  modelId: z.string().nullable().optional(),
  background: z.string().nullable().optional(),
  backgroundImageUrl: z.string().nullable().optional(),
  prompt: z.string().nullable().optional(),
  garmentImageUrl: z.string().nullable().optional(),
  modelImageUrl: z.string().nullable().optional(),
  mode: z.enum(["Virtual Try-On", "AI Studio", "VIDEO_GENERATION"]).default("Virtual Try-On"),
  userPoint: z.object({ x: z.number(), y: z.number() }).nullable().optional(),
  clothingPoint: z.object({ x: z.number(), y: z.number() }).nullable().optional(),

  // ── Master Prompt v2.0 — Hub-specific fields ──────────────────
  hub: z.enum(["Apparel", "Jewellery", "Accessories", "Products"]).optional(),
  segment: z.string().nullable().optional(),          // Apparel: Ladies | Gents | Kids
  wearType: z.string().nullable().optional(),          // Apparel: Ethnic Wear | Western Wear | Custom
  productType: z.string().nullable().optional(),       // Apparel: Saree | Kurti | etc.
  jewelleryGenre: z.string().nullable().optional(),    // Jewellery: Bridal | Fashion | etc.
  jewelleryStyle: z.string().nullable().optional(),    // Jewellery: Full Set | Choker Set | etc.
  accessoryType: z.string().nullable().optional(),     // Accessories: Bags | Footwear | etc.
  productFamily: z.string().nullable().optional(),     // Products: Home Decor | Beauty | etc.
  outputStyleV2: z.string().nullable().optional(),     // Catalog | Premium | Social Media | Lifestyle
  outputViews: z.array(z.string()).optional(),         // Front, Left, Right, etc.
  videoStyle: z.string().nullable().optional(),        // Straight Walk, Slow Turn, etc.
  // State machine: video generation must reference an approved image job
  sourceJobId: z.string().nullable().optional(),
});

export const GenerateController = {
  async handleGeneration(request: Request) {
    try {
      const session = await getServerSession(authOptions);

      const rawBody = await request.json();
      const parsed = generateRequestSchema.safeParse(rawBody);

      if (!parsed.success) {
        return NextResponse.json(
          { success: false, error: parsed.error.issues[0]?.message || "Invalid request payload" },
          { status: 400 }
        );
      }

      const {
        modelId,
        background,
        backgroundImageUrl,
        style,
        prompt,
        notes,
        garmentImageUrl,
        modelImageUrl,
        clothImage,
        userImage,
        gender,
        garmentType,
        category,
        mode,
        outputFormat,
        outputCount,
        userPoint,
        clothingPoint,
        // Hub-specific fields
        hub,
        segment,
        wearType,
        productType,
        jewelleryGenre,
        jewelleryStyle,
        accessoryType,
        productFamily,
        outputStyleV2,
        outputViews,
        videoStyle,
        sourceJobId,
      } = parsed.data;

      const normalizedGarmentImage = garmentImageUrl ?? clothImage ?? "";
      const normalizedUserImage = modelImageUrl ?? userImage ?? "";
      const normalizedPrompt = [prompt ?? "", notes ?? "", category ? `Category: ${category}` : ""].filter(Boolean).join("\n");
      const normalizedCategory = (category || "").trim();
      const normalizedGarmentType = garmentType ?? "Fabric";
      const normalizedMode =
        mode === "Virtual Try-On" && !normalizedCategory && Boolean(modelId || background)
          ? "AI Studio"
          : mode;

      const isVideo = normalizedMode === "VIDEO_GENERATION";

      console.log("[API/Generate] Request received", {
        hub: hub || "Apparel (legacy)",
        mode: normalizedMode,
        garmentType: normalizedGarmentType,
        category,
        style,
        outputFormat,
        outputCount,
        hasUserImage: Boolean(normalizedUserImage),
        hasClothingImage: Boolean(normalizedGarmentImage),
      });

      if (!normalizedGarmentImage) {
        return NextResponse.json({ success: false, error: "Garment image is required" }, { status: 400 });
      }

      if (!normalizedUserImage && normalizedMode === "Virtual Try-On") {
        return NextResponse.json({ success: false, error: "Model image is required for virtual try-on" }, { status: 400 });
      }

      if (isVideo && !videoStyle) {
        return NextResponse.json({ success: false, error: "Video style is required for video generation" }, { status: 400 });
      }

      // State machine: GENERATE_VIDEO requires a prior approved image job (APPROVE_AND_CONTINUE).
      // Spec Section 2, Condition 3: never run GENERATE_VIDEO before APPROVE_AND_CONTINUE.
      if (isVideo) {
        if (!sourceJobId) {
          return NextResponse.json(
            { success: false, error: "sourceJobId is required for video generation. Approve an image first." },
            { status: 400 }
          );
        }
        const sourceJob = await generationService.getApprovedJob(sourceJobId);
        if (!sourceJob) {
          return NextResponse.json(
            { success: false, error: "Source job not found or not yet approved. Complete APPROVE_AND_CONTINUE before generating video." },
            { status: 400 }
          );
        }
      }

      const userId = session?.user?.id ?? "guest-user";
      const host = request.headers.get("host") || "localhost:3000";
      const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
      const baseUrl = `${protocol}://${host}`;

      // Auto-resolve localhost/relative URLs to public URLs for AI accessibility
      // If auto-upload fails, it will at least return an absolute localhost URL to pass validation
      const publicGarmentImage = await ensurePublicUrl(normalizedGarmentImage, userId, baseUrl);
      const publicUserImage = await ensurePublicUrl(normalizedUserImage, userId, baseUrl);
      const publicBgImage = await ensurePublicUrl(backgroundImageUrl, userId, baseUrl);

      const finalGarmentImage = publicGarmentImage || normalizedGarmentImage;
      const finalUserImage = publicUserImage || normalizedUserImage;
      const finalBgImage = publicBgImage || backgroundImageUrl;

      const requiresCategory = normalizedMode === "Virtual Try-On" && normalizedGarmentType === "Fabric";
      if (requiresCategory && !normalizedCategory) {
        return NextResponse.json({ success: false, error: "Clothing category is required" }, { status: 400 });
      }

      if (!isPublicHttpUrl(finalGarmentImage)) {
        return NextResponse.json(
          { success: false, error: "Garment image must be a public http/https URL. Please upload again." },
          { status: 400 }
        );
      }

      if (finalUserImage && !isPublicHttpUrl(finalUserImage)) {
        return NextResponse.json(
          { success: false, error: "Model image must be a public http/https URL. Please upload again." },
          { status: 400 }
        );
      }

      // 1a. Gemini creative brief — enrich aiNotes for hub-aware runs (non-fatal)
      let enrichedNotes = normalizedPrompt;
      if (hub && !isVideo) {
        try {
          const promptInputs = {
            hub,
            mode: normalizedMode,
            productImageUrl: finalGarmentImage,
            modelRefUrl: finalUserImage || null,
            background: background ?? "White Studio",
            backgroundImageUrl: finalBgImage || null,
            outputStyle: outputStyleV2 ?? style,
            outputViews,
            aiNotes: normalizedPrompt || null,
            segment: segment ?? (gender === "Male" || gender === "Man" ? "Gents" : gender === "Kids" ? "Kids" : "Ladies"),
            wearType,
            productType: productType ?? category ?? undefined,
            jewelleryGenre,
            jewelleryStyle,
            accessoryType,
            productFamily,
          } as PromptInputs;

          const geminiBrief = await geminiService.refinePrompt(promptInputs);
          enrichedNotes = [normalizedPrompt, geminiBrief].filter(Boolean).join("\n\n");
        } catch (geminiError) {
          console.warn("[API/Generate] Gemini refinement skipped:", geminiError);
        }
      }

      // 1. Phase 1: Create record in MongoDB and deduct credits
      const jobId = await generationService.createJob(userId, {
        inputImage: finalGarmentImage,
        modelId: modelId || "custom",
        background: background ?? "default",
        outputStyle: style,
        prompt: enrichedNotes,
        creditsCost: isVideo ? 50 : 10,
        // Context stored for gallery, state machine, and pipeline traceability
        hub: hub ?? undefined,
        mode: normalizedMode as string,
        segment: segment ?? undefined,
        wearType: wearType ?? undefined,
        productType: productType ?? undefined,
        jewelleryGenre: jewelleryGenre ?? undefined,
        jewelleryStyle: jewelleryStyle ?? undefined,
        accessoryType: accessoryType ?? undefined,
        productFamily: productFamily ?? undefined,
        videoStyle: videoStyle ?? undefined,
        outputViews: outputViews ?? undefined,
        sourceJobId: sourceJobId ?? undefined,
      });

      // 2. Trigger RunComfy workflow
      let requestId: string;
      try {
        requestId = await runComfyService.triggerWorkflow({
          garmentImageUrl: finalGarmentImage,
          modelImageUrl: finalUserImage || finalGarmentImage,
          prompt: enrichedNotes,
          style,
          gender,
          garmentType: normalizedGarmentType,
          category: normalizedCategory || undefined,
          mode: normalizedMode,
          outputFormat,
          outputCount,
          background: background ?? undefined,
          backgroundImageUrl: finalBgImage ?? undefined,
          userPoint,
          clothingPoint,
          // Hub context for Master Prompt v2.0
          hub: hub ?? undefined,
          segment: segment ?? undefined,
          wearType: wearType ?? undefined,
          productType: productType ?? undefined,
          jewelleryGenre: jewelleryGenre ?? undefined,
          jewelleryStyle: jewelleryStyle ?? undefined,
          accessoryType: accessoryType ?? undefined,
          productFamily: productFamily ?? undefined,
          outputStyleV2: outputStyleV2 ?? undefined,
          outputViews,
          videoStyle: videoStyle ?? undefined,
        });
      } catch (triggerError: any) {
        console.error("❌ [API/Generate] Trigger failed:", triggerError);
        await generationService.refundJob(jobId, triggerError.message || "Failed to trigger AI workflow");
        return NextResponse.json(
          { success: false, error: triggerError.message || "Failed to start generation request" }, 
          { status: 502 }
        );
      }

      console.log("[API/Generate] Trigger response", { jobId, hasRequestId: Boolean(requestId) });

      if (!requestId) {
        await generationService.refundJob(jobId, "No requestId returned from AI service");
        return NextResponse.json({ success: false, error: "Failed to start generation request" }, { status: 502 });
      }

      // 3. Update job with RunComfy requestId
      await generationService.updateJob(jobId, { 
        requestId,
        status: "processing" 
      });

      return NextResponse.json({ 
        success: true, 
        jobId, 
        requestId 
      });

    } catch (error: unknown) {
      console.error("❌ [API/Generate] Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      const status =
        /insufficient credits/i.test(message)
          ? 402
          : /text-to-image model/i.test(message)
            ? 400
            : 500;
      return NextResponse.json({ 
        success: false,
        error: message
      }, { status });
    }
  }
};
