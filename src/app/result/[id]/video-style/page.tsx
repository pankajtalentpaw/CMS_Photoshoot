"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { Play, AlertCircle, RefreshCcw, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function SelectVideoStylePage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { currentProject, updateProject } = useProject();

  const [selectedStyle, setSelectedStyle] = useState<string>("Straight Walk");
  const [customNote, setCustomNote] = useState("");

  const { status, outputVideo, error, generate, reset } = useGenerationPolling();
  const isLoading = status === "submitting" || status === "polling";
  const isCompleted = status === "completed";

  const previewImage = currentProject?.primeImage || "/assets/placeholder-view.jpg";

  const styles = [
    { id: "Straight Walk", title: "Straight Walk", image: previewImage },
    { id: "Slow Turn", title: "Slow Turn", image: previewImage },
    { id: "Elegant Reveal", title: "Elegant Reveal", image: previewImage },
    { id: "Fabric Flow", title: "Fabric Flow", image: previewImage },
  ];

  useEffect(() => {
    if (isCompleted && outputVideo) {
      updateProject({ finalVideo: outputVideo });
      router.push(`/result/${jobId}/final`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, outputVideo]);

  const handleGenerate = () => {
    if (!previewImage) return;
    reset();
    generate({
      garmentImageUrl: previewImage,
      mode: "VIDEO_GENERATION",
      hub: "Apparel", // Default
      style: currentProject?.styleId || "Catalog",
      videoStyle: selectedStyle,
      prompt: customNote,
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Style" />

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
              <div className="absolute inset-0 border-4 border-[#FF00C7]/20 rounded-full" />
              <motion.div 
                className="absolute inset-0 border-4 border-t-[#FF00C7] rounded-full"
                animate={{ rotate: 360 }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-10 h-10 text-[#FF00C7] animate-pulse fill-[#FF00C7]" />
              </div>
            </div>
            <div className="text-center px-6">
              <h2 className="text-3xl font-bold text-white mb-2 font-manrope italic">Synthesizing Motion</h2>
              <p className="text-[#C2C6D6] text-base animate-pulse">Interpolating 4K frames for {selectedStyle}...</p>
              <div className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF00C7]">
                  Neural Motion Engine Active
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={11} />

        {/* Heading Section */}
        <section className="mb-10 text-left mt-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-roboto font-semibold text-[36px] leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Video Style
            </h1>
            <p className="font-roboto font-normal text-[16px] leading-[19px] text-[#C2C6D6]">
              Choose video animation style for your cinematic editorial.
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

        {/* Video Styles Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {styles.map((style, idx) => {
            const isSelected = selectedStyle === style.id;
            return (
              <motion.div
                key={style.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedStyle(style.id)}
                className="flex flex-col items-center gap-3 cursor-pointer group"
              >
                <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border-2 transition-all ${
                  isSelected ? "border-[#7C4DFF]" : "border-white/5"
                }`}>
                  <Image 
                    src={style.image} 
                    alt={style.title} 
                    fill 
                    className="object-cover opacity-80"
                    unoptimized
                  />
                  
                  {/* Play Interface Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center border transition-all ${
                      isSelected 
                        ? "bg-figma-gradient border-none shadow-[0_0_20px_rgba(124,77,255,0.5)]" 
                        : "border-white/50 backdrop-blur-sm"
                    }`}>
                      <Play className={`w-5 h-5 ${isSelected ? "text-white fill-white" : "text-white"}`} />
                    </div>
                  </div>
                </div>
                <span className={`font-roboto font-medium text-[13px] leading-[15px] transition-colors ${
                  isSelected ? "text-white" : "text-[#7C4DFF]/30"
                }`}>
                  {style.title}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Custom Prompt */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-roboto font-semibold text-[20px] text-white">
              AI Director Note
            </h2>
            <span className="text-[12px] text-[#C5B6DE] font-semibold">(Optional)</span>
          </div>

          <textarea 
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            className="w-full h-[95px] bg-black/30 border border-white/5 rounded-[10px] p-4 font-roboto text-[16px] leading-[19px] text-white focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
            placeholder="E.g. Add more dramatic lighting, make the fabric move faster..."
          />
        </section>

        {/* Generate Button */}
        <div className="w-full mb-20">
          <LoadingActionButton
            isLoading={isLoading}
            onClick={handleGenerate}
            className="w-full h-[61px] rounded-[100px] font-roboto font-semibold text-[18px] text-white shadow-[0_10px_40px_rgba(124,77,255,0.3)]"
          >
            Generate Luxury Video
          </LoadingActionButton>
        </div>
      </main>

      <Footer />
    </div>
  );
}
