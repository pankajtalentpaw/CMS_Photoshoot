"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { 
  Check, RefreshCcw, Sparkles, MessageSquare, X, AlertCircle, ZoomIn, Maximize,
  Camera, PlayCircle, Download, Plus, ChevronLeft, ChevronRight
} from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
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

  const { currentProject, updateProject, spendCredits, resetProject } = useProject();
  const { status, outputImage, error, generate, reset, jobId } = useGenerationPolling();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeView, setActiveView] = useState(0);
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
    if (!value) return fallback;
    if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) {
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
      mode: "Virtual Try-On" as const,
      hub: "Apparel" as const,
      segment: segment.charAt(0).toUpperCase() + segment.slice(1),
      wearType: style.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      style: baseProject.styleId || "Catalog",
      background: baseProject.backgroundId || "White Studio",
      backgroundImageUrl: baseProject.backgroundImageUrl,
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

  // Capture jobId early
  useEffect(() => {
    if (jobId && jobId !== currentProject?.sourceJobId) {
      updateProject({ sourceJobId: jobId });
    }
  }, [jobId, currentProject?.sourceJobId]);

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

  const handleApprove = async (destination?: string) => {
    const jobId = currentProject?.sourceJobId;
    if (!jobId) {
      alert("No active generation found. Please try again.");
      return;
    }

    // If already approved, just navigate
    if (currentProject?.approvedPrime) {
      if (destination) router.push(destination);
      return;
    }

    const success = spendCredits(5);
    if (!success) {
      alert("Insufficient credits. Please top up.");
      return;
    }

    setIsApproving(true);
    
    try {
      const response = await fetch("/api/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to approve job");
      }

      updateProject({ approvedPrime: true });
      await new Promise(resolve => setTimeout(resolve, 600));
      if (destination) {
        router.push(destination);
      }
    } catch (error) {
      console.error("❌ [ApprovePrime] Error:", error);
      alert(error instanceof Error ? error.message : "Failed to approve image. Please try again.");
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadAll = async () => {
    if (!displayImage) return;
    try {
      setIsDownloading(true);
      const zip = new JSZip();
      
      const urlToFetch = displayImage;
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(urlToFetch)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error(`Failed to fetch image`);
      
      const blob = await response.blob();
      let ext = "png";
      if (blob.type === "image/jpeg") ext = "jpg";
      else if (blob.type === "image/webp") ext = "webp";
      
      const filename = `Prime_Result_${Date.now()}.${ext}`;
      zip.file(filename, blob);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `DigitalAtelier_Result.zip`);
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to create download pack. Please try again.");
    } finally {
      setIsDownloading(false);
    }
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
      <FlowHeader title="Results" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col items-center">
        <ProgressStepper currentStep={3} partialStep={false} />

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
              className="flex-1 w-full flex flex-col items-center pb-20 mt-10"
            >
              {/* Carousel View - Refactored for Premium Look */}
              <div
                className="relative w-full aspect-[353/441] max-w-[353px] rounded-[24px] overflow-hidden border border-white/10 bg-[#1A1E29] shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-6 group transition-all"
              >
                {displayImage ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-full"
                  >
                    <Image
                      src={displayImage}
                      alt="Prime Image Result"
                      fill
                      className="object-cover"
                      priority
                      unoptimized
                    />
                    
                    {/* Overlay Icons for Interaction */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setShowFullPreview(true)}
                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/40 transition-all"
                      >
                        <Maximize className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <Sparkles className="w-10 h-10 text-[#7C4DFF]/40 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Carousel Pagination dots */}
              <div className="flex gap-2 mb-10">
                <div className="w-8 h-1.5 rounded-full bg-gradient-to-r from-[#00A3FF] to-[#D100FF]" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </div>

              {/* Side-by-Side Action Buttons */}
              <div className="w-full max-w-[353px] flex gap-3 mb-6">
                <button 
                  onClick={() => handleApprove(`/apparel/${segment}/${style}/views`)}
                  disabled={isApproving}
                  className="flex-1 h-[61px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#E2E2E8]"
                >
                  <Camera className="w-[18px] h-[18px]" />
                  <span className="font-roboto font-bold text-[14px]">More Angles</span>
                </button>
                <button 
                  onClick={() => handleApprove(`/apparel/${segment}/${style}/video-style`)}
                  disabled={isApproving}
                  className="flex-1 h-[61px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-[#E2E2E8]"
                >
                  <PlayCircle className="w-[18px] h-[18px]" />
                  <span className="font-roboto font-bold text-[14px]">Create Video</span>
                </button>
              </div>

              {/* Main Action Stack */}
              <div className="w-full max-w-[353px] flex flex-col gap-4">
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloading || !displayImage}
                  className="w-full h-[61px] bg-gradient-to-r from-[#00A3FF] to-[#D100FF] rounded-full flex items-center justify-center gap-3 text-white font-bold text-[18px] shadow-[0_10px_40px_rgba(0,163,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isDownloading ? (
                    <RefreshCcw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  Download All
                </button>

                <button
                  onClick={() => {
                    resetProject();
                    router.push("/");
                  }}
                  className="w-full h-[61px] bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white font-bold text-[18px] hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  Create New Project
                </button>
              </div>

              {/* Refinement Options (Hidden by default, triggered by small button if needed) */}
              <div className="mt-12 w-full max-w-[353px]">
                <button 
                  onClick={() => setIsRegenerateMode(!isRegenerateMode)}
                  className="w-full py-4 text-[#9CA3AF] text-[13px] font-medium flex items-center justify-center gap-2 hover:text-white transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {isRegenerateMode ? "Hide Refinements" : "Refine AI Result / Edit Prompt"}
                </button>

                <AnimatePresence>
                  {isRegenerateMode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-6 flex flex-wrap gap-2 mb-6">
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

                      <textarea
                        value={customNote}
                        onChange={e => setCustomNote(e.target.value)}
                        placeholder="E.g. Focus on the golden pallu details..."
                        className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-[#7C4DFF] outline-none transition-all placeholder:text-[#C2C6D6]/40 resize-none mb-6"
                      />

                      <button
                        onClick={handleRegenerate}
                        className="w-full h-14 rounded-full bg-[#7C4DFF] flex items-center justify-center gap-2 hover:bg-[#6A3DE8] transition-all text-white font-bold text-sm mb-10"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Regenerate Prime Image
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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
