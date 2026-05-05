"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { Play, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProject } from "@/frontend/context/ProjectContext";
import VideoPreviewModal from "@/frontend/components/VideoPreviewModal";

import ProgressStepper from "@/frontend/components/ProgressStepper";

export default function VideoResultPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const style = (params.style as string) || "ethnic-wear";

  const { currentProject } = useProject();
  const videoUrl = currentProject?.videoUrl || null;
  const posterUrl = currentProject?.primeImage || undefined;

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !videoUrl) {
      router.replace(`/apparel/${segment}/${style}/video-style`);
    }
  }, [router, segment, style, videoUrl, mounted]);

  if (!mounted) {
    return (
      <div className="relative min-h-screen bg-black text-white font-roboto">
        <FlowHeader title="Video Results" />
        <main className="w-full max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
          <div className="w-full max-w-[380px] aspect-[9/16] bg-white/5 animate-pulse rounded-[32px]" />
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Video Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 pb-20 flex flex-col items-center">
        <ProgressStepper currentStep={5} partialStep={false} />

        {/* Video Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          onClick={() => setIsPreviewOpen(true)}
          className="relative w-full max-w-full sm:max-w-[380px] aspect-[9/16] p-[1px] bg-white/10 rounded-[32px] group cursor-pointer mt-12 mb-14 shadow-2xl hover:shadow-[#7C4DFF]/20 transition-all duration-500"
        >
          <div className="relative w-full h-full bg-[#050505] rounded-[31px] overflow-hidden border border-white/5">
            {videoUrl ? (
              <div className="absolute inset-0">
                <video
                  src={videoUrl}
                  poster={posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Interaction Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Corner Indicator */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white/20" />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Button */}
        <div className="w-full max-w-full sm:max-w-[380px] flex flex-col gap-4">
          <Link href={`/apparel/${segment}/${style}/final-results`} className="w-full">
            <motion.button 
              whileHover={{ scale: 1.02, y: -2 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full h-[64px] bg-gradient-to-r from-[#00A3FF] to-[#D100FF] rounded-full shadow-[0_15px_35px_rgba(0,163,255,0.3)] flex items-center justify-center group"
            >
              <span className="font-bold text-[18px] text-white">Approve & Continue</span>
            </motion.button>
          </Link>
          <p className="text-center text-[11px] text-[#9CA3AF] uppercase tracking-widest font-medium">Click video to preview full quality</p>
        </div>

        <VideoPreviewModal 
          isOpen={isPreviewOpen} 
          onClose={() => setIsPreviewOpen(false)} 
          videoUrl={videoUrl}
          posterUrl={posterUrl}
        />
      </main>
      <Footer />
    </div>
  );
}
