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

export default function VideoStyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const { currentProject, updateProject } = useProject();

  const [selectedStyle, setSelectedStyle] = useState<string | null>(currentProject?.videoStyle || null);
  const [customPrompt, setCustomPrompt] = useState("");
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
    { id: "straight-walk", title: "Straight Walk", description: "Classic catwalk motion showing fabric flow." },
    { id: "slow-turn", title: "Slow Turn", description: "Elegant rotation to highlight all garment details." },
    { id: "elegant-reveal", title: "Elegant Reveal", description: "Soft reveal movement with studio-grade style." },
    { id: "fabric-flow", title: "Fabric Flow", description: "Motion focused on natural drape and textile flow." },
  ];

  useEffect(() => {
    if (!currentProject?.primeImage) {
      router.replace(`/apparel/${segment}/${styleParam}/result`);
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
      background: currentProject?.backgroundId || "Studio White",
      videoStyle: selectedStyle,
      outputFormat: "single" as const,
      outputCount: 1,
      prompt: customPrompt,
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Style" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5, 6].map((dot) => (
            <div key={dot} className={`h-1 w-8 rounded-full ${dot <= 5 ? "bg-[#7C4DFF]" : "bg-white/10"}`} />
          ))}
        </div>

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
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Synthesizing Cinematic Video</h2>
                <p className="text-[#99A1AF] text-sm animate-pulse">Style: {videoStyles.find(v => v.id === selectedStyle)?.title}</p>
                <p className="text-[#99A1AF] text-xs mt-1">This may take 1–3 minutes...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isFailed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error || "Video generation failed."}</p>
            <button onClick={handleGenerate} className="ml-auto text-red-400 text-sm underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}

        <section className="mb-10 lg:text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Video Style
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6]">Choose video animation style</p>
          </motion.div>
        </section>

        <div className="grid grid-cols-2 gap-x-4 gap-y-6 mb-10">
          {videoStyles.map((vs, idx) => {
            const isSelected = selectedStyle === vs.id;
            return (
              <motion.div key={vs.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedStyle(vs.id)}
                className="flex flex-col gap-3 group cursor-pointer"
              >
                <div className={`relative aspect-[166/207] rounded-[10px] overflow-hidden transition-all ${isSelected ? "p-[2px] bg-figma-gradient" : "p-0"}`}>
                  <div className={`relative w-full h-full rounded-[8px] overflow-hidden ${!isSelected ? "border border-white/5 group-hover:border-white/10" : "border-none"}`}>
                    {previewImage ? (
                      <Image src={previewImage} alt={vs.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-[#1A1E29] flex items-center justify-center">
                        <Play className="w-8 h-8 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center backdrop-blur-sm transition-colors ${isSelected ? "bg-figma-gradient border-none" : "bg-transparent border border-white/60"}`}>
                        <Play className={`w-5 h-5 ml-0.5 ${isSelected ? "text-white fill-white" : "text-white/80 fill-transparent"}`} />
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-[13px] font-medium text-white block text-center leading-[15px]">{vs.title}</span>
              </motion.div>
            );
          })}
        </div>

        <section className="w-full max-w-full sm:max-w-[353px] mx-auto flex flex-col gap-6 mb-16">
          <div className="flex flex-col gap-3">
            <div className="flex">
              <span className="px-4 py-1.5 border border-white/10 rounded-full text-[12px] font-medium text-[#E2E2E8]">Use Prompt</span>
            </div>
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Custom prompts may vary. Use at your own risk
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-bold text-white">AI Custom</h2>
              <span className="text-[10px] text-[#C5B6DE] uppercase">(Optional)</span>
            </div>
            <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)}
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-[12px] text-white outline-none focus:border-[#7C4DFF] transition-all resize-none placeholder:text-white/20"
              placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
            />
          </div>

          <LoadingActionButton isLoading={isLoading} onClick={handleGenerate}
            className="w-full h-[61px] text-lg font-bold rounded-full bg-figma-gradient" disabled={!selectedStyle || isLoading}
          >
            Generate Video
          </LoadingActionButton>
        </section>
      </main>
      <Footer />
    </div>
  );
}
