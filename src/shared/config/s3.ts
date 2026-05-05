import { S3Client } from "@aws-sdk/client-s3"; // Configured for AWS S3

import { env } from "./env";

if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY || !env.AWS_REGION) {
  console.warn("⚠️ AWS S3 configuration missing. Please add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION to your .env file.");
}

export const s3Client = new S3Client({
  region: env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export const S3_BUCKET_NAME = env.AWS_S3_BUCKET_NAME;
