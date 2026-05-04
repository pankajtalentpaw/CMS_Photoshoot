"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useProject } from "@/frontend/context/ProjectContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Sparkles, AlertCircle, RefreshCcw, Film } from "lucide-react";
import { TAXONOMY } from "@/registry/taxonomy";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function ProductsVideoStyleSelectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentProject, updateProject } = useProject();
  const styleParam = (params.style as string) || "home";
  const product = searchParams.get("product") || "Product";

  const [selectedStyle, setSelectedStyle] = useState<string | null>(currentProject?.videoStyle || null);
  const [customPrompt, setCustomPrompt] = useState(currentProject?.videoPrompt || "");
  const { status, outputVideo, error, generate, reset } = useGenerationPolling();

  const isLoading = status === "submitting" || status === "polling";
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  // Determine fallback image from taxonomy
  const matchedFamily = TAXONOMY.products.families.find(
    (f: any) => f.title.toLowerCase().replace(/\s+/g, '-') === styleParam.toLowerCase()
  );
  const previewImage = currentProject?.primeImage || matchedFamily?.image || "/assets/placeholder-product.jpg";

  const videoStyles = [
    { id: "staged-motion", title: "Staged Motion" },
    { id: "detail-zoom", title: "Texture Zoom" },
    { id: "slow-rotation", title: "Slow Rotation" },
    { id: "ambient-mood", title: "Ambient Mood" }
  ];

  useEffect(() => {
    if (isCompleted && outputVideo) {
      updateProject({ 
        videoUrl: outputVideo,
        videoStyle: selectedStyle || undefined,
        videoPrompt: customPrompt
      });
      router.push(`/products/${styleParam}/video/result?product=${product}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, outputVideo]);

  const handleGenerate = () => {
    if (!selectedStyle || !previewImage) return;
    reset();
    generate({
      garmentImageUrl: previewImage,
      modelImageUrl: currentProject?.modelImageUrl || "",
      mode: "VIDEO_GENERATION",
      hub: "Products",
      segment: styleParam,
      wearType: product,
      style: currentProject?.styleId || "Catalog",
      videoStyle: selectedStyle,
      sourceJobId: currentProject?.sourceJobId || "",
      prompt: customPrompt
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Video Style" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 pb-20">
        <ProgressStepper currentStep={5} partialStep={true} />

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
                  <Film className="w-10 h-10 text-[#7C4DFF] animate-pulse" />
                </div>
              </div>
              <div className="text-center px-6">
                <h2 className="text-2xl font-bold text-white mb-2 font-manrope italic">Synthesizing Product Video</h2>
                <p className="text-[#99A1AF] text-sm animate-pulse">Style: {videoStyles.find(v => v.id === selectedStyle)?.title}</p>
                <p className="text-[#99A1AF] text-xs mt-1 opacity-60">Running Seedance 1.0 motion pipeline...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isFailed || error ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm font-medium">{error || "Video generation failed."}</p>
            <button onClick={handleGenerate} className="ml-auto text-red-400 text-sm font-bold underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        ) : null}

        <section className="mb-10 text-center mt-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-bold text-[32px] md:text-[42px] leading-tight tracking-[-1px] text-white mb-3">
              Select Video Style
            </h1>
            <p className="font-normal text-[15px] leading-[22px] text-[#9CA3AF]">
              Choose video animation style
            </p>
          </motion.div>
        </section>

        {(!currentProject?.sourceJobId && !isLoading) && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex flex-col gap-2 max-w-[800px] mx-auto"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 text-sm font-bold uppercase tracking-wider">Connection Lost</p>
            </div>
            <p className="text-amber-400/80 text-xs font-medium ml-8">
              Please 
              <button 
                onClick={() => router.push(`/products/${styleParam}/approve-prime?product=${product}`)}
                className="mx-1 underline hover:text-amber-300 transition-colors"
              >
                go back to Approval step
              </button> 
              to restore your context.
            </p>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-x-4 gap-y-10 mb-16 max-w-[353px] lg:max-w-[800px] mx-auto">
          {videoStyles.map((vs, idx) => {
            const isSelected = selectedStyle === vs.id;
            return (
              <motion.div key={vs.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedStyle(vs.id)}
                className="flex flex-col items-center gap-4 group cursor-pointer"
              >
                <div className={`relative w-full aspect-[166/207] rounded-[16px] overflow-hidden border transition-all duration-300 ${isSelected ? "border-[#7C4DFF] border-[2px] shadow-[0_0_20px_rgba(124,77,255,0.3)]" : "border-white/10 border-[1px] hover:border-white/30"}`}>
                  <Image src={previewImage} alt={vs.title} fill className={`object-cover transition-transform duration-700 ${isSelected ? "scale-105" : "opacity-80 group-hover:opacity-100 group-hover:scale-105"}`} unoptimized />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-500 ${isSelected ? "bg-gradient-to-br from-[#7C4DFF] to-[#FF00C7] scale-110 shadow-lg" : "bg-white/10 border border-white/20 group-hover:bg-white/20 group-hover:scale-110"}`}>
                      <Play className={`w-5 h-5 ml-0.5 ${isSelected ? "text-white fill-white" : "text-white/80"}`} />
                    </div>
                  </div>
                </div>
                <span className={`font-medium text-[13px] leading-[15px] transition-colors ${isSelected ? "text-white font-bold" : "text-[#9CA3AF] group-hover:text-white"}`}>
                  {vs.title}
                </span>
              </motion.div>
            );
          })}
        </div>

        <section className="w-full max-w-[353px] lg:max-w-[800px] mx-auto flex flex-col gap-8 mb-16">
          <div className="flex flex-col gap-3 px-1">
            <div className="flex">
              <span className="px-4 py-1.5 bg-white/[0.05] border border-white/10 rounded-full text-[12px] font-bold text-white tracking-wide uppercase">Use Prompt</span>
            </div>
            <p className="text-[11px] text-red-400 font-medium flex items-center gap-1.5 opacity-80">
              <AlertCircle className="w-3 h-3" />
              Custom prompts may vary. Use at your own risk
            </p>
          </div>
          
          <div className="px-1">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-[18px] font-bold text-white tracking-tight">AI Custom</h2>
              <span className="text-[13px] text-white/30 font-normal">(Optional)</span>
            </div>
            <textarea 
              value={customPrompt} 
              onChange={e => setCustomPrompt(e.target.value)}
              className="w-full h-[120px] bg-white/[0.03] border border-white/10 rounded-[22px] p-6 text-[14px] leading-relaxed text-white outline-none focus:border-white/20 transition-all placeholder:text-white/20 resize-none shadow-inner font-roboto"
              placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
            />
          </div>

          <div className="mt-4">
            <LoadingActionButton 
              isLoading={isLoading} 
              onClick={handleGenerate}
              className="w-full h-[61px] text-[18px] font-bold rounded-full bg-gradient-to-r from-[#00A3FF] to-[#D100FF] shadow-[0_10px_30px_rgba(0,163,255,0.2)]" 
              disabled={!selectedStyle || isLoading}
            >
              Generate Video
            </LoadingActionButton>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
