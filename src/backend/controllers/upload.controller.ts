import { NextResponse } from "next/server"; // AWS SDK types should be available after npm install

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { s3Client, S3_BUCKET_NAME } from "@/shared/config/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@/shared/config/env";

function hasS3Config() {
  return Boolean(env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_REGION && env.S3_BUCKET_NAME);
}

async function uploadToS3(buffer: Buffer, userId: string, fileName: string, contentType: string) {
  const key = `ecom-hub/user-${userId}/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL: "public-read", // Uncomment if your bucket requires explicit public-read ACL
  });

  await s3Client.send(command);

  // Construct the S3 URL (assuming standard S3 URL structure)
  return `https://${S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com/${key}`;
}

function normalizeUploadError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Upload failed";
}

export const UploadController = {
  async handleUpload(request: Request) {
    try {
      const session = await getServerSession(authOptions);
      const userId = session?.user?.id ?? "guest-user";

      const formData = await request.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be less than 10MB" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (!hasS3Config()) {
        return NextResponse.json(
          {
            success: false,
            error: "AWS S3 is not configured. Set S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_REGION, and S3_BUCKET_NAME in .env.",
          },
          { status: 500 }
        );
      }

      try {
        const s3Url = await uploadToS3(buffer, userId, file.name, file.type);
        return NextResponse.json({ success: true, url: s3Url, provider: "s3" });
      } catch (s3Error) {
        const message = normalizeUploadError(s3Error);
        console.error("❌ [API/Upload] S3 Error:", message);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
      }
    } catch (error: unknown) {
      const message = normalizeUploadError(error);
      console.error("❌ [API/Upload] Error:", message);
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
};
