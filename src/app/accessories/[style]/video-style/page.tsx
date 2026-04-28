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

export default function AccessoriesVideoStyleSelectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentProject, updateProject } = useProject();
  const styleParam = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";

  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const { status, outputVideo, error, generate, reset } = useGenerationPolling();

  const isLoading = status === "submitting" || status === "polling";
  const isCompleted = status === "completed";

  // Determine fallback image from taxonomy
  const matchedStyle = TAXONOMY.accessories.styles.find(
    (s: any) => s.title.toLowerCase() === styleParam.toLowerCase()
  );
  const previewImage = currentProject?.primeImage || matchedStyle?.image || "/assets/placeholder-accessory.jpg";

  const videoStyles = [
    { 
      id: "product-showcase", 
      title: "Product Showcase", 
      description: "Clean, professional look focusing on product form and detail.",
      image: previewImage
    },
    { 
      id: "slow-pan", 
      title: "Cinematic Pan", 
      description: "Slow horizontal camera movement highlighting design curves.",
      image: previewImage
    },
    { 
      id: "dynamic-zoom", 
      title: "Detail Zoom", 
      description: "Slow zoom-in on the texture and premium finish of the material.",
      image: previewImage
    },
    { 
      id: "lifestyle-motion", 
      title: "Lifestyle Aesthetic", 
      description: "Soft focus motion with natural studio lighting presets.",
      image: previewImage
    }
  ];

  useEffect(() => {
    if (isCompleted && outputVideo) {
      updateProject({ videoUrl: outputVideo });
      router.push(`/accessories/${styleParam}/final-results?product=${product}`);
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
      hub: "Accessories",
      segment: styleParam,
      wearType: product,
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
                <h2 className="text-3xl font-bold text-white mb-2 font-manrope italic">Synthesizing Product Video</h2>
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-roboto font-semibold text-3xl text-white mb-4">
              Motion Previews
            </h1>
            <p className="text-[#C2C6D6] max-w-md mx-auto">
              Select a motion treatment for your {product}.
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
              className={`relative h-[220px] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                selectedStyle === vs.id ? "border-[#7C4DFF]" : "border-white/10 hover:border-white/20"
              }`}
            >
              <Image src={vs.image} alt={vs.title} fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" unoptimized />
              <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/30 to-transparent">
                <div className="flex items-center gap-2 mb-1">
                  <Play className={`w-4 h-4 ${selectedStyle === vs.id ? "text-[#7C4DFF]" : "text-white"}`} />
                  <h3 className="font-bold text-lg">{vs.title}</h3>
                </div>
                <p className="text-xs text-gray-300">{vs.description}</p>
              </div>
              {selectedStyle === vs.id && (
                <div className="absolute top-4 right-4 bg-[#7C4DFF] p-2 rounded-full shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="w-full mt-auto mb-10 flex flex-col items-center gap-4">
          <div className="w-full max-w-full sm:max-w-[353px]">
            <LoadingActionButton
              isLoading={isLoading}
              onClick={handleGenerate}
              className="w-full h-[61px] text-lg font-bold"
              disabled={!selectedStyle || isLoading}
            >
              Synthesize Video
            </LoadingActionButton>
          </div>
          <button onClick={() => router.push(`/accessories/${styleParam}/final-results?product=${product}`)} className="text-white/40 text-sm hover:text-white transition-colors">
            Skip video style
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
