import { NextResponse } from "next/server";
import dbConnect from "@/backend/lib/mongodb";
import User from "@/backend/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().optional().default(""),
  workStatus: z.string().optional().default(""),
  organizationName: z.string().optional().default(""),
  state: z.string().optional().default(""),
  city: z.string().optional().default(""),
});

export const AuthController = {
  async register(request: Request) {
    try {
      const payload = await request.json();
      const parsed = registerSchema.safeParse(payload);

      if (!parsed.success) {
        return NextResponse.json({ success: false, error: "Invalid input data" }, { status: 400 });
      }

      await dbConnect();

      const { email, password, firstName, lastName, phoneNumber, workStatus, organizationName, state, city } = parsed.data;
      const normalizedEmail = email.trim().toLowerCase();

      // Check if user exists
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json({ success: false, error: "User already exists" }, { status: 409 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const newUser = await User.create({
        email: normalizedEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber,
        workStatus,
        organizationName,
        state,
        city,
        credits: 100 // Starting credits
      });

      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: {
          id: newUser._id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        }
      });

    } catch (error: unknown) {
      console.error("❌ [API/Register] Error:", error);
      const message = error instanceof Error ? error.message : "Internal Server Error";
      const isDatabaseUnavailable =
        message.toLowerCase().includes("server selection timed out") ||
        message.toLowerCase().includes("database temporarily unavailable");

      if (isDatabaseUnavailable) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Database connection is currently unavailable. Please verify MongoDB Atlas Network Access (IP allow-list) and try again.",
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  }
};
