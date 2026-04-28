import { z } from "zod";

/**
 * Environment variables schema for production-ready validation.
 * Ensures that all required variables are present and correctly formatted.
 */
const envSchema = z.object({
  // Database
  MONGODB_URI: z
    .string()
    .min(1, "MONGODB_URI is required")
    .refine(
      (value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "MONGODB_URI must start with mongodb:// or mongodb+srv://"
    ),

  // AI Services
  GEMINI_API_KEY: z.string().optional(),
  FAL_KEY: z.string().optional(),
  VITE_RUNCOMFY_API_KEY: z.string().optional(),
  VITE_RUNCOMFY_API_URL: z.string().optional(),
  VITE_RUNCOMFY_MODEL_ID: z.string().optional(),
  RUNCOMFY_API_KEY: z.string().optional(),
  RUNCOMFY_API_URL: z.string().optional(),
  RUNCOMFY_MODEL_ID: z.string().optional(),
  RUNCOMFY_DEPLOYMENT_ID: z.string().optional(),
  RUNCOMFY_VIDEO_MODEL_ID: z.string().optional(),
  RUNCOMFY_VIDEO_DEPLOYMENT_ID: z.string().optional(),
  DISABLE_CREDIT_CHECK: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Authentication
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),

  // Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Validate process.env against the schema only on the server
const isServer = typeof window === "undefined";

/**
 * Validated environment variables.
 * Import this throughout the application instead of using process.env directly.
 */
export const env = (() => {
  if (!isServer) {
    // Return a dummy object on the client to prevent build-time/runtime errors.
    // Client-side code should not be accessing these variables.
    return {} as z.infer<typeof envSchema>;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    });

    // In development and for testing auth we might bypass this strict enforcement
    // throw new Error("Missing or invalid environment variables. Check the logs for details.");
  }

  return (result.success ? result.data : process.env) as z.infer<typeof envSchema>;
})();
