"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { Check, Sparkles, Wand2, AlertCircle, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useProject } from "@/frontend/context/ProjectContext";
import { useState, useEffect } from "react";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { TAXONOMY } from "@/registry/taxonomy";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function AccessoriesOutputViewsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentProject, updateProject } = useProject();
  const mounted = useMounted();
  const styleParam = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";

  const { status, outputImages, outputImage, error, generate, reset } = useGenerationPolling();
  const isGenerating = status === "submitting" || status === "polling";
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  const getRecommendedViews = () => {
    const matchedStyle = TAXONOMY.accessories.styles.find(
      (s: any) => s.title.toLowerCase() === styleParam.toLowerCase() || s.leafNodes?.some((n: string) => n.toLowerCase() === product.toLowerCase())
    );
    const viewTitles = matchedStyle?.recommendedViews || ["Front View", "Left View", "Right View", "Close-up", "Detail Shot"];
    return viewTitles.slice(0, 5).map((title: string) => {
      const id = title.toLowerCase().replace(/\s+/g, "-");
      let viewStyles = "object-cover transition-all duration-700";
      
      // Dynamic CSS generation for categorized views based on prime image
      if (id === "front-view") viewStyles += " object-[center_center] scale-100";
      else if (id === "left-view") viewStyles += " object-[25%_center] scale-110";
      else if (id === "right-view") viewStyles += " object-[75%_center] scale-110";
      else if (id === "close-up") viewStyles += " object-[center_20%] scale-[1.5]";
      else if (id === "detail-shot") viewStyles += " object-[center_60%] scale-[2]";

      return {
        id,
        title,
        previewImage: currentProject?.primeImage || "/assets/placeholder.jpg",
        viewStyles
      };
    });
  };

  const views = getRecommendedViews();
  const [selectedViews, setSelectedViews] = useState<string[]>(
    views.slice(0, 5).map((v: any) => v.id)
  );
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [showMaxWarning, setShowMaxWarning] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const MAX_VIEWS = 5;

  useEffect(() => {
    if (isCompleted) {
      const imgs = outputImages.length > 0 ? outputImages : outputImage ? [outputImage] : [];
      
      const selectedTitles = views
        .filter((view: { id: string; title: string }) => selectedViews.includes(view.id))
        .map((view: { title: string }) => view.title);

      if (isCustomMode) {
        selectedTitles.push("Custom View");
      }

      const generatedViewLabels = imgs.map((_, index) => selectedTitles[index] || `View ${index + 1}`);

      updateProject({ 
        outputViews: imgs,
        generatedViewLabels
      });
      router.push(`/accessories/${styleParam}/video-style?product=${product}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted]);

  const handleGenerate = () => {
    if (!currentProject?.garmentImageUrl && !currentProject?.productImageUrl) return;
    reset();

    // Map IDs back to Titles for dynamic display in results
    const newLabels = [
      ...selectedViews.map(id => views.find((v: any) => v.id === id)?.title || "AI Result"),
      ...(isCustomMode ? ["Custom View"] : [])
    ];
    updateProject({ generatedViewLabels: newLabels });

    const count = selectedViews.length + (isCustomMode ? 1 : 0);
    generate({
      garmentImageUrl: currentProject?.garmentImageUrl || currentProject?.productImageUrl || "",
      modelImageUrl: currentProject?.modelImageUrl || currentProject?.garmentImageUrl || "",
      mode: "AI Studio" as const,
      hub: "Accessories" as const,
      accessoryType: styleParam.charAt(0).toUpperCase() + styleParam.slice(1),
      style: currentProject?.styleId || "Catalog",
      background: currentProject?.backgroundId || "Studio White",
      outputFormat: count <= 1 ? "single" : count <= 3 ? "triple" : "multi-view",
      outputCount: Math.min(count, 6),
      category: product,
      outputViews: selectedViews,
      prompt: customPrompt,
    });
  };

  const toggleView = (id: string) => setSelectedViews(prev => {
    if (prev.includes(id)) return prev.filter(v => v !== id);
    if (prev.length + (isCustomMode ? 1 : 0) >= MAX_VIEWS) {
      setShowMaxWarning(true); setTimeout(() => setShowMaxWarning(false), 2000); return prev;
    }
    return [...prev, id];
  });

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Output Pack" />
      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <div className="flex justify-center gap-2 mb-12 mt-2">
          {[1, 2, 3, 4, 5, 6].map((dot) => (
            <div key={dot} className={`h-1 w-full max-w-[44px] rounded-full ${dot <= 5 ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" : "bg-white/10"}`} />
          ))}
        </div>

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
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Generating Secondary Assets</h2>
                <p className="text-[#99A1AF] text-sm animate-pulse font-medium">Processing {selectedViews.length} views for {product}...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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

        <section className="mb-10 text-center flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-roboto font-bold text-[32px] md:text-[42px] leading-tight tracking-[-1px] text-white mb-3 px-4">Select Output Views</h1>
            <p className="font-roboto font-normal text-[15px] leading-[22px] text-[#9CA3AF] max-w-[320px] lg:max-w-none px-4">Choose the derivative outputs for your {product} catalog.</p>
          </motion.div>
        </section>

        <div className="grid grid-cols-2 gap-4 lg:gap-8 mb-10 max-w-[353px] lg:max-w-[800px] mx-auto">
          {views.map((view: { id: string; title: string; previewImage: string; viewStyles: string }, idx: number) => {
            const isSelected = selectedViews.includes(view.id);
            return (
              <motion.div key={view.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }} onClick={() => toggleView(view.id)}
                className="flex flex-col items-center gap-3 group cursor-pointer"
              >
                <div className={`relative w-full aspect-[166/207] rounded-[16px] overflow-hidden border transition-all duration-300 ${isSelected ? "border-[#7C4DFF] border-[2px] shadow-[0_0_20px_rgba(124,77,255,0.3)]" : "border-white/10 border-[1px] hover:border-white/30"}`}>
                  {mounted && view.previewImage ? (
                    <Image 
                      src={view.previewImage} 
                      alt={view.title} 
                      fill 
                      className={`${view.viewStyles} ${isSelected ? "" : "opacity-80 group-hover:opacity-100"}`} 
                      loading="lazy" 
                      unoptimized 
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? "bg-[#7C4DFF] shadow-lg" : "bg-black/40 border border-white/20 backdrop-blur-md"}`}>
                    {isSelected && <Check className="w-3 h-3 text-white stroke-[4px]" />}
                  </div>
                </div>
                <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${isSelected ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>{view.title}</span>
              </motion.div>
            );
          })}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: views.length * 0.05 }}
            onClick={() => setIsCustomMode(!isCustomMode)} className="flex flex-col items-center gap-3 group cursor-pointer"
          >
            <div className={`relative w-full aspect-[166/207] rounded-[16px] overflow-hidden border transition-all duration-300 bg-[#060B18] ${isCustomMode ? "border-[#7C4DFF] border-[2px] shadow-[0_0_20px_rgba(124,77,255,0.3)]" : "border-white/10 border-[1px] hover:border-white/30"}`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCustomMode ? "bg-[#7C4DFF]/20 scale-110 shadow-[0_0_30px_rgba(124,77,255,0.1)]" : "bg-white/5 border border-white/5 group-hover:scale-110"}`}>
                  <Sparkles className={`w-8 h-8 transition-colors duration-500 ${isCustomMode ? "text-[#7C4DFF]" : "text-white/20"}`} />
                </div>
              </div>
              <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${isCustomMode ? "bg-[#7C4DFF] shadow-lg" : "bg-black/40 border border-white/20 backdrop-blur-md"}`}>
                {isCustomMode && <Check className="w-3 h-3 text-white stroke-[4px]" />}
              </div>
            </div>
            <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${isCustomMode ? "text-white" : "text-[#9CA3AF] group-hover:text-white"}`}>Custom</span>
          </motion.div>
        </div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 mb-12 max-w-[353px] lg:max-w-[800px] mx-auto w-full px-1">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-roboto font-bold text-[18px] text-white tracking-tight">AI Custom Angle</h2>
            <span className="font-roboto font-normal text-[13px] text-[#9CA3AF] opacity-60">(Optional)</span>
          </div>
          <textarea 
            value={customPrompt} 
            onChange={e => setCustomPrompt(e.target.value)}
            className="w-full h-[120px] bg-[#0A0A0A] border border-white/10 rounded-[20px] p-5 font-roboto text-[15px] leading-relaxed text-white focus:border-[#7C4DFF]/50 focus:ring-1 focus:ring-[#7C4DFF]/50 outline-none transition-all placeholder:text-white/20 resize-none shadow-inner"
            placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
          />
          <div className="flex items-center gap-2 text-[#9CA3AF] mt-4 px-1">
            <Sparkles className="w-3.5 h-3.5 text-[#7C4DFF]" />
            <p className="text-[11px] font-medium tracking-wide italic opacity-80 uppercase">Professional output depends on the precision of your prompt.</p>
          </div>
        </motion.section>

        <div className="w-full mt-10 mb-20 flex justify-center px-5">
          <LoadingActionButton 
            isLoading={isGenerating} 
            onClick={handleGenerate}
            className="w-full max-w-[353px] lg:max-w-[400px] h-[61px] rounded-full bg-figma-gradient font-roboto font-bold text-[18px] text-white shadow-[0_10px_40px_rgba(124,77,255,0.4)] hover:shadow-[0_10px_50px_rgba(124,77,255,0.6)] transition-all active:scale-[0.98]" 
            disabled={selectedViews.length === 0 || isGenerating}
          >
            Generate Outputs
          </LoadingActionButton>
        </div>

      </main>
      <Footer />
    </div>
  );
}
