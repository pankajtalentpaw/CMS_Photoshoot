// src/context/GenerationContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SelectionState {
  modelId: string | null;
  backgroundId: string | null;
  styleId: string | null;
  productCategory: string | null;
  prompt: string;
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
  resetGeneration: () => void;
}

const GenerationContext = createContext<GenerationContextType | undefined>(undefined);

const STORAGE_KEY = "digital_atelier_generation_state";

export const GenerationProvider = ({ children }: { children: ReactNode }) => {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    modelId: null,
    backgroundId: null,
    styleId: null,
    productCategory: null,
    prompt: "",
  });

  const [isInitialized, setIsInitialized] = useState(false);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // 1. Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSelectionState(JSON.parse(saved));
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
    setSelectionState({
      modelId: null,
      backgroundId: null,
      styleId: null,
      productCategory: null,
      prompt: "",
    });
    setRawFile(null);
    setUploadedImageUrl(null);
    setCurrentJobId(null);
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
