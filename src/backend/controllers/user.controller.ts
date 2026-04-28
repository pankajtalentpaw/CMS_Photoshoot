import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { authService } from "@/backend/services/auth/authService";
import connectDB from "@/backend/lib/mongodb";
import User from "@/backend/models/User";

export const UserController = {
  async getProfile() {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });  
      }

      const userId = session.user.id;
      const profile = await authService.getUserProfile(userId);

      if (!profile) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: profile });
    } catch (error: unknown) {
      console.error("❌ [/api/user/profile] Error:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  },

  async updateProfile(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });  
      }

      const userId = session.user.id;
      const body = await req.json();

      await connectDB();

      // Fields allowed to be updated
      const updateData = {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        workStatus: body.workStatus,
        organizationName: body.organizationName,
        state: body.state,
        city: body.city,
      };

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true }
      ).select("-password");

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: unknown) {
      console.error("❌ [API Update User] Error:", error);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
  }
};
