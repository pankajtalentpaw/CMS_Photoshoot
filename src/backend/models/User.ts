import mongoose, { Schema, Document } from "mongoose";
import { IUser as IUserBase } from "@/shared/types";

// IUserDocument extends the plain IUser (safe for clients) with mongoose.Document
export interface IUser extends IUserBase, Document {}

// Re-export so server-side code can still import IUser from this file
export type { IUserBase as IUserPlain };

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Optional for Social Login in future
  phoneNumber: { type: String, default: "" },
  workStatus: { type: String, default: "" },
  organizationName: { type: String, default: "" },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
  credits: { type: Number, default: 100 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
