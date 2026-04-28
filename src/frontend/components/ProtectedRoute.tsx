"use client";

// src/components/ProtectedRoute.tsx
// Wrap any page with this to require authentication.
// Shows a loading spinner while Firebase resolves auth state,
// then redirects unauthenticated users to /login.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/frontend/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect once Firebase has resolved (loading = false)
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  // While Firebase is resolving auth state — show a full-screen spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/10" />
            <div className="absolute inset-0 rounded-full border-2 border-t-[#7C4DFF] animate-spin" />
          </div>
          <p className="text-white/40 text-sm font-medium tracking-wide">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // Not authenticated — render nothing while redirect fires
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated — render the protected page
  return <>{children}</>;
}
