"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useProject } from "@/frontend/context/ProjectContext";

export default function VideoResultPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const style = (params.style as string) || "ethnic-wear";

  const { currentProject } = useProject();
  const videoUrl = currentProject?.videoUrl || null;
  const posterUrl = currentProject?.primeImage || undefined;

  useEffect(() => {
    if (!videoUrl) {
      router.replace(`/apparel/${segment}/${style}/video-style`);
    }
  }, [router, segment, style, videoUrl]);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Video Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        <div className="flex gap-2 mb-8 mt-2">
          {[1, 2, 3, 4, 5, 6].map((dot) => (
            <div key={dot} className={`h-1 w-8 rounded-full ${dot <= 5 ? "bg-[#7C4DFF]" : "bg-white/10"}`} />
          ))}
        </div>

        {/* Video Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
          className="relative w-full max-w-full sm:max-w-[353px] aspect-[353/558] p-[2px] bg-figma-gradient rounded-[12px] group cursor-pointer mb-10 shadow-[0_0_50px_rgba(124,77,255,0.2)]"
        >
          <div className="relative w-full h-full bg-[#1A1E29] rounded-[10px] overflow-hidden">
            {videoUrl ? (
              <>
                <video
                  src={videoUrl}
                  poster={posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-opacity">
                  <div className="w-[60px] h-[60px] rounded-full bg-figma-gradient flex items-center justify-center shadow-[0_0_20px_rgba(124,77,255,0.5)]">
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#1A1E29]">
                <div className="w-[60px] h-[60px] rounded-full bg-figma-gradient flex items-center justify-center shadow-[0_0_20px_rgba(124,77,255,0.5)]">
                  <Play className="w-8 h-8 text-white fill-white ml-1" />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Final Actions */}
        <div className="w-full max-w-full sm:max-w-[353px] flex flex-col gap-4 mb-10">
          <Link href={`/apparel/${segment}/${style}/final-results`} className="w-full">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] flex items-center justify-center"
            >
              <span className="font-roboto font-semibold text-lg text-white">Approve & Continue</span>
            </motion.button>
          </Link>
        </div>

        <div className="w-full mt-20">
          <Footer />
        </div>
      </main>
    </div>
  );
}
