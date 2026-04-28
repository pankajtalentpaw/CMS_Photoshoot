"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { Play, Download, Share2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function VideoResultPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsProcessing(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Results" />

      <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Progress Dots */}
        <div className="w-full flex gap-2 mb-8 items-center justify-center">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div 
              key={step} 
              className={`h-1 w-full rounded-full transition-all duration-500 ${
                step <= 5 ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899]" : "bg-white/10"
              } ${step === 6 ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899] w-[80%]" : ""}`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div 
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20 w-full"
            >
              <div className="relative w-24 h-24 mb-10">
                <div className="absolute inset-0 rounded-full border-4 border-[#7C4DFF]/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-4 border-[#7C4DFF] border-t-transparent animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-center bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                Rendering Animation...
              </h2>
              <p className="text-white/50 text-center max-w-xs">
                Our AI is processing the fabric physics and lighting for your video.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full"
            >
              {/* Video Result Container (Rectangle 27) with Glow Border */}
              <div className="relative w-full max-w-[353px] aspect-[353/558] p-[2px] rounded-[12px] bg-gradient-to-b from-[#00C2FF] via-[#7C4DFF] to-[#FF00C7] shadow-[0_0_30px_rgba(124,77,255,0.3)] mb-8">
                <div className="relative w-full h-full rounded-[10px] overflow-hidden bg-[#1A1E29] group">
                  <Image 
                    src="/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg" 
                    alt="Video Preview" 
                    fill 
                    className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  
                  {/* Large Center Play Icon (Matches Figma 16-11) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-[64px] h-[64px] rounded-full bg-figma-gradient flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20"
                    >
                      <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </motion.button>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 py-2 px-3 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-white/70">MP4 • 4K Result</span>
                      <span className="text-[10px] font-mono text-white/50">0:05</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full mb-20">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/result/${jobId}/final`)}
                  className="w-full h-[61px] bg-figma-gradient rounded-[100px] shadow-[0_10px_40px_rgba(124,77,255,0.4)] flex items-center justify-center font-roboto font-semibold text-[18px] text-white"
                >
                  Approve & Continue
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
