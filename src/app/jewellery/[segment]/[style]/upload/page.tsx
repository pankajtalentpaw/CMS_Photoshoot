"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
import { motion } from "framer-motion";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { Skeleton } from "@/frontend/components/ui/Skeleton";
import ProductTag from "@/frontend/components/ProductTag";
import { useProject } from "@/frontend/context/ProjectContext";
import { storageService } from "@/backend/services/storageService";
import { useSession } from "next-auth/react";

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

export default function JewelleryUnifiedSetupPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const { updateProject } = useProject();
  const { data: session } = useSession();

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedModelImg, setSelectedModelImg] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);
  const [selectedOutputStyle, setSelectedOutputStyle] = useState<string | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  
  // Selection Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const outputStyles = ["Catalog", "Premium", "Social Media", "Lifestyle"];

  const handleModelSelect = (model: { id: string; image: string }) => {
    if (selectedModel === model.id) {
      setSelectedModel(null);
      setSelectedModelImg(null);
    } else {
      setSelectedModel(model.id);
      setSelectedModelImg(model.image);
    }
  };

  const handleModelPreview = (model: { id: string; image: string }) => {
    setPreviewImage(model.image);
    setIsPreviewOpen(true);
  };

  const handleBackgroundSelect = (bg: { title: string; image: string }) => {
    setSelectedBackground(prev => prev === bg.title ? null : bg.title);
  };

  const handleBackgroundPreview = (bg: { title: string; image: string }) => {
    setPreviewImage(bg.image);
    setIsPreviewOpen(true);
  };

  const handleGenerate = async () => {
    if (!selectedModel || !selectedBackground || !selectedOutputStyle || !productFile) return;
    setIsGenerating(true);
    
    try {
      const userId = session?.user?.id ?? "guest-user";
      
      // 1. Upload the product image
      const productUrl = await storageService.uploadGarment(userId, productFile);
      
      // 2. Prepare the model URL (convert relative to absolute if needed)
      // 3. Update the project context
      updateProject({
        productImageUrl: productUrl,
        garmentImageUrl: productUrl,
        modelImageUrl: selectedModelImg || "",
        modelId: selectedModel,
        backgroundId: selectedBackground,
        styleId: selectedOutputStyle,
      });

      // 4. Navigate to approve-prime
      router.push(`/jewellery/${segment}/${style}/approve-prime`);
    } catch (error) {
      console.error("Failed to generate jewellery asset:", error);
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Upload Product" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={1} partialStep={true} />

        <div className="flex flex-col gap-12 mt-10 mb-20">
          {/* 1. Upload Product Image */}
          <section aria-labelledby="upload-section-title" className="mb-2">
            <UploadZone onFileSelect={setProductFile} />
          </section>

          {/* 2. Select Model */}
          <section aria-labelledby="model-section-title">
            <h2 id="model-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Select Model</h2>
            <div className="-mx-5 px-5">
              <ModelScroll 
                selectedId={selectedModel} 
                onSelect={handleModelSelect} 
                onPreview={handleModelPreview}
              />
            </div>
          </section>

          {/* 3. Background Style */}
          <section aria-labelledby="env-section-title">
            <h2 id="env-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Background Style</h2>
            <BackgroundGrid 
              selectedTitle={selectedBackground} 
              onSelect={handleBackgroundSelect}
              onPreview={handleBackgroundPreview}
            />
          </section>

          {/* 4. Output Style */}
          <section aria-labelledby="output-section-title">
            <h2 id="output-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Output Style</h2>
            <div className="flex flex-wrap gap-3">
              {outputStyles.map((item) => (
                <ProductTag 
                  key={item}
                  label={item}
                  selected={selectedOutputStyle === item}
                  onClick={() => setSelectedOutputStyle(prev => prev === item ? null : item)}
                />
              ))}
            </div>
          </section>

          {/* 5. AI Notes */}
          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-roboto font-semibold text-xl text-white">AI Director Notes</h2>
              <span className="text-sm text-[#C5B6DE] tracking-tight">(Optional)</span>
            </div>
            <AIDirectorNotes />
          </section>
        </div>

        <div className="mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isGenerating}
              onClick={handleGenerate}
              disabled={isGenerating || !selectedModel || !selectedBackground || !selectedOutputStyle || !productFile}
              className="w-full h-[61px] text-[18px]"
            >
              Generate Image
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
