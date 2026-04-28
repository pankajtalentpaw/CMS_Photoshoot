/**
 * Shared plain-object type for a User profile.
 * This file has NO mongoose import, making it safe to use in Client Components.
 * Note: _id is intentionally omitted here; mongoose.Document provides it server-side.
 */
export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phoneNumber: string;
  workStatus: string;
  organizationName: string;
  state: string;
  city: string;
  credits: number;
  createdAt: Date | string;
}
