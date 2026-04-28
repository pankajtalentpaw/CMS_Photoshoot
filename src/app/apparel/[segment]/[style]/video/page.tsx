"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import VideoStyleCard from "@/frontend/components/VideoStyleCard";
import Footer from "@/frontend/components/Footer";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Film, Sparkles, RefreshCcw } from "lucide-react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function VideoStylePage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "Ladies";
  const styleParam = (params.style as string) || "Ethnic Wear";

  const { currentProject, setProjectData } = useProject();
  const { status, outputVideo, error, generate, reset } = useGenerationPolling();

  const [selectedVideoStyle, setSelectedVideoStyle] = useState<string>("Straight Walk");
  const [customPrompt, setCustomPrompt] = useState("");

  const isGenerating = status === "submitting" || status === "polling";
  const isCompleted = status === "completed";

  // Use the dynamic prime image for all style previews
  const primeImage = currentProject?.primeImage || "/assets/placeholder-fashion.jpg";

  const videoStyles = [
    { 
      title: "Straight Walk", 
      image: primeImage, 
      desc: "Classic runway walk directly towards camera.",
      storyboard: [primeImage, primeImage, primeImage]
    },
    { 
      title: "Slow Turn", 
      image: primeImage, 
      desc: "360-degree rotation to show all garment angles.",
      storyboard: [primeImage, primeImage, primeImage]
    },
    { 
      title: "Elegant Reveal", 
      image: primeImage, 
      desc: "Soft pan up from feet to head with pose change.",
      storyboard: [primeImage, primeImage, primeImage]
    },
    { 
      title: "Fabric Flow", 
      image: primeImage, 
      desc: "Focus on cloth movement and physics." 
    },
  ];

  // When video generation completes, save to context and navigate
  useEffect(() => {
    if (isCompleted && outputVideo) {
      setProjectData({
        ...(currentProject || {}),
        videoUrl: outputVideo,
      });
      router.push(`/apparel/${segment}/${styleParam}/video/result`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, outputVideo]);

  const handleGenerateVideo = () => {
    if (!primeImage) return;
    
    reset();
    generate({
      garmentImageUrl: primeImage, // Use prime image as source for I2V
      modelImageUrl: currentProject?.modelImageUrl || "",
      mode: "VIDEO_GENERATION",
      hub: "Apparel",
      segment: segment,
      wearType: styleParam,
      videoStyle: selectedVideoStyle,
      prompt: customPrompt,
    });
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Motion Treatment" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={10} />

        {/* Generating Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center gap-8"
            >
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 border-4 border-[#7C4DFF]/20 rounded-full" />
                <motion.div 
                  className="absolute inset-0 border-4 border-t-[#7C4DFF] rounded-full"
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }} 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Film className="w-10 h-10 text-[#7C4DFF] animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2 font-manrope italic">AI is Animating Your Look</h2>
                <p className="text-[#C2C6D6] text-base animate-pulse">Running Seedance 1.0 motion pipeline...</p>
                <div className="mt-4 px-6 py-2 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#7C4DFF]">
                    {selectedVideoStyle} • 4K Cinematic
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-roboto font-semibold text-[36px] leading-[45px] text-[#E2E2E8] tracking-[-0.9px]"
          >
            Video Storyboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="font-roboto font-normal text-[16px] leading-[19px] text-[#C2C6D6] mt-2"
          >
            Select a motion preset for your AI animation
          </motion.p>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={handleGenerateVideo} className="ml-auto text-red-400 text-sm underline flex items-center gap-1">
              <RefreshCcw className="w-3 h-3" /> Retry
            </button>
          </motion.div>
        )}

        {/* Video Animation Style Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
          {videoStyles.map((vs, idx) => (
            <VideoStyleCard
              key={idx}
              title={vs.title}
              image={vs.image}
              storyboard={vs.storyboard}
              selected={selectedVideoStyle === vs.title}
              onClick={() => setSelectedVideoStyle(vs.title)}
            />
          ))}
        </div>

        {/* AI Custom Prompt Section */}
        <section className="mt-16 max-w-2xl">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <button className="h-[36px] px-5 border border-[#424754] rounded-full bg-white/5">
                <span className="font-roboto font-semibold text-sm text-[#E2E2E8]">
                  Use Prompt
                </span>
              </button>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF6464]" />
                <span className="font-roboto font-normal text-[12px] leading-[14px] text-[#FF6565]">
                  Custom prompts may vary. Use at your own risk
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
                AI Custom
              </h2>
              <span className="font-roboto font-semibold text-xs leading-[14px] text-[#C5B6DE]">
                (Optional)
              </span>
            </div>
          </div>

          <div className="relative group">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full h-[95px] bg-black/30 border border-white/20 rounded-[10px] p-4 font-roboto text-sm focus:border-[#7C4DFF] focus:ring-1 focus:ring-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
              placeholder="E.g. Focus on the fabric movement, add slow cinematic pan..."
            />
          </div>
        </section>

        {/* Generate Button */}
        <div className="w-full mt-10 mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <button 
              onClick={handleGenerateVideo}
              disabled={isGenerating || !primeImage}
              className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="font-roboto font-semibold text-lg leading-[21px] text-white text-center">
                {isGenerating ? "Processing..." : "Generate Video"}
              </span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
