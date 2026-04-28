import dbConnect from "@/backend/lib/mongodb";
import Generation, { IGeneration, GenerationStatus } from "@/backend/models/Generation";
import User from "@/backend/models/User";

type GenerationPayload = {
  inputImage: string;
  modelId: string;
  background: string;
  outputStyle: string;
  prompt: string;
  creditsCost?: number;
};

function shouldEnforceCredits() {
  const disableCreditCheck = String(process.env.DISABLE_CREDIT_CHECK || "").toLowerCase() === "true";

  if (disableCreditCheck) {
    return false;
  }

  // Keep local/dev pipelines unblocked unless explicitly enabled.
  return process.env.NODE_ENV === "production";
}

export const generationService = {
  /**
   * Creates a new generation job record in MongoDB.
   * Deducts credits from the user profile.
   */
  async createJob(userId: string, data: GenerationPayload) {
    await dbConnect();
    
    // 1. Deduct Credits (Secured on Backend)
    const cost = data.creditsCost || 10;
    const user = userId !== "guest-user" ? await User.findById(userId) : null;

    if (shouldEnforceCredits() && userId !== "guest-user") {
      if (!user || user.credits < cost) {
        throw new Error("Insufficient credits");
      }
      user.credits -= cost;
      await user.save();
    }

    // 2. Create Job
    const job = await Generation.create({
      userId,
      ...data,
      status: "pending",
    });

    return job._id.toString();
  },

  /**
   * Updates a job's status and output.
   */
  async updateJob(jobId: string, updates: Partial<IGeneration>) {
    await dbConnect();
    await Generation.findByIdAndUpdate(jobId, updates, { new: true });
  },

  /**
   * Fetches a single job.
   */
  async getJob(jobId: string) {
    await dbConnect();
    return await Generation.findById(jobId).lean();
  },

  /**
   * Refund credits for a failed job.
   */
  async refundJob(jobId: string, errorMessage?: string) {
    await dbConnect();
    const job = await Generation.findById(jobId);
    if (!job || job.status === "failed") return; // Prevent double refund

    const finalError = errorMessage || "Generation failed.";

    if (!shouldEnforceCredits()) {
      job.status = "failed";
      job.error = finalError;
      await job.save();
      return;
    }

    const user = job.userId !== "guest-user" ? await User.findById(job.userId) : null;
    if (user) {
      user.credits += 10; // Assuming 10 is cost
      await user.save();
    }

    job.status = "failed";
    job.error = `${finalError} Credits refunded.`;
    await job.save();
  }
};
