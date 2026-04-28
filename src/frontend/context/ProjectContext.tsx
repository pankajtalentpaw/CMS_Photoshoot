"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ProjectState {
  garmentImageUrl?: string;
  productImageUrl?: string;
  modelImageUrl?: string;
  modelId?: string;
  backgroundId?: string;
  styleId?: string;
  prompt?: string;
  primeImage?: string;
  outputViews?: string[];
  selectedOutputViews?: string[];
  generatedViewLabels?: string[];
  isCustomViewEnabled?: boolean;
  customViewPrompt?: string;
  videoStyle?: string;
  videoPrompt?: string;
  videoUrl?: string;
  approvedPrime?: boolean;
  finalVideo?: string;
}

const CREDITS_KEY = "saas_credits";
const PROJECT_KEY = "saas_current_project";

function readInitialCredits() {
  if (typeof window === "undefined") {
    return 250;
  }

  const savedCredits = localStorage.getItem(CREDITS_KEY);
  if (!savedCredits) {
    return 250;
  }

  const parsedCredits = Number.parseInt(savedCredits, 10);
  return Number.isNaN(parsedCredits) ? 250 : parsedCredits;
}

function readInitialProject(): ProjectState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedProject = localStorage.getItem(PROJECT_KEY);
  if (!savedProject) {
    return null;
  }

  try {
    return JSON.parse(savedProject) as ProjectState;
  } catch {
    return null;
  }
}

interface ProjectContextType {
  credits: number;
  spendCredits: (amount: number) => boolean;
  currentProject: ProjectState | null;
  setProjectData: (data: ProjectState | null) => void;
  updateProject: (partial: Partial<ProjectState>) => void;
  resetProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState(readInitialCredits);
  const [currentProject, setCurrentProject] = useState<ProjectState | null>(readInitialProject);

  useEffect(() => {
    localStorage.setItem(CREDITS_KEY, credits.toString());
  }, [credits]);

  useEffect(() => {
    if (currentProject) {
      localStorage.setItem(PROJECT_KEY, JSON.stringify(currentProject));
      return;
    }

    localStorage.removeItem(PROJECT_KEY);
  }, [currentProject]);

  const spendCredits = (amount: number) => {
    if (credits >= amount) {
      setCredits((prev) => prev - amount);
      return true;
    }
    return false;
  };

  const setProjectData = (data: ProjectState | null) => {
    setCurrentProject(data);
  };

  const updateProject = (partial: Partial<ProjectState>) => {
    setCurrentProject((prev: ProjectState | null) => ({ ...(prev ?? {}), ...(partial ?? {}) }));
  };

  const resetProject = () => {
    setCurrentProject(null);
  };

  return (
    <ProjectContext.Provider value={{ credits, spendCredits, currentProject, setProjectData, updateProject, resetProject }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
