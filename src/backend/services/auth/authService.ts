// src/services/authService.ts
import dbConnect from "@/backend/lib/mongodb";
import User, { IUser } from "@/backend/models/User";

/**
 * Service to handle profile-related MongoDB queries.
 * Authentication logic is handled by NextAuth.
 */
export const authService = {
  /**
   * Fetch a user's profile from MongoDB.
   */
  async getUserProfile(userId: string): Promise<IUser | null> {
    try {
      await dbConnect();
      const user = await User.findById(userId).lean();
      return user as IUser;
    } catch (error) {
      console.error("❌ [authService] getUserProfile Error:", error);
      return null;
    }
  },

  /**
   * Update a user's profile data in MongoDB.
   */
  async updateUserProfile(userId: string, data: Partial<IUser>) {
    try {
      await dbConnect();
      await User.findByIdAndUpdate(userId, data);
      return { success: true };
    } catch (error: any) {
      console.error("❌ [authService] updateUserProfile Error:", error);
      return { success: false, error: error.message };
    }
  }
};
