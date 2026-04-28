"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { Check, Sparkles, AlertCircle, RefreshCcw, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function SelectOutputViewsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { currentProject, updateProject } = useProject();

  const [selectedViews, setSelectedViews] = useState<string[]>(["front-view", "side-view", "detail-shot"]);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");

  const { status, outputImages, outputImage, error, generate, reset } = useGenerationPolling();
  const isLoading = status === "submitting" || status === "polling";
  const isCompleted = status === "completed";

  const previewImage = currentProject?.primeImage || "/assets/placeholder-view.jpg";

  const views = [
    { id: "front-view", title: "Front View", image: previewImage },
    { id: "side-view", title: "Side View", image: previewImage },
    { id: "back-view", title: "Back View", image: previewImage },
    { id: "detail-shot", title: "Detail Shot", image: previewImage },
    { id: "close-up", title: "Close-up", image: previewImage },
  ];

  const isCustomMode = selectedViews.includes("custom");

  useEffect(() => {
    if (isCompleted) {
      const imgs = outputImages.length > 0 ? outputImages : outputImage ? [outputImage] : [];
      updateProject({ outputViews: imgs });
      router.push(`/result/${jobId}/video-style`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const toggleView = (id: string) => {
    if (!selectedViews.includes(id) && selectedViews.length >= 4) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000);
      return;
    }
    setSelectedViews(prev => 
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleGenerate = () => {
    if (!previewImage) return;
    reset();
    generate({
      garmentImageUrl: previewImage,
      modelImageUrl: currentProject?.modelImageUrl || previewImage,
      mode: "AI Studio",
      hub: "Apparel", // Default for generic results, or detect from context
      style: currentProject?.styleId || "Catalog",
      background: currentProject?.backgroundId || "Studio White",
      outputFormat: selectedViews.length <= 1 ? "single" : selectedViews.length <= 3 ? "triple" : "multi-view",
      outputCount: Math.min(selectedViews.length, 6),
      outputViews: selectedViews,
      prompt: customPrompt,
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Output Views" />

      {/* Generating Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
          >
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 border-4 border-[#7C4DFF]/20 rounded-full" />
              <motion.div 
                className="absolute inset-0 border-4 border-t-[#7C4DFF] rounded-full"
                animate={{ rotate: 360 }} 
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#7C4DFF] animate-pulse" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2 font-manrope italic">Generating Multi-Views</h2>
              <p className="text-[#C2C6D6] text-base animate-pulse">Running studio render pipeline...</p>
              <div className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C4DFF]">
                  {selectedViews.length} Editorial Perspectives
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Limit Warning */}
      <AnimatePresence>
        {showLimitWarning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] bg-[#FF4B4B] text-white px-6 py-3 rounded-full font-roboto font-bold text-sm shadow-[0_10px_30px_rgba(255,75,75,0.4)]"
          >
            Maximum 4 views can be selected
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col">
        {/* Progress Dots */}
        <ProgressStepper currentStep={9} />

        {/* Heading Section */}
        <section className="mb-10 text-left mt-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-[36px] leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Output Views
            </h1>
            <p className="font-roboto font-normal text-[16px] leading-[19px] text-[#C2C6D6]">
              Choose the outputs you want to generate for your high-fashion catalog.
            </p>
          </motion.div>
        </section>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={handleGenerate} className="ml-auto text-red-400 text-sm underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}

        {/* Views Grid (2-column) */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {views.map((view, idx) => {
            const isSelected = selectedViews.includes(view.id);
            return (
              <motion.div
                key={view.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => toggleView(view.id)}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border-2 transition-all ${
                  isSelected ? "border-[#7C4DFF]" : "border-white/5"
                }`}>
                  <Image 
                    src={view.image} 
                    alt={view.title} 
                    fill 
                    className="object-cover transition-transform group-hover:scale-105"
                    unoptimized
                  />
                  
                  {/* Selection Indicator Overlay */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${
                  isSelected ? "text-white" : "text-[#E2E2E8]"
                }`}>
                  {view.title}
                </span>
              </motion.div>
            );
          })}

          {/* Custom Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => toggleView("custom")}
            className="flex flex-col items-center gap-3 cursor-pointer"
          >
            <div className={`relative w-full aspect-[166/207] rounded-[10px] bg-[#0B0B0B] border-2 flex flex-col items-center justify-center transition-all ${
              isCustomMode ? "border-[#00C2FF] shadow-[0_0_20px_rgba(0,194,255,0.3)]" : "border-white/5"
            }`}>
              <div className={`w-[45px] h-[45px] rounded-full flex items-center justify-center mb-3 ${
                isCustomMode ? "bg-[#00C2FF] shadow-[0_0_20px_rgba(35,161,255,0.5)]" : "bg-white/5"
              }`}>
                <Sparkles className={`w-5 h-5 ${isCustomMode ? "text-white" : "text-[#00C2FF]"}`} />
              </div>
              <span className="font-roboto font-medium text-[20px] text-white">Custom</span>

              {isCustomMode && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* AI Custom Angle Prompt */}
        <AnimatePresence>
          {isCustomMode && (
            <motion.section 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 40 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1 mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="font-roboto font-semibold text-[18px] text-white">
                    AI Custom Angle
                  </h2>
                  <span className="text-[12px] text-[#C5B6DE] uppercase tracking-wider font-medium">
                    (Optional)
                  </span>
                </div>
                <p className="text-[11px] text-[#EC4899] font-medium tracking-wide">
                  Output depends on your prompt
                </p>
              </div>

              <div className="relative group">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="w-full h-[120px] bg-[#1A1E29] border border-white/10 rounded-[12px] p-4 font-roboto text-sm text-white focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none shadow-inner"
                  placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-white/20 uppercase tracking-widest font-bold pointer-events-none">
                  Expert Mode
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Generate Button */}
        <div className="w-full mb-20 mt-auto">
          <LoadingActionButton
            isLoading={isLoading}
            onClick={handleGenerate}
            className="w-full h-[61px] rounded-[100px] font-roboto font-semibold text-[18px] text-white shadow-[0_10px_40px_rgba(124,77,255,0.3)]"
            disabled={selectedViews.length === 0 || isLoading}
          >
            Generate Outputs
          </LoadingActionButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
