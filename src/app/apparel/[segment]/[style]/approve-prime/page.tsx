"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Check, RefreshCcw, Sparkles, MessageSquare, X, AlertCircle, ZoomIn, Maximize } from "lucide-react";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGenerationPolling } from "@/hooks/useGenerationPolling";

export default function ApprovePrimeImagePage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const style = (params.style as string) || "ethnic-wear";

  const [isApproving, setIsApproving] = useState(false);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [showTextBox, setShowTextBox] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isRegenerateMode, setIsRegenerateMode] = useState(false);

  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const { currentProject, updateProject, spendCredits } = useProject();
  const { status, outputImage, error, generate, reset } = useGenerationPolling();
  const [hasBootstrappedGeneration, setHasBootstrappedGeneration] = useState(false);

  const isGenerating = status === "submitting" || status === "polling";
  const isCompleted = status === "completed";
  const isFailed = status === "failed";

  const feedbackChips = [
    "Better Drape", "Clearer Border", "Premium Studio Look", "Face More Natural", "Better Lighting", "More Catalog-Safe"
  ];

  const chipPrompts: Record<string, string> = {
    "Better Drape": "Enhancing fabric physics and natural gravitational folds...",
    "Clearer Border": "Sharpening embroidery edges and contrast markers...",
    "Premium Studio Look": "Adjusting studio lighting for high-end cinematic luster...",
    "Face More Natural": "Refining skin texture and realistic symmetric features...",
    "Better Lighting": "Remapping shadows for balanced 3-point studio lighting...",
    "More Catalog-Safe": "Increasing textural resolution on fine material patterns..."
  };

  const normalizeModelImageUrl = (value: string | undefined, fallback: string) => {
    if (value && (value.startsWith("http://") || value.startsWith("https://"))) {
      return value;
    }
    return fallback;
  };

  // Build the generation payload from project context + params
  const buildPayload = (chips: string[] = [], note = "") => {
    const baseProject = currentProject || {};
    const garmentUrl = baseProject.garmentImageUrl || baseProject.productImageUrl || "";
    return {
      garmentImageUrl: garmentUrl,
      modelImageUrl: normalizeModelImageUrl(baseProject.modelImageUrl, garmentUrl),
      mode: "AI Studio" as const,
      hub: "Apparel" as const,
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      wearType: style.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      style: baseProject.styleId || "Catalog",
      background: baseProject.backgroundId || "Studio White",
      outputFormat: "single" as const,
      outputCount: 1,
      prompt: [chips.join(", "), note].filter(Boolean).join(". "),
    };
  };

  // Redirect to upload if user lands here without required setup.
  useEffect(() => {
    if (!currentProject?.garmentImageUrl && !currentProject?.productImageUrl) {
      router.replace(`/apparel/${segment}/${style}/upload`);
    }
  }, [currentProject, router, segment, style]);

  // Auto-trigger generation once when no prime image exists.
  useEffect(() => {
    if (hasBootstrappedGeneration || currentProject?.primeImage) {
      return;
    }

    const payload = buildPayload();
    if (payload.garmentImageUrl) {
      setHasBootstrappedGeneration(true);
      generate(payload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.primeImage, hasBootstrappedGeneration]);

  // When generation completes, save prime image to project context
  useEffect(() => {
    if (isCompleted && outputImage) {
      updateProject({
        primeImage: outputImage,
        approvedPrime: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, outputImage]);

  const handleApprove = async () => {
    const success = spendCredits(5);
    if (!success) {
      alert("Insufficient credits. Please top up.");
      return;
    }
    setIsApproving(true);
    updateProject({ approvedPrime: true });
    await new Promise(resolve => setTimeout(resolve, 600));
    router.push(`/apparel/${segment}/${style}/views`);
  };

  const handleRegenerate = () => {
    reset();
    setIsRegenerateMode(false);
    setSelectedChips([]);
    const payload = buildPayload(selectedChips, customNote);
    generate(payload);
  };

  const toggleChip = (chip: string) => {
    setSelectedChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => setShowFullPreview(true), 500);
  };
  const handleTouchEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  // Display image: use generated or fall back to context prime
  const displayImage = outputImage || currentProject?.primeImage || null;

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Generated Result" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        {/* Progress Dots (Figma Style) */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div key={dot} className={`h-1 w-8 rounded-full ${dot <= 4 ? "bg-[#7C4DFF]" : "bg-white/10"}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[400px]"
            >
              <div className="relative w-32 h-32 mb-8">
                <div className="absolute inset-0 border-4 border-[#7C4DFF]/20 rounded-full" />
                <motion.div
                  className="absolute inset-0 border-4 border-t-[#7C4DFF] border-r-transparent border-b-transparent border-l-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#7C4DFF] animate-pulse" />
                </div>
              </div>
              <h2 className="font-roboto font-semibold text-2xl text-white mb-2">AI is Crafting Your Prime Image</h2>
              <p className="text-[#C2C6D6] text-sm animate-pulse">Running high-fidelity render pipeline...</p>
              <p className="text-[#99A1AF] text-xs mt-2 uppercase tracking-widest">
                {status === "submitting" ? "Submitting job..." : "Processing..."}
              </p>
            </motion.div>
          ) : isFailed ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[400px] gap-6"
            >
              <AlertCircle className="w-16 h-16 text-red-400" />
              <p className="text-red-400 text-center max-w-xs">{error || "Generation failed."}</p>
              <button
                onClick={handleRegenerate}
                className="h-[48px] px-8 rounded-full bg-[#7C4DFF] text-white font-medium flex items-center gap-2"
              >
                <RefreshCcw className="w-4 h-4" />
                Retry Generation
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 w-full flex flex-col items-center pb-20"
            >
              <div
                onDoubleClick={() => setShowFullPreview(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full aspect-[4/5] max-w-full sm:max-w-[353px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-8 border border-white/5 group cursor-zoom-in transition-all"
              >
                {displayImage ? (
                  <Image
                    src={displayImage}
                    alt="Prime Image Result"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Sparkles className="w-10 h-10 text-[#7C4DFF]/40 animate-pulse" />
                  </div>
                )}

                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setShowFullPreview(true)}
                    className="w-10 h-10 rounded-full bg-[#E2E2E8]/80 hover:bg-[#E2E2E8] backdrop-blur-md flex items-center justify-center transition-all"
                  >
                    <ZoomIn className="w-5 h-5 text-black" />
                  </button>
                  <button 
                    onClick={() => setShowFullPreview(true)}
                    className="w-10 h-10 rounded-full bg-[#E2E2E8]/80 hover:bg-[#E2E2E8] backdrop-blur-md flex items-center justify-center transition-all"
                  >
                    <Maximize className="w-5 h-5 text-black" />
                  </button>
                </div>
              </div>

              {/* Action Buttons under Image */}
              <div className="w-full max-w-full sm:max-w-[353px] grid grid-cols-2 gap-3 mb-10">
                <button
                  onClick={handleRegenerate}
                  className="h-[48px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white font-medium text-sm"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Regenerate
                </button>
                <button
                  onClick={() => setIsRegenerateMode(true)}
                  className="h-[48px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white font-medium text-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  Edit Prompt
                </button>
              </div>

              {/* Main Approve Button */}
              <div className="w-full max-w-full sm:max-w-[353px]">
                <LoadingActionButton
                  isLoading={isApproving}
                  onClick={handleApprove}
                  className="w-full h-[61px] text-[18px] font-bold rounded-full shadow-[0_0_30px_rgba(124,77,255,0.3)]"
                  disabled={!displayImage}
                >
                  Approve & Continue
                </LoadingActionButton>
              </div>

              <AnimatePresence>
                {isRegenerateMode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full max-w-full sm:max-w-[353px] overflow-hidden mt-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-roboto font-semibold text-base text-white">Refine & Regenerate</h3>
                      <button
                        onClick={() => setShowTextBox(!showTextBox)}
                        className="flex items-center gap-1 text-[#7C4DFF] text-xs font-medium"
                      >
                        <MessageSquare className="w-3 h-3" />
                        {showTextBox ? "Hide Note" : "Add Note"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {feedbackChips.map(chip => (
                        <button
                          key={chip}
                          onClick={() => toggleChip(chip)}
                          className={`px-4 py-2 rounded-full border text-[11px] font-medium transition-all ${
                            selectedChips.includes(chip)
                              ? "bg-figma-gradient border-transparent text-white shadow-[0_0_15px_rgba(124,77,255,0.4)]"
                              : "bg-white/5 border-white/10 text-[#C2C6D6] hover:border-white/20"
                          }`}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>

                    {/* Selected chip live feedback */}
                    {selectedChips.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-4 bg-[#7C4DFF]/10 border border-[#7C4DFF]/20 rounded-xl p-3"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Check className="w-3 h-3 text-[#7C4DFF]" />
                          <span className="text-[10px] font-bold uppercase text-[#7C4DFF] tracking-widest">AI Directive Engine</span>
                        </div>
                        <p className="text-[11px] text-white/80 leading-tight">
                          {chipPrompts[selectedChips[selectedChips.length - 1]] || "Enhancing image quality..."}
                        </p>
                      </motion.div>
                    )}

                    <AnimatePresence>
                      {showTextBox && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mb-6"
                        >
                          <textarea
                            value={customNote}
                            onChange={e => setCustomNote(e.target.value)}
                            placeholder="E.g. Focus on the golden pallu details..."
                            className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={handleRegenerate}
                      className="w-full h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#7C4DFF] font-bold text-sm mb-20"
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Regenerate with Refinements
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Full Preview Modal */}
      <AnimatePresence>
        {showFullPreview && displayImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFullPreview(false)}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-5 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <Image
                src={displayImage}
                alt="Full Preview"
                fill
                className="object-contain bg-black/50"
                unoptimized
              />
              <div className="absolute top-6 right-6 p-4">
                <button className="bg-white/10 backdrop-blur-md p-3 rounded-full hover:bg-white/20 transition-all border border-white/10">
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-fit px-6 py-2 bg-white/5 backdrop-blur-lg rounded-full border border-white/10 text-white/60 text-xs font-medium uppercase tracking-widest whitespace-nowrap">
                Click anywhere to close
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
