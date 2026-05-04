"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Play, AlertCircle, RefreshCcw } from "lucide-react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

import ProgressStepper from "@/frontend/components/ProgressStepper";

export default function VideoStyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const { currentProject, updateProject } = useProject();

  const [selectedStyle, setSelectedStyle] = useState<string | null>(currentProject?.videoStyle || null);
  const [customPrompt, setCustomPrompt] = useState(currentProject?.videoPrompt || "");
  const { status, outputVideo, outputImage, error, generate, reset } = useGenerationPolling();

  const isLoading = status === "submitting" || status === "polling";
  const isFailed = status === "failed";
  const isCompleted = status === "completed";

  const previewImage = currentProject?.primeImage || null;

  const normalizeModelImageUrl = (value: string | undefined, fallback: string) => {
    if (value && (value.startsWith("http://") || value.startsWith("https://"))) {
      return value;
    }
    return fallback;
  };

  const videoStyles = [
    { id: "straight-walk", title: "Straight Walk" },
    { id: "slow-turn", title: "Slow Turn" },
    { id: "elegant-reveal", title: "Elegant Reveal" },
    { id: "fabric-flow", title: "Fabric Flow" },
  ];

  useEffect(() => {
    if (!currentProject?.primeImage) {
      router.replace(`/apparel/${segment}/${styleParam}/approve-prime`);
    }
  }, [currentProject?.primeImage, router, segment, styleParam]);

  // When generation completes, save video URL and navigate
  useEffect(() => {
    if (isCompleted) {
      const videoUrl = outputVideo || outputImage || null;
      if (videoUrl) {
        updateProject({
          videoUrl,
          videoStyle: selectedStyle || undefined,
          videoPrompt: customPrompt,
        });
        router.push(`/apparel/${segment}/${styleParam}/video/result`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, outputVideo, outputImage]);

  const handleGenerate = () => {
    if (!selectedStyle) return;
    if (!currentProject?.garmentImageUrl && !currentProject?.primeImage) return;
    reset();
    const garmentUrl = currentProject?.primeImage || currentProject?.garmentImageUrl || "";
    generate({
      garmentImageUrl: garmentUrl,
      modelImageUrl: normalizeModelImageUrl(currentProject?.modelImageUrl, garmentUrl),
      mode: "VIDEO_GENERATION" as const,
      hub: "Apparel" as const,
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      wearType: styleParam.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      style: currentProject?.styleId || "Catalog",
      background: currentProject?.backgroundId || "White Studio",
      videoStyle: selectedStyle,
      sourceJobId: currentProject?.sourceJobId || "",
      outputFormat: "single" as const,
      outputCount: 1,
      prompt: customPrompt,
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Video Style" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 pb-20">
        <ProgressStepper currentStep={5} partialStep={true} />

        {/* Generating overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center gap-6"
            >
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <motion.div className="absolute inset-0 border-4 border-t-[#7C4DFF] border-r-[#FF00C7] rounded-full"
                  animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-8 h-8 text-[#7C4DFF] fill-[#7C4DFF] animate-pulse ml-1" />
                </div>
              </div>
              <div className="text-center px-6">
                <h2 className="text-2xl font-bold text-white mb-2">Synthesizing Cinematic Video</h2>
                <p className="text-[#99A1AF] text-sm animate-pulse">Style: {videoStyles.find(v => v.id === selectedStyle)?.title}</p>
                <p className="text-[#99A1AF] text-xs mt-1 opacity-60">This may take 1–3 minutes...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isFailed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm font-medium">{error || "Video generation failed."}</p>
            <button onClick={handleGenerate} className="ml-auto text-red-400 text-sm font-bold underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}

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
                onClick={() => router.push(`/apparel/${segment}/${styleParam}/approve-prime`)}
                className="mx-1 underline hover:text-amber-300 transition-colors"
              >
                go back to Approval step
              </button> 
              to restore your generation context.
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
                  {previewImage ? (
                    <Image src={previewImage} alt={vs.title} fill className={`object-cover transition-transform duration-700 ${isSelected ? "scale-105" : "opacity-80 group-hover:opacity-100 group-hover:scale-105"}`} unoptimized />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Play className="w-8 h-8 text-white/10" />
                    </div>
                  )}
                  
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
