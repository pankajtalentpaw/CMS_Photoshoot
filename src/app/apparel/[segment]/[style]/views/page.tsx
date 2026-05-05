"use client";

import Footer from "@/frontend/components/Footer";
import { Check, Sparkles, Wand2, AlertCircle, RefreshCcw, Maximize2, X, Crosshair } from "lucide-react";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import FlowHeader from "@/frontend/components/FlowHeader";
import { TAXONOMY } from "@/registry/taxonomy";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

/**
 * Hydration-safe Wrapper
 * Ensures that client-side context state (like currentProject) 
 * doesn't cause mismatches between SSR and CSR.
 */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function SelectOutputViewsPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const { currentProject, updateProject } = useProject();
  const mounted = useMounted();
  const { status, outputImages, outputImage, error, generate, reset } = useGenerationPolling();

  const isGenerating = status === "submitting" || status === "polling";
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  const getRecommendedViews = () => {
    const viewsData = [
      { id: "front-view", title: "Front View", image: "/assets/Select Output Views/Front View.jpg" },
      { id: "left-view", title: "Left View", image: "/assets/Select Output Views/Left View.png" },
      { id: "right-view", title: "Right View", image: "/assets/Select Output Views/Right View.png" },
      { id: "close-up", title: "Close-up", image: "/assets/Select Output Views/Close-up.png" },
      { id: "detail-shot", title: "Detail Shot", image: "/assets/Select Output Views/Detail Shot.png" },
    ];
    
    return viewsData.map((view) => {
      // Prioritize real generated output if available
      const generatedImage = currentProject?.outputViews?.[currentProject?.generatedViewLabels?.indexOf(view.title) ?? -1];
      const isGenerated = !!generatedImage;

      return {
        ...view,
        previewImage: generatedImage || view.image,
        viewStyles: "object-cover transition-all duration-700",
        objectStyles: {},
        isGenerated
      };
    });
  };

  const views = getRecommendedViews();
  const [selectedViews, setSelectedViews] = useState<string[]>(
    (currentProject?.selectedOutputViews && currentProject.selectedOutputViews.length > 0)
      ? currentProject.selectedOutputViews
      : views.slice(0, 4).map((v: { id: string }) => v.id)
  );
  const [isCustomMode, setIsCustomMode] = useState(Boolean(currentProject?.isCustomViewEnabled));
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(currentProject?.customViewPrompt || "");
  const [activePreview, setActivePreview] = useState<{ title: string; image: string; styles?: React.CSSProperties } | null>(null);
  const MAX_VIEWS = 4;

  const customImage = currentProject?.outputViews?.[currentProject?.generatedViewLabels?.indexOf("Custom") ?? -1];

  const normalizeModelImageUrl = (value: string | undefined, fallback: string) => {
    if (value && (value.startsWith("http://") || value.startsWith("https://"))) {
      return value;
    }
    return fallback;
  };

  useEffect(() => {
    if (!currentProject?.primeImage) {
      router.replace(`/apparel/${segment}/${styleParam}/approve-prime`);
    }
  }, [currentProject?.primeImage, router, segment, styleParam]);

  // When generation completes, save output views to context and navigate
  useEffect(() => {
    if (isCompleted) {
      const allImages = outputImages.length > 0 ? outputImages : outputImage ? [outputImage] : [];
      const selectedTitles = views
        .filter((view: { id: string; title: string }) => selectedViews.includes(view.id))
        .map((view: { title: string }) => view.title);

      if (isCustomMode) {
        selectedTitles.push("Custom");
      }

      const generatedViewLabels = allImages.map((_, index) => selectedTitles[index] || `View ${index + 1}`);

      updateProject({
        outputViews: allImages,
        selectedOutputViews: selectedViews,
        isCustomViewEnabled: isCustomMode,
        customViewPrompt: customPrompt,
        generatedViewLabels,
      });
      // Removed automatic redirect to allow user to see outputs "yaha par" (here)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const handleGenerate = () => {
    if (!currentProject?.garmentImageUrl && !currentProject?.productImageUrl) return;
    reset();
    const totalCount = selectedViews.length + (isCustomMode ? 1 : 0);
    const garmentUrl = currentProject?.garmentImageUrl || currentProject?.productImageUrl || "";
    generate({
      garmentImageUrl: garmentUrl,
      modelImageUrl: normalizeModelImageUrl(currentProject?.modelImageUrl, garmentUrl),
      mode: "Virtual Try-On" as const,
      hub: "Apparel" as const,
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      wearType: styleParam.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      style: currentProject?.styleId || "Catalog",
      background: currentProject?.backgroundId || "White Studio",
      outputFormat: totalCount === 1 ? "single" : totalCount <= 3 ? "triple" : "multi-view",
      outputCount: Math.min(totalCount, 6),
      outputViews: isCustomMode ? [...selectedViews, "custom"] : selectedViews,
      prompt: customPrompt,
    });
  };

  const toggleView = (id: string) => {
    setSelectedViews(prev => {
      if (prev.includes(id)) return prev.filter(v => v !== id);
      const total = prev.length + (isCustomMode ? 1 : 0);
      if (total >= MAX_VIEWS) { setShowMaxWarning(true); setTimeout(() => setShowMaxWarning(false), 2000); return prev; }
      return [...prev, id];
    });
  };

  const toggleCustom = () => {
    if (!isCustomMode && selectedViews.length + 1 > MAX_VIEWS) {
      setShowMaxWarning(true); setTimeout(() => setShowMaxWarning(false), 2000); return;
    }
    setIsCustomMode(!isCustomMode);
  };

  const totalSelectedCount = selectedViews.length + (isCustomMode ? 1 : 0);

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Output Views" />
      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={3} partialStep={true} />

        {/* Generating overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-6"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <motion.div className="absolute inset-0 border-4 border-t-[#7C4DFF] rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-[#7C4DFF] animate-pulse" />
                </div>
              </div>
              <div className="text-center px-5">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Generating {totalSelectedCount} High-Fashion Views</h2>
                <p className="text-[#99A1AF] text-sm animate-pulse font-medium">Running multi-perspective render pipeline...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error banner */}
        {isFailed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 max-w-[353px] lg:max-w-[800px] mx-auto"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm font-medium">{error || "Generation failed."}</p>
            <button onClick={handleGenerate} className="ml-auto text-red-400 text-sm font-bold underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}

        <section className="mb-10 text-center flex flex-col items-center mt-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-roboto font-bold text-[32px] md:text-[42px] leading-tight tracking-[-1px] text-white mb-3 px-4">
              Select Output Views
            </h1>
            <p className="font-roboto font-normal text-[15px] leading-[22px] text-[#9CA3AF] max-w-[320px] lg:max-w-none px-4">
              Choose the outputs you want to generate for your high-fashion catalog.
            </p>
          </motion.div>
        </section>
        
        {mounted && (
          <>
            <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-10 max-w-[353px] lg:max-w-[800px] mx-auto">
          {views.map((view: { id: string; title: string; previewImage: string; viewStyles: string; objectStyles: React.CSSProperties; isGenerated: boolean }, idx: number) => {
            const isSelected = selectedViews.includes(view.id);
            return (
              <motion.div key={view.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleView(view.id)}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className={`relative w-full aspect-[4/5] rounded-[14px] p-[2px] transition-all duration-300 ${isSelected ? "bg-gradient-to-br from-[#00A3FF] to-[#D100FF] shadow-[0_0_20px_rgba(124,77,255,0.3)]" : "bg-transparent"}`}>
                  <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-[#0A0A0A] border border-white/5">
                    {mounted && view.previewImage ? (
                      <Image 
                        src={view.previewImage} 
                        alt={view.title} 
                        fill 
                        className={`${view.viewStyles} ${isSelected ? "" : "opacity-80 group-hover:opacity-100"}`} 
                        style={view.objectStyles}
                        loading="lazy" 
                        unoptimized 
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-white/10" />
                      </div>
                    )}
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePreview({ title: view.title, image: view.previewImage, styles: view.objectStyles });
                      }}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#7C4DFF] z-20"
                    >
                      <Maximize2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-[#00A3FF] to-[#D100FF] shadow-lg flex items-center justify-center z-20 border border-black/20">
                      <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                    </div>
                  )}
                </div>
                <span className={`font-roboto font-bold text-[14px] leading-[16px] transition-colors ${isSelected ? "text-white" : "text-white/80 group-hover:text-white"}`}>
                  {view.title}
                </span>
              </motion.div>
            );
          })}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: views.length * 0.05 }}
            onClick={toggleCustom}
            className="flex flex-col items-center gap-3 group cursor-pointer"
          >
            <div className={`relative w-full aspect-[4/5] rounded-[14px] p-[2px] transition-all duration-300 ${isCustomMode ? "bg-gradient-to-br from-[#00A3FF] to-[#D100FF] shadow-[0_0_20px_rgba(124,77,255,0.3)]" : "bg-transparent"}`}>
              <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-[#060B18] border border-white/5 flex items-center justify-center">
                {customImage ? (
                  <Image 
                    src={customImage} 
                    alt="Custom View" 
                    fill 
                    className="object-cover" 
                    unoptimized 
                  />
                ) : (
                  <div className={`w-[80px] h-[80px] rounded-[20px] flex items-center justify-center transition-all duration-500 bg-[#0A0A0A] border border-white/5`}>
                    <Sparkles className="w-8 h-8 text-[#00A3FF]" fill="#00A3FF" />
                  </div>
                )}
              </div>
              
              {isCustomMode && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-gradient-to-br from-[#00A3FF] to-[#D100FF] shadow-lg flex items-center justify-center z-20 border border-black/20">
                  <Check className="w-3.5 h-3.5 text-white stroke-[4px]" />
                </div>
              )}
            </div>
            <span className={`font-roboto font-bold text-[14px] leading-[16px] transition-colors ${isCustomMode ? "text-white" : "text-white/80 group-hover:text-white"}`}>
              Custom
            </span>
          </motion.div>
        </div>

        {/* AI Custom Angle textarea */}
        <div className="w-full max-w-[353px] lg:max-w-[800px] mx-auto px-1 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-[18px] font-bold text-white tracking-tight">AI Custom Angle</h2>
            <span className="text-[13px] text-white/30 font-normal">(Optional)</span>
          </div>
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            className="w-full h-[100px] bg-white/[0.03] border border-white/10 rounded-[22px] p-5 text-[14px] leading-relaxed text-white outline-none focus:border-white/20 transition-all placeholder:text-white/20 resize-none font-roboto"
            placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
          />
        </div>

        <div className="w-full mt-2 mb-20 flex justify-center px-5">
          <LoadingActionButton
            isLoading={isGenerating}
            onClick={isCompleted ? () => router.push(`/apparel/${segment}/${styleParam}/output-results`) : handleGenerate}
            className="w-full max-w-[353px] lg:max-w-[800px] h-[61px] rounded-[16px] text-[18px] bg-gradient-to-r from-[#00A3FF] to-[#D100FF] hover:opacity-90 font-bold tracking-wide shadow-none"
            disabled={(totalSelectedCount === 0 && !isCompleted) || isGenerating}
          >
            {isCompleted ? "View Results" : "Generate Outputs"}
          </LoadingActionButton>
        </div>
        </>
      )}

      </main>
      <Footer />

      {/* Preview Overlay */}
      <AnimatePresence>
        {activePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-5 cursor-zoom-out"
            onClick={() => setActivePreview(null)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setActivePreview(null); }}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors z-[210]"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <Image 
                src={activePreview.image} 
                alt="Preview" 
                fill 
                className="object-cover"
                style={activePreview.styles}
                unoptimized
              />
              {!activePreview.styles && (
                 <div className="absolute top-4 left-4 bg-[#7C4DFF] px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                   Final Output
                 </div>
              )}
            </motion.div>
            
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold text-white mb-1">{activePreview.title}</h3>
              <p className="text-[#7C4DFF] text-[10px] font-bold uppercase tracking-[0.2em]">
                {activePreview.styles ? "Simulation Preview • Accurate Framing" : "High-Fidelity AI Render"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
