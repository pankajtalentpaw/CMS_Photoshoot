"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useProject } from "@/frontend/context/ProjectContext";

export default function ProductsVideoResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleParam = (params.style as string) || "home";
  const product = searchParams.get("product") || "Product";

  const { currentProject } = useProject();
  const videoUrl = currentProject?.videoUrl || null;
  const posterUrl = currentProject?.primeImage || undefined;

  useEffect(() => {
    if (!videoUrl) {
      router.replace(`/products/${styleParam}/video-style?product=${product}`);
    }
  }, [router, styleParam, product, videoUrl]);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
      <FlowHeader title="Video Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 pb-20 flex flex-col items-center">
        <ProgressStepper currentStep={5} partialStep={false} />

        {/* Video Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-full sm:max-w-[353px] aspect-[9/16] p-[2px] bg-figma-gradient rounded-[22px] group cursor-pointer mt-10 mb-12 shadow-[0_0_50px_rgba(124,77,255,0.2)]"
        >
          <div className="relative w-full h-full bg-[#0A0A0A] rounded-[20px] overflow-hidden">
            {videoUrl ? (
              <>
                <video
                  src={videoUrl}
                  poster={posterUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#FF00C7] flex items-center justify-center shadow-[0_0_30px_rgba(124,77,255,0.5)] transition-transform duration-300 group-hover:scale-110">
                    <Play className="w-10 h-10 text-white fill-white ml-1" />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0A0A0A]">
                <div className="w-[80px] h-[80px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  <Play className="w-10 h-10 text-white/20" />
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Button */}
        <div className="w-full max-w-full sm:max-w-[353px] flex flex-col gap-4 mb-10">
          <Link href={`/products/${styleParam}/final-results?product=${product}`} className="w-full">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              className="w-full h-[61px] bg-gradient-to-r from-[#00A3FF] to-[#D100FF] rounded-full shadow-[0_10px_30px_rgba(0,163,255,0.2)] flex items-center justify-center"
            >
              <span className="font-bold text-[18px] text-white">Approve & Continue</span>
            </motion.button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
