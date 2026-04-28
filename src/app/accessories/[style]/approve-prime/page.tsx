"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Footer from "@/frontend/components/Footer";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useRecentBranch } from "@/frontend/hooks/useRecentBranch";
import { MessageSquare, Check, RefreshCcw, X, Sparkles, AlertCircle } from "lucide-react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function AccessoriesApprovePrimePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const style = (params.style as string) || "bags";
  const product = searchParams.get("product") || "Handbag";

  const [showTextBox, setShowTextBox] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isRegenerateMode, setIsRegenerateMode] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const { currentProject, setProjectData, spendCredits } = useProject();
  const { status, outputImage, error, generate, reset } = useGenerationPolling();

  useRecentBranch(`Accessories ${style}`, `/accessories/${style}`);

  const isGenerating = status === "submitting" || status === "polling";
  const isFailed = status === "failed";

  const feedbackChips = ["Better Lighting", "Clearer Texture", "Natural Shadow", "Correct Proportion", "Premium Shine", "Studio Finish"];
  const chipPrompts: Record<string, string> = {
    "Better Lighting": "Remapping photons for high-fidelity studio diffusion...",
    "Clearer Texture": "Enhancing micro-textural resolution and grain fidelity...",
    "Natural Shadow": "Recalculating contact shadows and ambient occlusion...",
    "Correct Proportion": "Adjusting focal length and lens distortion for accuracy...",
    "Premium Shine": "Adding cinematic specular highlights and high-end luster...",
    "Studio Finish": "Optimizing background exposure for a clean marketplace look..."
  };

  const buildPayload = (chips: string[] = [], note = "") => ({
    garmentImageUrl: currentProject?.garmentImageUrl || currentProject?.productImageUrl || "",
    modelImageUrl: currentProject?.modelImageUrl || currentProject?.garmentImageUrl || "",
    mode: "AI Studio" as const,
    hub: "Accessories" as const,
    accessoryType: style.charAt(0).toUpperCase() + style.slice(1),
    style: currentProject?.styleId || "Catalog",
    background: currentProject?.backgroundId || "Studio White",
    outputFormat: "single" as const,
    outputCount: 1,
    category: product,
    prompt: [chips.join(", "), note].filter(Boolean).join(". "),
  });

  useEffect(() => {
    const p = buildPayload();
    if (p.garmentImageUrl) generate(p);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (status === "completed" && outputImage) {
      setProjectData({ ...(currentProject || {}), primeImage: outputImage });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, outputImage]);

  const handleApprove = async () => {
    if (!spendCredits(5)) { alert("Insufficient credits."); return; }
    setIsApproving(true);
    await new Promise(r => setTimeout(r, 600));
    router.push(`/accessories/${style}/views?product=${product}`);
  };

  const handleRegenerate = () => {
    reset();
    setIsRegenerateMode(false);
    setFeedback([]);
    generate(buildPayload(feedback, customNote));
  };

  const displayImage = outputImage || currentProject?.primeImage || null;

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white">
      <FlowHeader title="Approve Asset" />
      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        <ProgressStepper currentStep={7} />
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="gen" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-8"
            >
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-[#7C4DFF] rounded-full animate-spin" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Generating Prime Asset...</h2>
                <p className="text-[#99A1AF]">Preserving detail and texture for {product}</p>
              </div>
            </motion.div>
          ) : isFailed ? (
            <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-6"
            >
              <AlertCircle className="w-16 h-16 text-red-400" />
              <p className="text-red-400 text-center max-w-xs">{error || "Generation failed."}</p>
              <button onClick={handleRegenerate}
                className="h-[48px] px-8 rounded-full bg-[#7C4DFF]/20 border border-[#7C4DFF]/40 text-[#7C4DFF] font-medium flex items-center gap-2"
              ><RefreshCcw className="w-4 h-4" /> Retry</button>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="w-full flex flex-col items-center py-10"
            >
              <div
                onDoubleClick={() => setShowFullPreview(true)}
                onTouchStart={() => { longPressTimer.current = setTimeout(() => setShowFullPreview(true), 500); }}
                onTouchEnd={() => { if (longPressTimer.current) clearTimeout(longPressTimer.current); }}
                className="relative w-full max-w-full sm:max-w-[353px] aspect-square rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(124,77,255,0.2)] border border-white/10 mb-10 group cursor-zoom-in transition-all"
              >
                {displayImage ? (
                  <Image src={displayImage} alt="Generated Prime" fill className="object-cover transition-transform group-hover:scale-105" priority unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Sparkles className="w-10 h-10 text-[#7C4DFF]/40 animate-pulse" />
                  </div>
                )}
                <AnimatePresence>
                  {feedback.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="absolute inset-x-4 bottom-4 bg-[#7C4DFF]/90 backdrop-blur-md p-3 rounded-xl border border-white/20 z-10"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold uppercase text-white tracking-widest">AI Directive Engine</span>
                      </div>
                      <p className="text-[11px] text-white/90">{chipPrompts[feedback[feedback.length - 1]] || "Refining visual pipeline..."}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-full max-w-full sm:max-w-md flex flex-col gap-4 mb-10">
                <LoadingActionButton isLoading={isApproving} onClick={handleApprove}
                  className="w-full h-[61px] rounded-full text-[18px] font-bold"
                  icon={<Check className="w-5 h-5" />} disabled={!displayImage}
                >Approve and Continue</LoadingActionButton>
                {!isRegenerateMode && (
                  <button onClick={() => setIsRegenerateMode(true)} className="text-[#7C4DFF] text-sm font-medium hover:underline">
                    Not happy with the result?
                  </button>
                )}
              </div>

              <AnimatePresence>
                {isRegenerateMode && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="w-full max-w-full sm:max-w-[353px] overflow-hidden"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-roboto font-semibold text-base text-white">Refine & Regenerate</h3>
                      <button onClick={() => setShowTextBox(!showTextBox)} className="flex items-center gap-1 text-[#7C4DFF] text-xs font-medium">
                        <Check className="w-3 h-3" /> {showTextBox ? "Hide Note" : "Add Note"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {feedbackChips.map(chip => (
                        <button key={chip} onClick={() => setFeedback(p => p.includes(chip) ? p.filter(c => c !== chip) : [...p, chip])}
                          className={`px-4 py-2 rounded-full border text-[11px] font-medium transition-all ${feedback.includes(chip)
                            ? "bg-figma-gradient border-transparent text-white" : "bg-white/5 border-white/10 text-[#C2C6D6] hover:border-white/20"}`}
                        >{chip}</button>
                      ))}
                    </div>
                    <AnimatePresence>
                      {showTextBox && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                          <textarea value={customNote} onChange={e => setCustomNote(e.target.value)}
                            placeholder="E.g. Focus on the leather grain details..."
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#7C4DFF] outline-none placeholder:text-[#C2C6D6]/40 resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button onClick={handleRegenerate}
                      className="w-full h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 text-[#7C4DFF] font-bold text-sm mb-20"
                    ><RefreshCcw className="w-4 h-4" /> Regenerate</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showFullPreview && displayImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowFullPreview(false)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-5 cursor-zoom-out"
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <Image src={displayImage} alt="Full Preview" fill className="object-contain bg-black/50" unoptimized />
              <div className="absolute top-6 right-6 p-4">
                <button className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 border border-white/10">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
