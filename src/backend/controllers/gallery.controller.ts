import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generationService } from "@/backend/services/generationService";
import type { IGeneration } from "@/backend/models/Generation";

// Shape returned to the frontend for each gallery item
type GalleryItem = {
  jobId: string;
  hub: string;
  mode: string;
  productType: string;
  background: string;
  outputStyle: string;
  videoStyle?: string;
  approved: boolean;
  status: string;
  // Primary display image / video URL
  outputImage: string | null;
  outputImages: string[];
  createdAt: string;
};

function toGalleryItem(job: IGeneration): GalleryItem {
  const isVideo = job.mode === "VIDEO_GENERATION";
  const images = Array.isArray(job.outputImages)
    ? job.outputImages.filter(Boolean)
    : [];
  
  // For videos, the primary output is the .mp4 file, which cannot be rendered by the <Image /> component.
  // We use the inputImage (source image) as the thumbnail/preview instead.
  const primary = isVideo 
    ? (job.inputImage ?? null) 
    : (images[0] ?? (job.outputImage ?? null));

  return {
    jobId: String((job as unknown as { _id: unknown })._id),
    hub: job.hub ?? "Apparel",
    mode: job.mode ?? "AI Studio",
    productType: job.productType ?? job.jewelleryGenre ?? job.accessoryType ?? job.productFamily ?? "",
    background: job.background,
    outputStyle: job.outputStyle,
    videoStyle: job.videoStyle,
    approved: job.approved ?? false,
    status: job.status,
    outputImage: primary,
    // Store the actual video URL in outputImages so it can be accessed for playback
    outputImages: isVideo ? (job.outputImage ? [job.outputImage] : []) : (images.length ? images : primary ? [primary] : []),
    createdAt: job.createdAt instanceof Date
      ? job.createdAt.toISOString()
      : String(job.createdAt),
  };
}

export const GalleryController = {
  async handleGetGallery(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }

      const { searchParams } = new URL(request.url);
      // type=images|videos|all  (default: all)
      const type = (searchParams.get("type") ?? "all") as "images" | "videos" | "all";
      const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
      const limit = Math.min(48, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
      const skip = (page - 1) * limit;

      const userId = session.user.id;
      const allJobs = await generationService.getUserJobs(userId, limit, skip);

      const completed = allJobs.filter((j) => j.status === "completed");

      const images = completed.filter((j) => j.mode !== "VIDEO_GENERATION");
      const videos = completed.filter((j) => j.mode === "VIDEO_GENERATION");

      let items: IGeneration[];
      if (type === "images") items = images;
      else if (type === "videos") items = videos;
      else items = completed;

      return NextResponse.json({
        success: true,
        type,
        page,
        limit,
        total: items.length,
        images: images.map(toGalleryItem),
        videos: videos.map(toGalleryItem),
        items: items.map(toGalleryItem),
      });
    } catch (error: unknown) {
      console.error("❌ [API/Gallery] Error:", error);
      const message =
        error instanceof Error ? error.message : "Internal Server Error";
      return NextResponse.json(
        { success: false, error: message },
        { status: 500 }
      );
    }
  },
};
