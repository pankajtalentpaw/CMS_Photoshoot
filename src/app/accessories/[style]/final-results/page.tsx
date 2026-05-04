"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import { Download, Play, RefreshCcw, X, Camera, Video, ChevronLeft, ChevronRight, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGeneration } from "@/frontend/context/GenerationContext";

type ResultItem = {
  title: string;
  image: string;
  isVideo: boolean;
  videoUrl?: string;
};

export default function AccessoriesResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentProject, resetProject } = useProject();
  const { resetGeneration } = useGeneration();
  const styleParam = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";
  
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [activeView, setActiveView] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const results: ResultItem[] = [
    ...(currentProject?.primeImage ? [{ title: "Prime Render", image: currentProject.primeImage, isVideo: false }] : []),
    ...(currentProject?.outputViews?.map((v: any, i: number) => ({
      title: currentProject.generatedViewLabels?.[i] || v.style || `Style ${i+1}`,
      image: v.url || v,
      isVideo: false
    })) || []),
    ...(currentProject?.videoUrl ? [{ title: "Motion Synthesis", image: currentProject?.primeImage || "", videoUrl: currentProject.videoUrl, isVideo: true }] : []),
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
      saveAs(content, `Accessories_${styleParam.replace(/\s+/g, "_")}_results.zip`);
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to create download pack. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 pb-20 flex flex-col items-center">
        <ProgressStepper currentStep={6} partialStep={false} />

        {/* Carousel View */}
        <div className="relative w-full aspect-[353/441] rounded-[24px] overflow-hidden border border-white/10 bg-[#1A1E29] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mt-10 mb-6 group max-w-[353px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full"
            >
              <Image 
                src={results[activeView]?.image || ""} 
                alt={results[activeView]?.title || ""} 
                fill 
                className="object-cover"
                priority
                unoptimized
              />
              {results[activeView]?.isVideo && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-[64px] h-[64px] rounded-full bg-gradient-to-br from-[#00A3FF] to-[#D100FF] flex items-center justify-center shadow-lg">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {results.length > 1 && (
            <>
              <button 
                onClick={() => setActiveView(prev => Math.max(0, prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button 
                onClick={() => setActiveView(prev => Math.min(results.length - 1, prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}
        </div>

        {/* Carousel Pagination dots */}
        <div className="flex gap-2 mb-10">
          {results.map((_, i) => (
            <div 
              key={i} 
              onClick={() => setActiveView(i)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeView === i 
                  ? "w-8 bg-gradient-to-r from-[#00A3FF] to-[#D100FF]" 
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-[353px] flex gap-3 mb-6">
          <button 
            onClick={() => router.push(`/accessories/${styleParam}/views?product=${product}`)}
            className="flex-1 h-[61px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#E2E2E8]"
          >
            <Camera className="w-[18px] h-[18px]" />
            <span className="font-roboto font-bold text-[14px]">More Angles</span>
          </button>
          <button 
            onClick={() => router.push(`/accessories/${styleParam}/video-style?product=${product}`)}
            className="flex-1 h-[61px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#E2E2E8]"
          >
            <PlayCircle className="w-[18px] h-[18px]" />
            <span className="font-roboto font-bold text-[14px]">Create Video</span>
          </button>
        </div>

        <div className="w-full max-w-[353px] flex flex-col gap-4">
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="w-full h-[61px] bg-gradient-to-r from-[#00A3FF] to-[#D100FF] rounded-full flex items-center justify-center gap-3 text-white font-bold text-[18px] shadow-[0_10px_40px_rgba(0,163,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isDownloading ? (
              <RefreshCcw className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Download All
          </button>

          <button
            onClick={() => {
              resetProject();
              resetGeneration();
              router.push("/");
            }}
            className="w-full h-[61px] bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white font-bold text-[18px] hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            Create New Project
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
