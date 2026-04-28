// src/app/apparel/[segment]/[style]/upload/page.tsx
"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { Skeleton } from "@/frontend/components/ui/Skeleton";
import ProductTag from "@/frontend/components/ProductTag";

// Services & Context
import { useAuth } from "@/frontend/context/AuthContext";
import { useGeneration } from "@/frontend/context/GenerationContext";
import { useProject } from "@/frontend/context/ProjectContext";
import { storageService } from "@/backend/services/storageService";

// Dynamic components
const UploadZone = dynamic(() => import("@/frontend/components/UploadZone"), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[240px] rounded-2xl" /> 
});
const ModelScroll = dynamic(() => import("@/frontend/components/ModelScroll"), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[170px] rounded-xl" /> 
});
const BackgroundGrid = dynamic(() => import("@/frontend/components/BackgroundGrid"), { 
  ssr: false, 
  loading: () => <div className="grid grid-cols-2 gap-4"><Skeleton className="h-[100px]" /><Skeleton className="h-[100px]" /></div> 
});
const AIDirectorNotes = dynamic(() => import("@/frontend/components/AIDirectorNotes"), { ssr: false });
const SelectionPreviewModal = dynamic(() => import("@/frontend/components/SelectionPreviewModal"), { ssr: false });

export default function UnifiedUploadSetupPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { updateProject } = useProject();
  const { 
    selectionState, 
    updateSelection, 
    rawFile, 
    setRawFile, 
    setUploadedImageUrl 
  } = useGeneration();

  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "ethnic-wear";

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selection states (for shorthand/readability)
  const { modelId, backgroundId, styleId, prompt, productCategory } = selectionState;
  
  // Preview States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedModelImage, setSelectedModelImage] = useState<string | null>(null);

  const outputStyles = ["Catalog", "Premium", "Social Media", "Lifestyle"];

  const handleModelSelect = (model: { id: string; image: string }) => {
    const isSameModel = modelId === model.id;
    updateSelection({ modelId: isSameModel ? null : model.id });
    setSelectedModelImage(isSameModel ? null : model.image);
  };

  const handleModelPreview = (model: { id: string; image: string }) => {
    setPreviewImage(model.image);
    setIsPreviewOpen(true);
  };

  const handleBackgroundSelect = (bg: { title: string; image: string }) => {
    updateSelection({ backgroundId: backgroundId === bg.title ? null : bg.title });
  };

  const handleBackgroundPreview = (bg: { title: string; image: string }) => {
    setPreviewImage(bg.image);
    setIsPreviewOpen(true);
  };

  // Category-specific model mapping
  const getFilteredModels = () => {
    if (productCategory === "Saree") {
      return Array.from({ length: 9 }, (_, i) => ({
        id: `saree-${i + 1}`,
        image: `/assets/ladies/ethnic-wear/saree-modal/saaree_Model${i + 1}.jpg`
      }));
    }
    if (productCategory === "Kurti") {
      return Array.from({ length: 7 }, (_, i) => ({
        id: `kurti-${i + 1}`,
        image: `/assets/ladies/ethnic-wear/kurti-modal/kurti_modal${i + 1}.jpg`
      }));
    }
    return []; // Fallback to default models in ModelScroll component
  };

  const filteredModels = getFilteredModels();

  const resolveModelImage = () => {
    if (selectedModelImage) {
      return selectedModelImage;
    }

    if (!modelId) {
      return null;
    }

    const fromFiltered = filteredModels.find((model) => model.id === modelId)?.image;
    if (fromFiltered) {
      return fromFiltered;
    }

    const numericId = Number.parseInt(modelId, 10);
    if (!Number.isNaN(numericId)) {
      return `/Model_${numericId}.jpg`;
    }

    return null;
  };

  const handleGenerate = async () => {
    if (!user) {
      setError("Please sign in to generate images.");
      return;
    }
    if (!rawFile || !modelId || !backgroundId || !styleId) {
      setError("Please complete all selections including an image.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 1. Upload Image to Storage
      const imageUrl = await storageService.uploadGarment(user.id, rawFile);
      setUploadedImageUrl(imageUrl);

      // 2. Persist project setup for approve-prime generation step.
      updateProject({
        garmentImageUrl: imageUrl,
        productImageUrl: imageUrl,
        modelId: modelId || undefined,
        modelImageUrl: resolveModelImage() || undefined,
        backgroundId: backgroundId || undefined,
        styleId: styleId || undefined,
        prompt: prompt || "",
        primeImage: undefined,
        outputViews: [],
        selectedOutputViews: [],
        generatedViewLabels: [],
        isCustomViewEnabled: false,
        customViewPrompt: "",
        videoStyle: undefined,
        videoPrompt: "",
        videoUrl: undefined,
        approvedPrime: false,
      });

      // 3. Continue to generated-result screen where polling/render happens.
      router.push(`/apparel/${segment}/${style}/approve-prime`);

    } catch (err: unknown) {
      console.error("❌ [Generate Flow] Error:", err);
      const message = err instanceof Error ? err.message : "Failed to start generation. Try again.";
      setError(message);
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Upload Product" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={5} />

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-12 mt-10 mb-20">
          {/* 1. Upload Product Image Section */}
          <section aria-labelledby="upload-section-title">
            <div className="mb-6">
              <h1 id="upload-section-title" className="font-roboto font-semibold text-2xl text-white mb-2">Upload Product</h1>
              <p className="text-sm text-[#99A1AF]">Upload a clear photo of your product (Must be {style}).</p>
            </div>
            <UploadZone onFileSelect={(file) => setRawFile(file)} />
          </section>

          {/* 2. Select Model Section */}
          <section aria-labelledby="model-section-title">
            <h2 id="model-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Select Model</h2>
            <div className="-mx-5 px-5">
              <ModelScroll 
                selectedId={modelId} 
                onSelect={handleModelSelect} 
                onPreview={handleModelPreview}
                modelsOverride={filteredModels}
              />
            </div>
          </section>

          {/* 3. Background Style Section */}
          <section aria-labelledby="bg-section-title">
            <h2 id="bg-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Background Style</h2>
            <BackgroundGrid 
              selectedTitle={backgroundId} 
              onSelect={handleBackgroundSelect}
              onPreview={handleBackgroundPreview}
            />
          </section>

          {/* 4. Output Style Section */}
          <section aria-labelledby="output-section-title">
            <h2 id="output-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Output Style</h2>
            <div className="flex flex-wrap gap-3">
              {outputStyles.map((item) => (
                <ProductTag 
                  key={item}
                  label={item}
                  selected={styleId === item}
                  onClick={() => updateSelection({ styleId: styleId === item ? null : item })}
                />
              ))}
            </div>
          </section>

          {/* 5. AI Director Notes Section */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-roboto font-semibold text-xl text-white">AI Director Notes</h2>
              <span className="text-xs text-[#C5B6DE] uppercase tracking-wider">(Optional)</span>
            </div>
            <AIDirectorNotes 
              value={prompt} 
              onChange={(val) => updateSelection({ prompt: val })} 
            />
          </section>
        </div>

        {/* Generate Button Area */}
        <div className="mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isGenerating}
              onClick={handleGenerate}
              disabled={isGenerating || !rawFile || !modelId || !backgroundId || !styleId}
              className="w-full h-[61px] text-[18px]"
            >
              {isGenerating ? "Generation Started..." : "Generate Prime Image"}
            </LoadingActionButton>
          </div>
        </div>
      </main>

      <Footer />

      <SelectionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        image={previewImage}
      />
    </div>
  );
}
