"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import StyleCard from "@/frontend/components/StyleCard";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { Sparkles, X, Wand2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// ─── Taxonomy: Jewellery Level 3 styles per Level 2 segment ─────────────────
// Ref: Handoff Brief section 3.3
function getJewelleryStyles(segment: string) {
  const s = segment.toLowerCase();

  // Bridal
  if (s.includes("bridal")) {
    return [
      {
        id: "sets-and-pieces",
        title: "Sets and pieces",
        subtitle: "Full Set, Choker Set, Necklace Set, Earrings, Bangles, Maang Tikka",
        image: "/golden-jewlary.jpg",
      },
      {
        id: "custom",
        title: "Custom / Other",
        subtitle: "Open prompt or unsupported bridal style",
        icon: Sparkles,
      },
    ];
  }

  // Fashion
  if (s.includes("fashion")) {
    return [
      {
        id: "regular-wear",
        title: "Regular wear",
        subtitle: "Earrings, Rings, Bracelets, Necklaces, Office-wear Sets",
        image: "/elegant-woman-showcasing-silver-necklace-with-vibrant-amethyst-aquamarine-stones-set-against-deep-background-dramatic-effect.jpg",
      },
      {
        id: "custom",
        title: "Custom / Other",
        subtitle: "Open prompt or unsupported fashion jewellery",
        icon: Sparkles,
      },
    ];
  }

  // Traditional / Vintage
  if (s.includes("traditional") || s.includes("vintage")) {
    return [
      {
        id: "heritage-styles",
        title: "Heritage styles",
        subtitle: "Temple, Kundan, Antique Finish, Polki-style, Festive Sets",
        image: "/young-indian-woman-wearing-sari.jpg",
      },
      {
        id: "custom",
        title: "Custom / Other",
        subtitle: "Open prompt or unsupported heritage style",
        icon: Sparkles,
      },
    ];
  }

  // Daily Wear / Minimal
  if (s.includes("daily") || s.includes("minimal")) {
    return [
      {
        id: "simple-styles",
        title: "Low-weight / simple styles",
        subtitle: "Studs, Thin Chains, Light Bracelets, Minimal Rings",
        image: "/WhatsApp Image 2026-04-07 at 3.28.31 PM.jpeg",
      },
      {
        id: "custom",
        title: "Custom / Other",
        subtitle: "Open prompt or unsupported casual style",
        icon: Sparkles,
      },
    ];
  }

  // Custom / Other — show only the open prompt card
  return [
    {
      id: "custom",
      title: "Open Prompt",
      subtitle: "Unsupported or hybrid jewellery use case",
      icon: Sparkles,
    },
  ];
}
// ────────────────────────────────────────────────────────────────────────────

export default function JewelleryStyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segmentParam = params?.segment;
  const segment =
    typeof segmentParam === "string"
      ? decodeURIComponent(segmentParam).toLowerCase()
      : "bridal";

  const styles = getJewelleryStyles(segment);

  const [mounted, setMounted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
    // If segment is "custom-other", auto-open the prompt
    if (segment.includes("custom")) {
      setShowPrompt(true);
    }
  }, [segment]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(
      `/jewellery/${segment}/custom/category?prompt=${encodeURIComponent(customPrompt)}`
    );
  };

  const handleStyleSelect = (styleId: string) => {
    if (styleId === "custom") {
      setShowPrompt(true);
    } else {
      router.push(`/jewellery/${segment}/${styleId}/category`);
    }
  };

  if (!mounted) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white">
        <FlowHeader title="Select Style" />
        <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5" />
      </div>
    );
  }

  // Derive a human-readable segment label for heading
  const segmentLabel = decodeURIComponent(segmentParam as string)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Select Style" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={2} />

        {/* Heading */}
        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Jewellery Style
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6] max-w-sm">
              Showing styles for{" "}
              <span className="text-white font-medium">{segmentLabel}</span>{" "}
              jewellery
            </p>
          </motion.div>
        </section>

        {/* Style cards / Custom Prompt — animated switch */}
        <section className="mb-20">
          <AnimatePresence mode="wait">
            {!showPrompt ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-4 w-full max-w-full sm:max-w-[353px] mx-auto"
              >
                {styles.map((style, idx) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStyleSelect(style.id)}
                    className="cursor-pointer"
                  >
                    <StyleCard
                      title={style.title}
                      subtitle={style.subtitle}
                      image={"image" in style ? style.image : undefined}
                      icon={"icon" in style ? style.icon : undefined}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* ── Custom / Open Prompt UI ── */
              <motion.div
                key="prompt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-full sm:max-w-[353px] mx-auto"
              >
                <div className="relative p-6 bg-[#1A1E29] border border-white/10 rounded-[20px] shadow-2xl">
                  {/* Close (only if there are other options to go back to) */}
                  {styles.length > 1 && (
                    <div className="absolute top-0 right-0 p-4">
                      <button
                        onClick={() => setShowPrompt(false)}
                        className="p-1 rounded-full hover:bg-white/10 transition-colors"
                      >
                        <X className="w-5 h-5 text-white/50" />
                      </button>
                    </div>
                  )}

                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Sparkles className="w-5 h-5 text-[#00C2FF]" />
                      </div>
                      <h3 className="font-roboto font-semibold text-lg text-white">
                        Custom Style Prompt
                      </h3>
                    </div>
                    <p className="text-[#C2C6D6] text-xs leading-relaxed">
                      Describe the specific jewellery type you want — e.g.{" "}
                      <em>"Diamond choker with emerald drops for bridal shoot"</em>.
                    </p>
                  </div>

                  {/* Textarea */}
                  <div className="relative mb-6">
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Enter your custom request..."
                      className="w-full h-32 bg-black/40 border border-white/5 rounded-xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#7C4DFF]/60 transition-all resize-none text-sm"
                    />
                    <div className="absolute bottom-3 right-3 text-[10px] text-white/20 uppercase tracking-widest font-medium">
                      AI ENGINE READY
                    </div>
                  </div>

                  <LoadingActionButton
                    isLoading={isGenerating}
                    onClick={handleGenerate}
                    disabled={!customPrompt.trim()}
                    className="w-full h-12"
                    icon={<Wand2 className="w-4 h-4" />}
                  >
                    GENERATE STYLE
                  </LoadingActionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <Footer />
        <div className="h-[120px] lg:hidden" />
      </main>
    </div>
  );
}
