"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { Download, Share2, Play, Plus, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useProject } from "@/frontend/context/ProjectContext";

export default function JewelleryVideoResultPage() {
  const params = useParams();
  const { currentProject } = useProject();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Cinematic Result" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Success Header */}
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex items-center gap-3 mb-10"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
             <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-white">Motion Complete</h2>
            <p className="text-[#C2C6D6] text-sm">Your cinematic jewellery showcase is ready</p>
          </div>
        </motion.div>

        {/* Video Player Placeholder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-full sm:max-w-[353px] aspect-[9/16] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(124,77,255,0.2)] bg-[#1A1E29]"
        >
          {currentProject?.videoUrl ? (
            <video
              src={currentProject.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              {/* Using the prime image as the video thumbnail fallback */}
              <div className="absolute inset-0 grayscale-[0.2]">
                 <img
                   src={currentProject?.primeImage || "/indian-bride-9-2025-12-2fd0a5885b204639c8156089c6d2ebad-16x9.avif"}
                   alt="Jewellery Video Result"
                   className="w-full h-full object-cover"
                 />
              </div>

              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                 <div className="w-20 h-20 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center animate-pulse">
                    <Play className="w-8 h-8 text-white fill-white" />
                 </div>
              </div>
            </>
          )}

          {/* Video Metadata Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
             <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                <span className="text-[10px] font-bold text-[#7C4DFF] uppercase tracking-widest">Macro Shine Treatment</span>
                <h3 className="text-white font-bold text-base mt-0.5">Premium Editorial Motion</h3>
             </div>
          </div>
        </motion.div>

        {/* Action Buttons (aligned with main Results page) */}
        <div className="w-full max-w-full sm:max-w-[353px] flex flex-col gap-4 mt-10 mb-20">
           <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-[61px] bg-figma-gradient rounded-[16px] shadow-[0_10px_30px_rgba(124,77,255,0.3)] flex items-center justify-center gap-3"
          >
            <Download className="w-5 h-5 text-white" />
            <span className="font-semibold text-lg text-white">Export 4K Video</span>
          </motion.button>

          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.02)" }}
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] border border-white/10 rounded-[16px] flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5 text-[#E2E2E8]" />
              <span className="font-medium text-lg text-[#E2E2E8]">
                Create New Project
              </span>
            </motion.button>
          </Link>
        </div>

        <Footer />
      </main>
    </div>
  );
}
