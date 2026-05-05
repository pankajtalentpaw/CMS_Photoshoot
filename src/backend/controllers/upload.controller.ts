import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { env } from "@/shared/config/env";
import { s3Service } from "@/backend/services/s3Service";

function hasS3Config() {
  return Boolean(env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY && env.S3_REGION && env.S3_BUCKET_NAME);
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
        const s3Url = await s3Service.uploadBuffer(buffer, file.name, file.type, userId);
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
