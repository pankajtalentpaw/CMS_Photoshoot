"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/frontend/context/AuthContext";
import { ProjectProvider } from "@/frontend/context/ProjectContext";
import { GenerationProvider } from "@/frontend/context/GenerationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <ProjectProvider>
          <GenerationProvider>
            {children}
          </GenerationProvider>
        </ProjectProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
