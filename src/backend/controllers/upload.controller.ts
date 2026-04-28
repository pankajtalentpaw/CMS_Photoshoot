import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import cloudinary from "@/shared/config/cloudinary";
import { env } from "@/shared/config/env";

type CloudinaryLikeError = {
  message?: string;
  error?: {
    message?: string;
    http_code?: number;
  };
  http_code?: number;
};

function hasCloudinaryConfig() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

function isCloudinaryConfigError(message: string) {
  return /unknown\s+api[_\s-]?key|must\s+supply\s+api[_\s-]?key|invalid\s+api[_\s-]?key/i.test(message);
}

async function uploadToCloudinary(buffer: Buffer, userId: string) {
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `ecom-hub/user-${userId}`,
        resource_type: "auto",
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error || new Error("Cloudinary upload failed"));
          return;
        }
        resolve(uploadResult as { secure_url: string });
      }
    );
    uploadStream.end(buffer);
  });

  return result.secure_url;
}

function normalizeUploadError(error: unknown): string {
  const toSafeMessage = (raw: string) => {
    const message = raw.trim();
    if (/unknown\s+api[_\s-]?key/i.test(message) || /invalid\s+api[_\s-]?key/i.test(message)) {
      return "Cloudinary credentials are invalid. Please update CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.";
    }
    if (/invalid\s+signature/i.test(message)) {
      return "Cloudinary signature validation failed. Please verify CLOUDINARY_API_SECRET in .env.";
    }
    return message;
  };

  if (error instanceof Error && error.message) {
    return toSafeMessage(error.message);
  }

  if (error && typeof error === "object") {
    const cloudinaryError = error as CloudinaryLikeError;
    if (cloudinaryError.error?.message) {
      return toSafeMessage(cloudinaryError.error.message);
    }
    if (cloudinaryError.message) {
      return toSafeMessage(cloudinaryError.message);
    }
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

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be less than 10MB" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (!hasCloudinaryConfig()) {
        return NextResponse.json(
          {
            success: false,
            error: "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env.",
          },
          { status: 500 }
        );
      }

      try {
        const cloudinaryUrl = await uploadToCloudinary(buffer, userId);
        return NextResponse.json({ success: true, url: cloudinaryUrl, provider: "cloudinary" });
      } catch (cloudinaryError) {
        const message = normalizeUploadError(cloudinaryError);
        if (isCloudinaryConfigError(message)) {
          return NextResponse.json({ success: false, error: message }, { status: 500 });
        }

        throw cloudinaryError;
      }
    } catch (error: unknown) {
      const message = normalizeUploadError(error);
      console.error("❌ [API/Upload] Error:", message);
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
};
