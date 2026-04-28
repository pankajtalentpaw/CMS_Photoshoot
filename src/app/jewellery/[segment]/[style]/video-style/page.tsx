"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/frontend/context/ProjectContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Sparkles, AlertCircle, RefreshCcw, Film } from "lucide-react";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function JewelleryVideoStyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const { currentProject, updateProject } = useProject();
  const segment = (params.segment as string) || "bridal";
  const styleParam = (params.style as string) || "sets-and-pieces";

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const { status, outputVideo, error, generate, reset } = useGenerationPolling();

  const isLoading = status === "submitting" || status === "polling";
  const isCompleted = status === "completed";

  const previewImage = currentProject?.primeImage || "/assets/placeholder-jewelry.jpg";

  const videoStyles = [
    { 
      id: "shine-closeup", 
      title: "Jewellery Shine Close-up", 
      description: "Macro focus on gemstones with dynamic light refraction.",
      image: previewImage
    },
    { 
      id: "slow-pan", 
      title: "Studio Pan", 
      description: "Cinematic horizontal pan across the entire piece.",
      image: previewImage
    },
    { 
      id: "float-rotate", 
      title: "Floating Rotation", 
      description: "Graceful 360° hover rotation in a dreamlike setting.",
      image: previewImage
    },
    { 
      id: "detail-zoom", 
      title: "Elegant Detail Zoom", 
      description: "Slow zoom-in on the most intricate parts of the design.",
      image: previewImage
    }
  ];

  useEffect(() => {
    if (isCompleted && outputVideo) {
      updateProject({ videoUrl: outputVideo });
      router.push(`/jewellery/${segment}/${styleParam}/final-results`);
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
      hub: "Jewellery",
      segment: segment,
      wearType: styleParam,
      style: currentProject?.styleId || "Catalog",
      videoStyle: selectedStyle,
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Treatment" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={10} />

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
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2 font-manrope italic">Synthesizing Luxury Video</h2>
                <p className="text-[#C2C6D6] text-base animate-pulse">Running Seedance 1.0 motion pipeline...</p>
                <div className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C4DFF]">
                    {videoStyles.find(v => v.id === selectedStyle)?.title} • 4K
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section className="mt-8 mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-roboto font-semibold text-3xl text-white mb-4">
              Select Motion Style
            </h1>
            <p className="text-[#C2C6D6] max-w-md mx-auto">
              Choose how you want your jewelry piece to move in the video.
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {videoStyles.map((vs, idx) => (
            <motion.div
              key={vs.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedStyle(vs.id)}
              className={`relative h-[220px] rounded-2xl overflow-hidden cursor-pointer border-2 shadow-2xl transition-all group ${
                selectedStyle === vs.id ? "border-[#FF00C7]" : "border-white/10 hover:border-white/20"
              }`}
            >
              <Image src={vs.image} alt={vs.title} fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" unoptimized />
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/30 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <Play className={`w-4 h-4 ${selectedStyle === vs.id ? "text-[#FF00C7]" : "text-white"}`} />
                  <h3 className="font-bold text-lg">{vs.title}</h3>
                </div>
                <p className="text-xs text-gray-300">{vs.description}</p>
              </div>
              {selectedStyle === vs.id && (
                <div className="absolute top-4 right-4 bg-[#FF00C7] p-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="w-full mt-auto mb-10 flex flex-col items-center gap-4">
          <div className="w-full max-w-[353px]">
            <LoadingActionButton
              isLoading={isLoading}
              onClick={handleGenerate}
              className="w-full h-[61px]"
              disabled={!selectedStyle || isLoading}
            >
              Generate Luxury Video
            </LoadingActionButton>
          </div>
          <button onClick={() => router.push(`/jewellery/${segment}/${styleParam}/final-results`)} className="text-white/40 text-sm">
            Skip to final results
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
