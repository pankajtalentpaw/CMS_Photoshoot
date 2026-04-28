"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { Skeleton } from "@/frontend/components/ui/Skeleton";
import ProductTag from "@/frontend/components/ProductTag";

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

export default function AccessoriesUnifiedSetupPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const style = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("1");
  const [selectedBackground, setSelectedBackground] = useState<string>("Premium Studio");
  const [selectedOutputStyle, setSelectedOutputStyle] = useState<string>("Catalog");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const outputStyles = ["Catalog", "Premium", "Social Media", "Lifestyle"];

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    router.push(`/accessories/${style}/approve-prime?product=${product}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="AI Setup" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={5} />

        <div className="flex flex-col gap-12 mt-10 mb-20">
          {/* Section 6.5: Upload + Preset Selection */}
          <section aria-labelledby="upload-section-title">
            <div className="mb-6">
              <h1 id="upload-section-title" className="font-roboto font-semibold text-2xl text-white mb-2 uppercase tracking-wide">{product} Setup</h1>
              <p className="text-sm text-[#99A1AF]">Upload your raw product image for {style.charAt(0).toUpperCase() + style.slice(1)}</p>
            </div>
            <UploadZone />
          </section>

          <section aria-labelledby="model-section-title">
            <h2 id="model-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Select Model / Presentation</h2>
            <div className="-mx-5 px-5">
              <ModelScroll
                selectedId={selectedModel}
                onSelect={(m) => setSelectedModel(m.id)}
                onPreview={(m) => { setPreviewImage(m.image); setIsPreviewOpen(true); }}
              />
            </div>
          </section>

          <section aria-labelledby="bg-section-title">
            <h2 id="bg-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Background Style</h2>
            <BackgroundGrid
              selectedTitle={selectedBackground}
              onSelect={(bg) => setSelectedBackground(bg.title)}
              onPreview={(bg) => { setPreviewImage(bg.image); setIsPreviewOpen(true); }}
            />
          </section>

          <section aria-labelledby="output-section-title">
            <h2 id="output-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Output Style</h2>
            <div className="flex flex-wrap gap-3">
              {outputStyles.map((item) => (
                <ProductTag
                  key={item}
                  label={item}
                  selected={selectedOutputStyle === item}
                  onClick={() => setSelectedOutputStyle(item)}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <h2 className="font-roboto font-semibold text-xl text-white">AI Director Notes</h2>
              <span className="text-xs text-[#C5B6DE] uppercase tracking-wider">(Optional)</span>
            </div>
            <AIDirectorNotes />
          </section>
        </div>

        <div className="mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isGenerating}
              onClick={handleGenerate}
              className="w-full h-[61px] text-[18px]"
            >
              Generate Prime Image
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
