import mongoose from "mongoose";
import dbConnect from "./mongodb";

let bucket: any | null = null;

/**
 * Get or initialize the GridFS bucket.
 */
async function getBucket() {
  if (bucket) return bucket;

  await dbConnect();
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("❌ [GridFS] Database connection not established.");
  }

  bucket = new mongoose.mongo.GridFSBucket(db, {
    bucketName: "images",
  });
  return bucket;
}

export const gridfs = {
  /**
   * Upload a file buffer to GridFS.
   */
  async uploadFile(buffer: Buffer, filename: string, contentType: string): Promise<string> {
    const bucket = await getBucket();
    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(filename, {
        contentType,
        metadata: { uploadedAt: new Date() },
      });

      uploadStream.on("finish", () => {
        resolve(uploadStream.id.toString());
      });

      uploadStream.on("error", (error: any) => {
        console.error("❌ [GridFS] Upload Error:", error);
        reject(error);
      });

      uploadStream.end(buffer);
    });
  },

  /**
   * Get a file stream from GridFS by ID.
   */
  async getFileStream(fileId: string) {
    const bucket = await getBucket();
    try {
      const id = new mongoose.Types.ObjectId(fileId);
      return bucket.openDownloadStream(id);
    } catch (error: any) {
      console.error("❌ [GridFS] Download Error (Invalid ID?):", error);
      throw error;
    }
  },

  /**
   * Delete a file from GridFS.
   */
  async deleteFile(fileId: string) {
    const bucket = await getBucket();
    try {
      const id = new mongoose.Types.ObjectId(fileId);
      await bucket.delete(id);
    } catch (error: any) {
      console.error("❌ [GridFS] Delete Error:", error);
      throw error;
    }
  },

  /**
   * Check if a file exists.
   */
  async fileExists(fileId: string): Promise<boolean> {
    const bucket = await getBucket();
    try {
      const id = new mongoose.Types.ObjectId(fileId);
      const files = await bucket.find({ _id: id }).toArray();
      return files.length > 0;
    } catch {
      return false;
    }
  }
};
