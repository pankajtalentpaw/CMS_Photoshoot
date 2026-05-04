import dbConnect from "@/backend/lib/mongodb";
import Generation, { IGeneration } from "@/backend/models/Generation";
import User from "@/backend/models/User";

type GenerationPayload = {
  inputImage: string;
  modelId: string;
  background: string;
  outputStyle: string;
  prompt: string;
  creditsCost?: number;
  // Context fields stored for gallery and pipeline
  hub?: string;
  mode?: string;
  segment?: string;
  wearType?: string;
  productType?: string;
  jewelleryGenre?: string;
  jewelleryStyle?: string;
  accessoryType?: string;
  productFamily?: string;
  videoStyle?: string;
  outputViews?: string[];
  sourceJobId?: string;
};

function shouldEnforceCredits() {
  const disableCreditCheck =
    String(process.env.DISABLE_CREDIT_CHECK || "").toLowerCase() === "true";
  if (disableCreditCheck) return false;
  return process.env.NODE_ENV === "production";
}

export const generationService = {
  async createJob(userId: string, data: GenerationPayload) {
    await dbConnect();

    const cost = data.creditsCost ?? 10;
    const user = userId !== "guest-user" ? await User.findById(userId) : null;

    if (shouldEnforceCredits() && userId !== "guest-user") {
      if (!user) {
        console.warn(`[generationService] User ${userId} not found during credit check. Proceeding as guest.`);
        // Fallback: don't block if user record is missing but session is valid
      } else {
        // Auto-replenish credits if low (Demo/Preview mode safety)
        if (user.credits < cost) {
          user.credits = Math.max(user.credits + 250, 250);
          console.log(`[generationService] Auto-replenished credits for user ${userId}. New balance: ${user.credits}`);
        }

        user.credits -= cost;
        await user.save();
      }
    }

    const job = await Generation.create({
      userId,
      ...data,
      creditsCost: cost,
      status: "pending",
      approved: false,
    });

    return job._id.toString();
  },

  async updateJob(jobId: string, updates: Partial<IGeneration>) {
    await dbConnect();
    await Generation.findByIdAndUpdate(jobId, updates, { new: true });
  },

  async getJob(jobId: string) {
    await dbConnect();
    return (await Generation.findById(jobId).lean()) as IGeneration | null;
  },

  /**
   * Mark a completed job as approved, unlocking downstream video generation.
   * Per spec Section 4: APPROVE_AND_CONTINUE requires prior GENERATE_IMAGES success.
   */
  async approveJob(jobId: string) {
    await dbConnect();
    const job = await Generation.findById(jobId);
    if (!job) throw new Error("Job not found");
    if (job.status !== "completed") {
      throw new Error("Only completed jobs can be approved");
    }
    job.approved = true;
    job.approvedAt = new Date();
    await job.save();
    return job;
  },

  /**
   * Fetch all jobs for a user, newest first — used by the gallery.
   */
  async getUserJobs(userId: string, limit = 20, skip = 0) {
    await dbConnect();
    return (await Generation.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()) as IGeneration[];
  },

  /**
   * Count completed jobs for a user, split by type.
   * Used by the profile endpoint for generation stats.
   */
  async getGenerationStats(userId: string) {
    await dbConnect();
    const [imageCount, videoCount] = await Promise.all([
      Generation.countDocuments({
        userId,
        status: "completed",
        mode: { $ne: "VIDEO_GENERATION" },
      }),
      Generation.countDocuments({
        userId,
        status: "completed",
        mode: "VIDEO_GENERATION",
      }),
    ]);
    return { imageCount, videoCount, totalCount: imageCount + videoCount };
  },

  /**
   * Validate that a job is both completed and approved.
   * Used to gate GENERATE_VIDEO (spec Section 2, Condition 3).
   */
  async getApprovedJob(jobId: string) {
    await dbConnect();
    const job = (await Generation.findById(jobId).lean()) as IGeneration | null;
    if (!job) return null;
    if (!job.approved) return null;
    if (job.status !== "completed") return null;
    return job;
  },

  /**
   * Refund credits for a failed job using the actual cost stored on the job.
   * Prevents double-refund by checking current status.
   */
  async refundJob(jobId: string, errorMessage?: string) {
    await dbConnect();
    const job = await Generation.findById(jobId);
    if (!job || job.status === "failed") return;

    const finalError = errorMessage || "Generation failed.";

    if (!shouldEnforceCredits()) {
      job.status = "failed";
      job.error = finalError;
      await job.save();
      return;
    }

    const user =
      job.userId !== "guest-user" ? await User.findById(job.userId) : null;
    if (user) {
      user.credits += job.creditsCost ?? 10;
      await user.save();
    }

    job.status = "failed";
    job.error = `${finalError} Credits refunded.`;
    await job.save();
  },
};
