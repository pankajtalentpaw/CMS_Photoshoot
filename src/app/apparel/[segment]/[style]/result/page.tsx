"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import ResultCarousel from "@/frontend/components/ResultCarousel";
import { Download, RefreshCcw, PlayCircle, Camera, Plus, Play, Maximize2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGeneration } from "@/frontend/context/GenerationContext";

type ResultItem = {
  title: string;
  image: string;
  isVideo: boolean;
  videoUrl?: string;
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic-Wear";
  
  const { currentProject, resetProject } = useProject();
  const { resetGeneration } = useGeneration();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeItem, setActiveItem] = useState<ResultItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const hasPrime = Boolean(currentProject?.primeImage);
    const hasOutputs = Array.isArray(currentProject?.outputViews) && currentProject.outputViews.length > 0;
    if (!hasPrime && !hasOutputs) {
      router.replace(`/apparel/${params.segment}/${params.style}/views`);
    }
  }, [currentProject, params.segment, params.style, router]);

  // Map generated images and their corresponding labels from context.
  const resultImages = currentProject?.outputViews || [];
  const resultLabels = currentProject?.generatedViewLabels || [];

  const results: ResultItem[] = [
    ...(resultImages || []).map((v: string, i: number) => ({ title: resultLabels[i] || `View ${i+1}`, image: v, isVideo: false })),
  ];

  const handleDownloadAll = async () => {
    if (resultImages.length === 0) return;
    try {
      setIsDownloading(true);
      
      for (let i = 0; i < resultImages.length; i++) {
        const urlToDownload = resultImages[i];
        if (!urlToDownload) continue;

        const link = document.createElement('a');
        link.href = urlToDownload;
        link.target = "_blank";
        link.download = `Result_View_${i + 1}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to download files. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCreateNewProject = (e: React.MouseEvent) => {
    e.preventDefault();
    resetProject();
    resetGeneration();
    router.push("/");
  };

  const ResultCard = ({ res, idx }: { res: ResultItem, idx: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="flex flex-col items-center gap-3 w-full"
      onClick={() => setActiveItem(res)}
    >
      <div className="relative w-full aspect-[166/207] bg-[#1A1E29] rounded-[10px] overflow-hidden border border-white/5 shadow-xl group cursor-zoom-in hover:border-[#7C4DFF]/50 transition-all">
        {res.image ? (
          <Image
            src={res.image}
            alt={res.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy" 
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <Plus className="w-6 h-6 text-white/20" />
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
          {res.isVideo ? (
            <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                <Maximize2 className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">Preview</span>
              </div>
            </div>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      </div>
      <span className="font-roboto font-medium text-[13px] leading-[15px] text-center text-[#E2E2E8]">
        {res.title}
      </span>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Step Indicator (Section 5.0) */}
        <div className="w-full mb-8">
          <ProgressStepper currentStep={6} />
        </div>

        {/* Categorized Views Grid */}
        <div className="w-full max-w-[353px] lg:max-w-[800px] mb-8">
          {resultImages.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-8 w-full justify-items-center">
              {isMounted && results.map((res, idx) => (
                <div key={idx} className="w-full max-w-[166px] lg:max-w-[200px]">
                  <ResultCard res={res} idx={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full aspect-[4/5] max-w-full sm:max-w-[353px] mx-auto rounded-[24px] bg-white/5 flex flex-col items-center justify-center gap-4 border border-white/10">
              <RefreshCcw className="w-10 h-10 text-[#7C4DFF] animate-spin" />
              <p className="text-[#99A1AF] text-sm">Waiting for AI outputs...</p>
            </div>
          )}
        </div>

        {/* Action Buttons Hierarchy (Figma iPhone 16 - 9) */}
        <div className="w-full max-w-full sm:max-w-[353px] flex flex-col gap-4 mt-10 mb-10">
          
          {/* Row 1: More Angles & Create Video (Side-by-side) */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/apparel/${params.segment}/${params.style}/views`}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[52px] border border-white/10 rounded-full flex items-center justify-center gap-2 bg-transparent"
              >
                <Camera className="w-4 h-4 text-[#E2E2E8]" />
                <span className="font-roboto font-medium text-sm text-[#E2E2E8]">
                  More Angles
                </span>
              </motion.button>
            </Link>

            <Link href={`/apparel/${params.segment}/${params.style}/video-style`}>
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[52px] border border-white/10 rounded-full flex items-center justify-center gap-2 bg-transparent"
              >
                <PlayCircle className="w-4 h-4 text-[#E2E2E8]" />
                <span className="font-roboto font-medium text-sm text-[#E2E2E8]">
                  Create Video
                </span>
              </motion.button>
            </Link>
          </div>

          {/* Row 2: Download All (Primary Gradient) */}
          <motion.button
            whileHover={isDownloading ? undefined : { scale: 1.02 }}
            whileTap={isDownloading ? undefined : { scale: 0.98 }}
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className={`w-full h-[61px] ${isDownloading ? "bg-white/20 cursor-not-allowed" : "bg-figma-gradient shadow-[0_10px_30px_rgba(124,77,255,0.3)]"} rounded-full flex items-center justify-center gap-3 transition-all`}
          >
            {isDownloading ? (
              <RefreshCcw className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-white" />
            )}
            <span className="font-roboto font-semibold text-lg text-white">
              {isDownloading ? "Downloading..." : "Download All"}
            </span>
          </motion.button>

          {/* Row 3: Create New Project (Tertiary Outline) */}
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.02)" }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNewProject}
            className="w-full h-[61px] border border-white/10 rounded-full flex items-center justify-center bg-transparent"
          >
            <span className="font-roboto font-medium text-lg text-[#E2E2E8]">
              Create New Project
            </span>
          </motion.button>
        </div>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>

      {/* Clickable Preview Overlay */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-5 cursor-zoom-out"
            onClick={() => setActiveItem(null)}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setActiveItem(null); }}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors z-[210]"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-[3/4] md:aspect-[4/5] lg:aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {activeItem.isVideo ? (
                <video 
                  src={activeItem.videoUrl} 
                  autoPlay 
                  controls 
                  loop 
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <Image 
                  src={activeItem.image} 
                  alt="Preview" 
                  fill 
                  className="object-contain bg-black/40"
                  unoptimized
                />
              )}
            </motion.div>
            
            <div className="mt-8 text-center">
              <h3 className="text-xl font-bold text-white mb-1">{activeItem.title}</h3>
              <p className="text-[#7C4DFF] text-[10px] font-bold uppercase tracking-[0.2em]">
                {activeItem.isVideo ? "AI Cinematic Synthesis • 4K Editorial" : "High-Fidelity AI Render • Marketplace Ready"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
