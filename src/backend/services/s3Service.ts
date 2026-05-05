import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client, S3_BUCKET_NAME } from "@/shared/config/s3";
import { env } from "@/shared/config/env";

export const s3Service = {
  async uploadBuffer(buffer: Buffer, fileName: string, contentType: string, userId: string = "system") {
    if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY || !env.S3_BUCKET_NAME) {
      throw new Error("S3 configuration is missing");
    }

    const key = `digital-atelier/uploads/${userId}/${Date.now()}-${fileName}`;
    
    // 1. Upload the object
    const putCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      // No ACL needed since we'll use a presigned URL for access
    });

    await s3Client.send(putCommand);

    // 2. Generate a presigned URL for GET access (valid for 1 hour)
    const getCommand = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 });
    
    console.log(`[s3Service] Presigned URL generated for ${key}`);
    return presignedUrl;
  },

  async uploadFromUrl(url: string, userId: string = "system") {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${url}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const fileName = url.split("/").pop() || "downloaded-image";

    return this.uploadBuffer(buffer, fileName, contentType, userId);
  }
};
