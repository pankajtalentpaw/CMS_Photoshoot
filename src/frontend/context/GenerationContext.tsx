// src/context/GenerationContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SelectionState {
  modelId: string | null;
  backgroundId: string | null;
  styleId: string | null;
  productCategory: string | null;
  prompt: string;
  // Hub-aware fields
  hub: string | null;
  segment: string | null;
  wearType: string | null;
  productType: string | null;
  jewelleryGenre: string | null;
  jewelleryStyle: string | null;
  accessoryType: string | null;
  productFamily: string | null;
  outputViews: string[];
  videoStyle: string | null;
}

interface GenerationContextType {
  selectionState: SelectionState;
  updateSelection: (updates: Partial<SelectionState>) => void;
  rawFile: File | null;
  setRawFile: (file: File | null) => void;
  uploadedImageUrl: string | null;
  setUploadedImageUrl: (url: string | null) => void;
  currentJobId: string | null;
  setCurrentJobId: (id: string | null) => void;
  approvedJobId: string | null;
  setApprovedJobId: (id: string | null) => void;
  resetGeneration: () => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

const STORAGE_KEY = "digital_atelier_generation_state";

const DEFAULT_SELECTION: SelectionState = {
  modelId: null,
  backgroundId: null,
  styleId: null,
  productCategory: null,
  prompt: "",
  hub: null,
  segment: null,
  wearType: null,
  productType: null,
  jewelleryGenre: null,
  jewelleryStyle: null,
  accessoryType: null,
  productFamily: null,
  outputViews: [],
  videoStyle: null,
};

export const GenerationProvider = ({ children }: { children: ReactNode }) => {
  const [selectionState, setSelectionState] = useState<SelectionState>(DEFAULT_SELECTION);

  const [isInitialized, setIsInitialized] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [approvedJobId, setApprovedJobId] = useState<string | null>(null);

  // 1. Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelectionState({ ...DEFAULT_SELECTION, ...JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    setIsInitialized(true);
  }, []);

  // 2. Sync state to localStorage (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectionState));
    }
  }, [selectionState, isInitialized]);

  const updateSelection = (updates: Partial<SelectionState>) => {
    setSelectionState(prev => ({ ...prev, ...updates }));
  };

  const resetGeneration = () => {
    setSelectionState(DEFAULT_SELECTION);
    setRawFile(null);
    setUploadedImageUrl(null);
    setCurrentJobId(null);
    setApprovedJobId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <GenerationContext.Provider value={{
      selectionState,
      updateSelection,
      rawFile,
      setRawFile,
      uploadedImageUrl,
      setUploadedImageUrl,
      currentJobId,
      setCurrentJobId,
      approvedJobId,
      setApprovedJobId,
      resetGeneration
    }}>
      {children}
    </GenerationContext.Provider>
  );
};

export const useGeneration = () => {
  const context = useContext(GenerationContext);
  if (context === undefined) {
    throw new Error("useGeneration must be used within a GenerationProvider");
  }
  return context;
};
