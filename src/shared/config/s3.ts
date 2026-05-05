import { S3Client } from "@aws-sdk/client-s3"; // Configured for AWS S3

import { env } from "./env";

if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY || !env.S3_REGION) {
  console.warn("⚠️ AWS S3 configuration missing. Please add S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, and S3_REGION to your .env file.");
}

export const s3Client = new S3Client({
  region: env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: env.S3_SECRET_ACCESS_KEY || "",
  },
});

export const S3_BUCKET_NAME = env.S3_BUCKET_NAME;
