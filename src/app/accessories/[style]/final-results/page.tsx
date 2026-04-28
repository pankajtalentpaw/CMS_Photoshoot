"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import { Download, Share2, CornerUpRight, Image as ImageIcon, CheckCircle2, RefreshCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import StackedImagePreview from "@/frontend/components/StackedImagePreview";
import { useProject } from "@/frontend/context/ProjectContext";

export default function AccessoriesResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { currentProject } = useProject();
  const style = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeItem, setActiveItem] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const results = [
    ...(currentProject?.primeImage ? [{ id: 1, type: "Prime", image: currentProject.primeImage, isVideo: false }] : []),
    ...(currentProject?.outputViews?.map((v: any, i: number) => ({
      id: i + 2,
      type: currentProject.generatedViewLabels?.[i] || v.style || `Style ${i+1}`,
      image: v.url || v,
      isVideo: false
    })) || []),
    ...(currentProject?.videoUrl ? [{ id: 4, type: "Category Pan (Video)", image: currentProject?.primeImage || "", videoUrl: currentProject.videoUrl, isVideo: true }] : []),
  ];

  const handleDownloadAll = async () => {
    if (!results || results.length === 0) return;
    try {
      setIsDownloading(true);
      const zip = new JSZip();
      
      const promises = results.map(async (res: any, idx) => {
        const urlToFetch = res.videoUrl || res.image;
        if (!urlToFetch) return;

        const proxyUrl = `/api/proxy?url=${encodeURIComponent(urlToFetch)}`;
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error(`Failed to fetch ${res.type}`);
        
        const blob = await response.blob();
        
        let ext = res.isVideo ? "mp4" : "png";
        if (blob.type === "image/jpeg") ext = "jpg";
        else if (blob.type === "image/webp") ext = "webp";
        
        const filename = `${res.type.replace(/\s+/g, "_")}_${idx + 1}.${ext}`;
        zip.file(filename, blob);
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${style.replace(/\s+/g, "_")}_results.zip`);
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to create download pack. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const ResultCard = ({ res, idx }: { res: typeof results[0], idx: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      className="group relative flex flex-col gap-4 cursor-zoom-in"
      onClick={() => setActiveItem(res)}
    >
      <div className="relative aspect-[1/1.2] rounded-2xl overflow-hidden shadow-2xl border border-white/5 bg-[#1A1E29]">
        <Image 
          src={res.image} 
          alt={res.type} 
          fill 
          className="object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/10">
          {res.type}
        </div>
        
        {res.isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg">
              <span className="sr-only">Play Video</span>
              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="text-xs text-[#99A1AF] hover:text-white flex items-center gap-1 font-medium">
          <ImageIcon className="w-3 h-3" />
          View High-res
        </button>
        <button className="text-xs text-[#7C4DFF] font-bold flex items-center gap-1 hover:underline">
          <CornerUpRight className="w-3 h-3" />
          Export to Store
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0 font-roboto">
      <FlowHeader title="Generation Results" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <ProgressStepper currentStep={11} />

        {/* Header Section */}
        <section className="mt-8 mb-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-[#00E676]" />
              <h1 className="text-3xl lg:text-4xl font-bold text-white">Photoshoot Complete!</h1>
            </div>
            <p className="text-[#99A1AF]">Your high-fidelity assets are ready for export.</p>
          </motion.div>
          
          <div className="flex gap-4">
            <button className="flex-1 lg:flex-none h-12 px-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all font-medium">
              <Share2 className="w-4 h-4" />
              <span>Share Pack</span>
            </button>
            <button 
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className={`flex-1 lg:flex-none h-12 px-6 rounded-full ${isDownloading ? "bg-white/20 cursor-not-allowed" : "bg-figma-gradient hover:shadow-[0_0_20px_rgba(124,77,255,0.4)]"} flex items-center justify-center gap-2 transition-all font-semibold`}
            >
              {isDownloading ? (
                <RefreshCcw className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-white" />
              )}
              <span>{isDownloading ? "Downloading..." : "Download All"}</span>
            </button>
          </div>
        </section>

        {/* Stacked Fan Preview (Rule 6.10 Style Enhancement) */}
        <div className="w-full flex justify-center mb-12">
           <StackedImagePreview images={results.map(r => r.image)} />
        </div>

        {/* Results Sections Grouped by Type (Rule 6.10) */}
        <div className="w-full flex flex-col gap-12 mb-20">
          {/* Images Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-white">Image Assets</h3>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 min-h-[220px]">
              {isMounted && results.filter(r => !r.isVideo).map((res, idx) => (
                <ResultCard key={res.id} res={res} idx={idx} />
              ))}
            </div>
          </section>

          {/* Videos Section (Step 10) */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <h3 className="text-xl font-bold text-white">Motion Synthesis (Step 10)</h3>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {isMounted && results.filter(r => r.isVideo).map((res, idx) => (
                <ResultCard key={res.id} res={res} idx={idx} />
              ))}
            </div>
          </section>
        </div>

        <Footer />
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
              <h3 className="text-xl font-bold text-white mb-1">{activeItem.type}</h3>
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
