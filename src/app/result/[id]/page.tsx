"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Share2, RefreshCw, ZoomIn, Maximize, AlertCircle, Camera, PlayCircle, Download, Plus } from "lucide-react";
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
          {/* Main Image View */}
          <div className="relative w-full aspect-[353/441] rounded-[24px] overflow-hidden border border-white/10 bg-[#1A1E29] group shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-4">
            <Image 
              src={job.outputImage!} 
              alt="AI Generated Fashion Image" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              unoptimized
            />
            
            <div className="absolute right-4 bottom-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="w-[42px] h-[42px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                <ZoomIn className="w-[18px] h-[18px] text-white" />
              </button>
              <button className="w-[42px] h-[42px] rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/60 transition-colors">
                <Maximize className="w-[18px] h-[18px] text-white" />
              </button>
            </div>
          </div>

          {/* Carousel Pagination */}
          <div className="flex gap-2 mb-10">
            {[0, 1, 2].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${activeView === i ? "w-8 bg-[#7C4DFF]" : "w-1.5 bg-white/20"}`}
                onClick={() => setActiveView(i)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="w-full grid grid-cols-2 gap-4 mb-6">
            <button 
              onClick={() => router.push(`/result/${jobId}/views`)}
              className="h-[64px] rounded-[20px] border border-white/10 bg-[#121212]/50 flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-[#E2E2E8]"
            >
              <Camera className="w-[20px] h-[20px] text-[#A52FFF]" />
              <span className="font-roboto font-semibold text-[15px]">More Angles</span>
            </button>
            <button 
              onClick={() => router.push(`/result/${jobId}/video-style`)}
              className="h-[64px] rounded-[20px] border border-white/10 bg-[#121212]/50 flex items-center justify-center gap-3 hover:bg-white/5 transition-all text-[#E2E2E8]"
            >
              <PlayCircle className="w-[20px] h-[20px] text-[#A52FFF]" />
              <span className="font-roboto font-semibold text-[15px]">Create Video</span>
            </button>
          </div>

          <div className="w-full flex flex-col gap-4 mb-20">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="w-full h-[61px] bg-figma-gradient rounded-[100px] shadow-[0_10px_40px_rgba(124,77,255,0.4)] flex items-center justify-center gap-2 font-roboto font-semibold text-[18px] text-white"
            >
              <Download className="w-5 h-5" /> Download All
            </motion.button>
            
            <Link href="/" className="w-full">
              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full h-[61px] border border-[#424754] rounded-[100px] flex items-center justify-center font-roboto font-semibold text-[18px] text-[#E2E2E8] transition-colors"
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
