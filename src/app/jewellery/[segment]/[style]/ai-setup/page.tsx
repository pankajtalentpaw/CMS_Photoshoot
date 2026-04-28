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

// Dynamic components
const ModelScroll = dynamic(() => import("@/frontend/components/ModelScroll"), { 
  ssr: false, 
  loading: () => <Skeleton className="w-full h-[200px] rounded-xl" /> 
});
const BackgroundGrid = dynamic(() => import("@/frontend/components/BackgroundGrid"), { 
  ssr: false, 
  loading: () => <div className="grid grid-cols-2 gap-4"><Skeleton className="h-[120px]" /><Skeleton className="h-[120px]" /></div> 
});
const SelectionPreviewModal = dynamic(() => import("@/frontend/components/SelectionPreviewModal"), { ssr: false });
const AIDirectorNotes = dynamic(() => import("@/frontend/components/AIDirectorNotes"), { ssr: false });

export default function JewelleryAISetupPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const [isContinuing, setIsContinuing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(null);

  // Selection Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleModelSelect = (model: { id: string; image: string }) => {
    setSelectedModel(prev => prev === model.id ? null : model.id);
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
    if (!selectedModel || !selectedBackground) return;
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push(`/jewellery/${segment}/${style}/approve-prime`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="AI Setup" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={5} />

        <section className="mt-8 mb-10">
          <motion.h1 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-roboto font-semibold text-3xl text-[#E2E2E8]"
          >
            Editorial Setup
          </motion.h1>
          <p className="text-[#C2C6D6] mt-2">
            Select the model and atmosphere for your jewellery shoot.
          </p>
        </section>

        <div className="flex flex-col gap-12 mb-20">
          <section>
            <h2 className="font-roboto font-semibold text-xl text-white mb-6">Select Model</h2>
            <div className="-mx-5 px-5">
              <ModelScroll 
                selectedId={selectedModel} 
                onSelect={handleModelSelect} 
                onPreview={handleModelPreview}
              />
            </div>
          </section>

          <section>
            <h2 className="font-roboto font-semibold text-xl text-white mb-6">Environment</h2>
            <BackgroundGrid 
              selectedTitle={selectedBackground} 
              onSelect={handleBackgroundSelect}
              onPreview={handleBackgroundPreview}
            />
          </section>

          <section>
            <h2 className="font-roboto font-semibold text-xl text-white mb-4">Production Notes</h2>
            <AIDirectorNotes />
          </section>
        </div>

        <div className="mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isContinuing}
              onClick={handleGenerate}
              disabled={isContinuing || !selectedModel || !selectedBackground}
              className="w-full h-[61px]"
            >
              Generate Jewelry Asset
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
