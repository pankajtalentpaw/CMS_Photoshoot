/**
 * src/services/storageService.ts
 * Rewritten to use internal API / AWS S3 instead of Cloudinary.
 */
export const storageService = {
  /**
   * Uploads an image to our internal upload API using AWS S3.
   */
  async uploadGarment(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      // userId is handled by getServerSession in the API route.
      formData.append("userId", userId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      return data.url; // S3 URL
    } catch (error: unknown) {
      console.error("❌ [storageService] uploadGarment Error:", error);
      throw error instanceof Error ? error : new Error("Upload failed");
    }
  }
};
