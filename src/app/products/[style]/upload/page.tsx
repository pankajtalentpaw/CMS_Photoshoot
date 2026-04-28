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
const BackgroundGrid = dynamic(() => import("@/frontend/components/BackgroundGrid"), { 
  ssr: false, 
  loading: () => <div className="grid grid-cols-2 gap-4"><Skeleton className="h-[100px]" /><Skeleton className="h-[100px]" /></div> 
});
const AIDirectorNotes = dynamic(() => import("@/frontend/components/AIDirectorNotes"), { ssr: false });
const SelectionPreviewModal = dynamic(() => import("@/frontend/components/SelectionPreviewModal"), { ssr: false });

export default function ProductsUnifiedSetupPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const style = (params.style as string) || "home";
  const product = searchParams.get("product") || "Vase";

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState<string>("Premium Studio");
  const [selectedOutputStyle, setSelectedOutputStyle] = useState<string>("Catalog");

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const outputStyles = ["Catalog", "Premium", "Lifestyle", "Commercial"];

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    router.push(`/products/${style}/approve-prime?product=${product}`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Production Setup" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={5} />

        <div className="flex flex-col gap-12 mt-10 mb-20">
          {/* Section 6.5: Upload + Preset Selection */}
          <section aria-labelledby="upload-section-title">
            <div className="mb-6">
              <h1 id="upload-section-title" className="font-roboto font-semibold text-2xl text-white mb-2 capitalize">{product} Setup</h1>
              <p className="text-sm text-[#99A1AF]">Upload your product for {style} shoot</p>
            </div>
            <UploadZone />
          </section>

          {/* Model is optional for Products, usually only for Lifestyle. For V1 we skip ModelScroll for Products unless it's a model-based scene. */}
          {/* We'll skip ModelScroll here to differentiate from Apparel/Jewellery and keep it "Compact" */}

          <section aria-labelledby="env-section-title">
            <h2 id="env-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Environment Style</h2>
            <BackgroundGrid 
              selectedTitle={selectedBackground} 
              onSelect={(bg) => setSelectedBackground(bg.title)}
              onPreview={(bg) => { setPreviewImage(bg.image); setIsPreviewOpen(true); }}
            />
          </section>

          <section aria-labelledby="output-section-title">
            <h2 id="output-section-title" className="font-roboto font-semibold text-xl text-white mb-6">Output Aesthetic</h2>
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
              <h2 className="font-roboto font-semibold text-xl text-white">AI Studio Notes</h2>
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
