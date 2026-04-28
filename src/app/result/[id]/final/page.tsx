"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { Download, Play, X, Share2, Plus, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useProject } from "@/frontend/context/ProjectContext";

export default function FinalResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { currentProject } = useProject();
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const views = currentProject?.outputViews || [];
  const video = currentProject?.finalVideo;

  const results = [
    ...views.map((v: string, i: number) => ({ title: `View ${i + 1}`, image: v, isVideo: false, url: v })),
    ...(video ? [{ 
      title: "Cinematic Video", 
      image: currentProject?.primeImage || views[0] || "/assets/placeholder-view.jpg", 
      isVideo: true, 
      url: video 
    }] : [])
  ];

  const handleDownloadAll = async () => {
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      const link = document.createElement('a');
      link.href = res.url;
      link.download = `digital-atelier-${res.title.toLowerCase().replace(/\s+/g, '-')}-${jobId.slice(0, 5)}.${res.isVideo ? 'mp4' : 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      // Small delay to prevent browser download blocking
      await new Promise(r => setTimeout(r, 400));
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 pb-20 lg:pb-0">
      <FlowHeader title="Final Editorial" />

      <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col items-center">
        <ProgressStepper currentStep={12} />

        {/* Heading Section */}
        <section className="mb-10 text-center mt-8">
          <h1 className="font-roboto font-semibold text-[32px] text-white mb-2">Project Complete</h1>
          <p className="text-[#C2C6D6] text-sm">Your AI-generated high-fashion assets are ready for distribution.</p>
        </section>

        {/* Results Grid */}
        <div className="w-full grid grid-cols-2 gap-x-4 gap-y-8 mb-16 px-1">
          {results.map((res: any, idx: number) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center gap-3 w-full"
              onClick={() => res.isVideo ? setActiveVideo(res.url) : setActiveImage(res.url)}
            >
              <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border border-white/5 bg-[#1A1E29] group shadow-xl transition-all cursor-zoom-in hover:border-[#7C4DFF]/50`}>
                <Image 
                  src={res.image} 
                  alt={res.title} 
                  fill 
                  className="object-cover transition-transform group-hover:scale-105 duration-700"
                  unoptimized
                />
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                  {res.isVideo ? (
                    <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  ) : (
                    <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                      <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                        <Maximize2 className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <span className={`font-roboto font-medium text-[13px] leading-[15px] ${res.isVideo ? "text-[#7C4DFF]" : "text-white"}`}>
                {res.title}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Action Dashboard */}
        <div className="w-full flex flex-col gap-4 mb-20 mt-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownloadAll}
            className="w-full h-[61px] bg-figma-gradient rounded-[100px] shadow-[0_10px_40px_rgba(124,77,255,0.4)] flex items-center justify-center gap-2 font-roboto font-semibold text-[18px] text-white"
          >
            <Download className="w-5 h-5" /> Download Pack
          </motion.button>
          
          <Link href="/" className="w-full">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] border border-[#424754] rounded-[100px] flex items-center justify-center font-roboto font-semibold text-[18px] text-[#E2E2E8] transition-colors"
            >
              Start New Project
            </motion.button>
          </Link>
        </div>
      </main>

      {/* Video Overlay Player */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-5"
          >
            <button 
              onClick={() => setActiveVideo(null)}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors z-[110]"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-[9/16] md:aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black"
            >
              <video 
                src={activeVideo} 
                autoPlay 
                controls 
                loop 
                className="w-full h-full object-contain"
              />
            </motion.div>
            <p className="mt-6 text-white/60 text-sm font-medium tracking-wide uppercase italic">
              AI Cinematic Synthesis • 4K Editorial
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Overlay */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-5 cursor-zoom-out"
            onClick={() => setActiveImage(null)}
          >
            <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors z-[110]">
              <X className="w-6 h-6 text-white" />
            </button>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl aspect-[3/4] md:aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <Image 
                src={activeImage} 
                alt="Preview" 
                fill 
                className="object-contain bg-black/40"
                unoptimized
              />
            </motion.div>
            <p className="mt-6 text-[#7C4DFF] text-[10px] font-bold uppercase tracking-[0.2em]">
              High-Fidelity AI Render • Marketplace Ready
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
