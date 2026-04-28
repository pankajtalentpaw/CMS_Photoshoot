"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { IUser } from "@/shared/types";

type SignupPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  workStatus: string;
  organizationName: string;
  state: string;
  city: string;
  message?: string;
};

type ProfileUpdatePayload = Partial<
  Pick<IUser, "firstName" | "lastName" | "email" | "phoneNumber" | "workStatus" | "organizationName" | "state" | "city">
>;

interface AuthContextType {
  user: { id: string; email?: string | null; firstName?: string; lastName?: string; name?: string | null } | null;
  userProfile: IUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: ProfileUpdatePayload) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<IUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setLoadingProfile(true);
      fetch("/api/user/profile")
        .then((res) => res.json())
        .then((data) => {
          setUserProfile(data.user ?? null);
        })
        .catch(() => setUserProfile(null))
        .finally(() => setLoadingProfile(false));
    } else {
      setUserProfile(null);
    }
  }, [session, status]);

  const login = async (email: string, password: string) => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: result.error };
    }
    return { success: true };
  };

  const signup = async (data: SignupPayload) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error };
      
      // Auto-login after signup
      return await login(data.email, data.password);
    } catch (_err: unknown) {
      return { success: false, error: "Registration failed" };
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
  };

  const updateProfile = async (data: ProfileUpdatePayload) => {
    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) return { success: false, error: result.error };
      
      setUserProfile(result.user);
      return { success: true };
    } catch (_err: unknown) {
      return { success: false, error: "Failed to update profile" };
    }
  };

  const value = {
    user: session?.user ?? null,
    userProfile,
    loading: status === "loading" || loadingProfile,
    isAuthenticated: status === "authenticated",
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
