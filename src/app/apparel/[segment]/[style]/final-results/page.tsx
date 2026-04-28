"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { Download, Plus, Play, RefreshCcw, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGeneration } from "@/frontend/context/GenerationContext";
import { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type ResultItem = {
  title: string;
  image: string;
  isVideo: boolean;
  videoUrl?: string;
};

export default function FinalResultsPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";
  
  const { currentProject, resetProject } = useProject();
  const { resetGeneration } = useGeneration();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeItem, setActiveItem] = useState<ResultItem | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const outputViews = currentProject?.outputViews || [];
  const generatedViewLabels = currentProject?.generatedViewLabels || [];
  const results: ResultItem[] = [
    ...(outputViews || []).map((v: string, i: number) => ({ title: generatedViewLabels[i] || `View ${i+1}`, image: v, isVideo: false })),
    ...(currentProject?.videoUrl ? [{ title: "Video Result", image: currentProject?.primeImage || "", videoUrl: currentProject.videoUrl, isVideo: true }] : [])
  ];

  const handleDownloadAll = async () => {
    if (!results || results.length === 0) return;
    try {
      setIsDownloading(true);
      const zip = new JSZip();
      
      const promises = results.map(async (res, idx) => {
        const urlToFetch = res.videoUrl || res.image;
        if (!urlToFetch) return;

        // Use the local proxy to avoid CORS issues
        const proxyUrl = `/api/proxy?url=${encodeURIComponent(urlToFetch)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${res.title}`);
        
        const blob = await response.blob();
        
        let ext = res.isVideo ? "mp4" : "png";
        if (blob.type === "image/jpeg") ext = "jpg";
        else if (blob.type === "image/webp") ext = "webp";
        
        const filename = `${res.title.replace(/\s+/g, "_")}_${idx + 1}.${ext}`;
        zip.file(filename, blob);
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${segment}_${style.replace(/\s+/g, "_")}_results.zip`);
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to create download pack. Please try again.");
    } finally {
      setIsDownloading(false);
    }
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
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-[100px] lg:pb-0">
      <FlowHeader title="Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Progress Stepper (Figma Style) */}
        <div className="w-full mb-8 flex justify-center">
           <ProgressStepper currentStep={11} />
        </div>


        {/* Gallery Grid */}
        <div className="w-full max-w-[353px] grid grid-cols-2 gap-4 mb-8">
           {isMounted && results.map((res, idx) => {
             const isLastOdd = idx === results.length - 1 && results.length % 2 !== 0;
             return (
               <div key={idx} className={isLastOdd ? "col-span-2 flex justify-center" : ""}>
                 <div className={isLastOdd ? "w-full" : "w-full"}>
                   <ResultCard res={res} idx={idx} />
                 </div>
               </div>
             );
           })}
        </div>


        {/* Dashboard Actions */}
        <div className="w-full max-w-full sm:max-w-[353px] flex flex-col gap-4 mt-auto mb-10">
          <motion.button
            whileHover={isDownloading ? undefined : { scale: 1.02 }}
            whileTap={isDownloading ? undefined : { scale: 0.98 }}
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className={`w-full h-[61px] ${isDownloading ? "bg-white/20 cursor-not-allowed" : "bg-figma-gradient hover:shadow-[0_0_30px_rgba(124,77,255,0.4)]"} rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] flex items-center justify-center gap-3 transition-all`}
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

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              resetProject();
              resetGeneration();
              router.push("/");
            }}
            className="w-full h-[61px] border border-white/10 rounded-full flex items-center justify-center gap-3 bg-transparent transition-colors text-white font-semibold text-lg"
          >
            Create New Project
          </motion.button>
        </div>

        {/* Global Footer */}
        <div className="w-full mt-24">
          <Footer />
        </div>
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
