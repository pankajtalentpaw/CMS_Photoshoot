import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { runComfyService } from "@/backend/services/ai/runComfyService";
import { generationService } from "@/backend/services/generationService";

type LeanJob = {
  _id: unknown;
  userId: string;
  status: string;
  requestId?: string;
  inputImage?: string;
  outputImage?: string;
  outputImages?: string[];
  approved?: boolean;
  error?: string;
  [key: string]: unknown;
};

function normalizeImages(job: LeanJob) {
  const multi = Array.isArray(job.outputImages)
    ? job.outputImages.filter(Boolean)
    : [];
  const images = multi.length ? multi : job.outputImage ? [job.outputImage] : [];
  return { outputImage: images[0] ?? null, outputImages: images };
}

function isReferenceUrl(url: string) {
  return /(input|garment|cloth|mask|source|reference|upload)/i.test(url);
}

export const StatusController = {
  async handleStatus(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const jobId = searchParams.get("jobId");

      if (!jobId) {
        return NextResponse.json(
          { success: false, error: "Job ID is required" },
          { status: 400 }
        );
      }

      const job = (await generationService.getJob(jobId)) as LeanJob | null;
      if (!job) {
        return NextResponse.json(
          { success: false, error: "Job not found" },
          { status: 404 }
        );
      }

      // Return immediately if already in a terminal state
      if (job.status === "completed" || job.status === "failed") {
        const { outputImage, outputImages } = normalizeImages(job);
        return NextResponse.json({
          success: true,
          ...job,
          outputImage,
          outputImages,
        });
      }

      // Poll RunComfy for live status
      if (!job.requestId) {
        return NextResponse.json({ success: true, ...job });
      }

      const runComfyData = await runComfyService.checkStatus(job.requestId);

      if (runComfyData.status === "completed") {
        const rawImages: string[] = Array.isArray(
          (runComfyData as { outputImages?: string[] }).outputImages
        )
          ? ((runComfyData as { outputImages?: string[] }).outputImages ?? [])
          : [];

        const filtered = rawImages.filter(
          (url) =>
            typeof url === "string" &&
            url !== job.inputImage &&
            !isReferenceUrl(url)
        );

        const outputImages = filtered.length
          ? filtered
          : runComfyData.outputImage
            ? [runComfyData.outputImage]
            : [];

        const outputImage = outputImages[0] ?? null;

        if (!outputImage) {
          const noOutputError =
            runComfyData.error ?? "Generation completed but no output image was returned";
          await generationService.refundJob(jobId, noOutputError);
          return NextResponse.json({
            success: true,
            ...job,
            status: "failed",
            error: noOutputError,
          });
        }

        await generationService.updateJob(jobId, {
          status: "completed",
          outputImage,
          outputImages,
        } as never);

        return NextResponse.json({
          success: true,
          ...job,
          status: "completed",
          outputImage,
          outputImages,
        });
      }

      if (runComfyData.status === "failed") {
        const runComfyError = runComfyData.error ?? "Generation failed";
        await generationService.refundJob(jobId, runComfyError);
        return NextResponse.json({
          success: true,
          ...job,
          status: "failed",
          error: runComfyError,
        });
      }

      return NextResponse.json({ success: true, ...job, status: "processing" });
    } catch (error: unknown) {
      console.error("❌ [API/Status] Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  },
};

// ── APPROVE CONTROLLER ────────────────────────────────────────────
// Handles APPROVE_AND_CONTINUE — marks a completed job as approved
// so video generation is unlocked (spec Section 4 / Section 5).

export const ApproveController = {
  async handleApprove(request: Request) {
    try {
      const session = await getServerSession(authOptions);

      const { jobId } = (await request.json()) as { jobId?: string };
      if (!jobId) {
        return NextResponse.json(
          { success: false, error: "jobId is required" },
          { status: 400 }
        );
      }

      const job = (await generationService.getJob(jobId)) as LeanJob | null;
      if (!job) {
        return NextResponse.json(
          { success: false, error: "Job not found" },
          { status: 404 }
        );
      }

      // Only the job owner (or guests) can approve
      const userId = session?.user?.id ?? "guest-user";
      if (job.userId !== userId && job.userId !== "guest-user") {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }

      await generationService.approveJob(jobId);

      return NextResponse.json({ success: true, jobId, approved: true });
    } catch (error: unknown) {
      console.error("❌ [API/Approve] Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  },
};
