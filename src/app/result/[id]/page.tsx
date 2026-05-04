"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Share2, RefreshCw, ZoomIn, Maximize, AlertCircle, Camera, PlayCircle, Download, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProtectedRoute from "@/frontend/components/ProtectedRoute";
import { useProject } from "@/frontend/context/ProjectContext";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Link from "next/link";

export default function GenerationResultPage() {
  const params = useParams();
  const jobId = params.id as string;

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 flex flex-col">
        <FlowHeader title="Results" />
        <main className="w-full flex-1 max-w-[393px] mx-auto pt-[120px] px-5 flex flex-col items-center">
          <ProgressStepper currentStep={7} />
          <ResultContent jobId={jobId} />
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

function ResultContent({ jobId }: { jobId: string }) {
  const router = useRouter();
  const { currentProject, setProjectData } = useProject();
  const [job, setJob] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    let isFinished = false;
    let intervalId: NodeJS.Timeout | null = null;

    const poll = async () => {
      try {
        const res = await fetch(`/api/status?jobId=${jobId}`);
        if (!res.ok) {
          if (res.status === 404 || res.status >= 500) return;
          throw new Error("Failed to fetch status");
        }
        
        const data = await res.json();
        setJob(data);

        if (data.status === "completed" && data.outputImage) {
          setProjectData({ ...(currentProject || {}), primeImage: data.outputImage });
          isFinished = true;
          if (intervalId) clearInterval(intervalId);
        } else if (data.status === "failed") {
          setError(data.error || "Generation failed.");
          isFinished = true;
          if (intervalId) clearInterval(intervalId);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
      }
    };

    poll().then(() => {
      if (!isFinished) {
        intervalId = setInterval(poll, 3000);
      }
    });

    return () => {
      if (intervalId) clearInterval(intervalId);
    };  }, [jobId, setProjectData]);

  const isProcessing = !job || job.status === "pending" || job.status === "processing";
  const isFailed = job?.status === "failed" || error;

  const handleDownload = () => {
    if (!job?.outputImage) return;
    const link = document.createElement('a');
    link.href = job.outputImage;
    link.download = `digital-atelier-result-${jobId.slice(0, 5)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence mode="wait">
      {isProcessing ? (
        <motion.div 
          key="loading"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="flex flex-col items-center py-20 w-full"
        >
          <div className="relative w-24 h-24 mb-10">
            <div className="absolute inset-0 rounded-full border-4 border-white/5 animate-pulse" />
            <Loader2 className="w-full h-full text-[#A52FFF] animate-spin" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white via-[#CB87FF] to-white bg-clip-text text-transparent animate-gradient text-center">
            Generating your Masterpiece...
          </h2>
          <p className="text-[#99A1AF] text-center max-w-sm">
            Our AI is meticulously crafting your {job?.outputStyle || "premium"} image.
          </p>
          
          <div className="w-full h-1 bg-white/5 rounded-full mt-10 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#7C4DFF] to-[#A52FFF]"
              initial={{ width: "0%" }}
              animate={{ width: "90%" }}
              transition={{ duration: 15, ease: "linear" }}
            />
          </div>
        </motion.div>
      ) : isFailed ? (
        <motion.div 
          key="failed"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center py-12 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Generation Failed</h2>
          <p className="text-[#99A1AF] mb-8">{job?.error || error || "The AI model encountered an error."}</p>
          <button 
            onClick={() => router.back()}
            className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      ) : (
        <motion.div 
          key="completed"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center w-full"
        >
          {/* Carousel View */}
          <div className="relative w-full aspect-[353/441] rounded-[24px] overflow-hidden border border-white/10 bg-[#1A1E29] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 group">
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
                  src={(currentProject?.outputViews?.[activeView] || job.outputImage)!} 
                  alt={`AI Generated View ${activeView + 1}`} 
                  fill 
                  className="object-cover"
                  priority
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows (Optional, but good for UX) */}
            {(currentProject?.outputViews?.length || 0) > 1 && (
              <>
                <button 
                  onClick={() => setActiveView(prev => Math.max(0, prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => setActiveView(prev => Math.min((currentProject?.outputViews?.length || 1) - 1, prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Carousel Pagination dots */}
          <div className="flex gap-2 mb-10">
            {(currentProject?.outputViews?.length ? currentProject.outputViews : [0, 1, 2]).map((_, i) => (
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
          <div className="w-full flex gap-3 mb-6">
            <button 
              onClick={() => router.push(`/result/${jobId}/views`)}
              className="flex-1 h-[61px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#E2E2E8]"
            >
              <Camera className="w-[18px] h-[18px]" />
              <span className="font-roboto font-bold text-[14px]">More Angles</span>
            </button>
            <button 
              onClick={() => router.push(`/result/${jobId}/video-style`)}
              className="flex-1 h-[61px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#E2E2E8]"
            >
              <PlayCircle className="w-[18px] h-[18px]" />
              <span className="font-roboto font-bold text-[14px]">Create Video</span>
            </button>
          </div>

          <div className="w-full flex flex-col gap-4 mb-20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="w-full h-[61px] bg-gradient-to-r from-[#00A3FF] to-[#D100FF] rounded-full shadow-[0_10px_40px_rgba(0,163,255,0.3)] flex items-center justify-center gap-3 font-roboto font-bold text-[18px] text-white"
            >
              <Download className="w-5 h-5" /> Download All
            </motion.button>
            
            <Link href="/" className="w-full">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[61px] border border-white/10 bg-white/5 rounded-full flex items-center justify-center font-roboto font-bold text-[18px] text-[#E2E2E8] transition-colors"
              >
                Create New Project
              </motion.button>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
