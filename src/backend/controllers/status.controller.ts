import { NextResponse } from "next/server";
import { runComfyService } from "@/backend/services/ai/runComfyService";
import { generationService } from "@/backend/services/generationService";

export const StatusController = {
  async handleStatus(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const jobId = searchParams.get("jobId");

      if (!jobId) {
        return NextResponse.json({ success: false, error: "Job ID is required" }, { status: 400 });
      }

      // 1. Fetch current job from MongoDB
      const job = await generationService.getJob(jobId);
      if (!job) {
        return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
      }

      // If already finished, return immediately
      if (job.status === "completed" || job.status === "failed") {
        const existingImages = Array.isArray((job as { outputImages?: string[] }).outputImages)
          ? ((job as { outputImages?: string[] }).outputImages || []).filter(Boolean)
          : [];
        const existingImage = (job as { outputImage?: string }).outputImage;
        const normalizedImages = existingImages.length
          ? existingImages
          : existingImage
            ? [existingImage]
            : [];

        return NextResponse.json({
          ...job,
          outputImage: existingImage || normalizedImages[0] || null,
          outputImages: normalizedImages,
        });
      }

      // 2. Polling RunComfy
      if (job.requestId) {
        const runComfyData = await runComfyService.checkStatus(job.requestId);

        const runComfyOutputImages = Array.isArray((runComfyData as { outputImages?: string[] }).outputImages)
          ? ((runComfyData as { outputImages?: string[] }).outputImages || []).filter(Boolean)
          : [];

        if (runComfyData.status === "completed" && (runComfyData.outputImage || runComfyOutputImages.length > 0)) {
          const rawOutputImage = runComfyData.outputImage;
          const rawOutputImages = runComfyOutputImages.length > 0 ? runComfyOutputImages : [rawOutputImage];

          const isLikelyReference = (url: string) => {
            const token = url.toLowerCase();
            return /(input|garment|cloth|mask|source|reference|upload)/.test(token);
          };

          const outputImages = (rawOutputImages ?? []).filter(
            (url): url is string => typeof url === "string" && url !== job.inputImage && !isLikelyReference(url)
          );
          const outputImage = outputImages[0] || rawOutputImage || undefined;

          await generationService.updateJob(jobId, {
            status: "completed",
            outputImage,
            outputImages,
          });
          return NextResponse.json({
            success: true,
            ...job,
            status: "completed",
            outputImage,
            outputImages,
          });
        }

        if (runComfyData.status === "completed" && !runComfyData.outputImage) {
          const outputError = runComfyData.error || "Generation completed but no output image was returned";
          await generationService.refundJob(jobId, outputError);
          return NextResponse.json({ success: true, ...job, status: "failed", error: outputError });
        }

        if (runComfyData.status === "failed") {
          const runComfyError = runComfyData.error || "Generation failed";
          await generationService.refundJob(jobId, runComfyError);
          return NextResponse.json({ success: true, ...job, status: "failed", error: runComfyError });
        }

        return NextResponse.json({ success: true, ...job, status: "processing" });
      }

      return NextResponse.json({ success: true, ...job });

    } catch (error: unknown) {
      console.error("❌ [API/Status] Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
};
