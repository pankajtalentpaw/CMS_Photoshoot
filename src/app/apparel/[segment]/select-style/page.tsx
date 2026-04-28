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

// ─── Segment-specific style cards ───────────────────────────────────────────
function getStyles(segment: string) {
  const s = segment.toLowerCase();

  if (s === "gents" || s === "men") {
    return [
      {
        id: "ethnic-wear",
        title: "Ethnic Wear",
        subtitle: "Kurta, Sherwani, Nehru Jacket, Ethnic Set",
        image: "/assets/men/ethnic-wear/indian-man-traditional-wear-kurta-pyjama-cloths.jpg",
      },
      {
        id: "western-wear",
        title: "Western Wear",
        subtitle: "Shirt, T-shirt, Blazer, Jacket, Trousers",
        image: "/assets/men/western-wear/men-fashion-editorial-outdoors.jpg",
      },
      {
        id: "custom",
        title: "Custom / Other",
        subtitle: "Open prompt or unsupported menswear",
        icon: Sparkles,
      },
    ];
  }

  if (s === "kids") {
    return [
      {
        id: "ethnic-wear",
        title: "Ethnic Wear",
        subtitle: "Kids Kurta Set, Kids Lehenga, Festive",
        image: "/assets/kids/surreal-rendering-kid-bounding-with-giant-stuffed-toy.jpg",
      },
      {
        id: "western-wear",
        title: "Western Wear",
        subtitle: "Frock, Shirt, Top, Bottomwear, Partywear",
        image: "/assets/kids/surreal-rendering-kid-bounding-with-giant-stuffed-toy.jpg",
      },
      {
        id: "custom",
        title: "Custom / Other",
        subtitle: "Open prompt or unsupported kidswear",
        icon: Sparkles,
      },
    ];
  }

  // Default: Ladies
  return [
    {
      id: "ethnic-wear",
      title: "Ethnic Wear",
      subtitle: "Saree, Kurti, Kurta Set, Salwar Suit, Lehenga",
      image: "/hero_slide_1.png",
    },
    {
      id: "western-wear",
      title: "Western Wear",
      subtitle: "Dress, Top, Shirt, Blouse, Skirt, Co-ord Set",
      image: "/assets/ladies/western-wear/western-clothes.jpg",
    },
    {
      id: "custom",
      title: "Custom / Other",
      subtitle: "Open prompt or unsupported ladieswear",
      icon: Sparkles,
    },
  ];
}

// ────────────────────────────────────────────────────────────────────────────

export default function StyleSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const formattedSegment =
    segment.charAt(0).toUpperCase() + segment.slice(1);

  const styles = getStyles(segment);

  const [mounted, setMounted] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleStyleSelect = (styleId: string, styleTitle: string) => {
    if (styleId === "custom") {
      setShowPrompt(true);
    } else {
      router.push(`/apparel/${segment}/${styleId}/category`);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    router.push(
      `/apparel/${segment}/custom/category?prompt=${encodeURIComponent(customPrompt)}`
    );
  };

  if (!mounted) {
    return (
      <div className="relative flex flex-col min-h-screen bg-black text-white">
        <FlowHeader title="Select Wear Type" />
        <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5" />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Select Wear Type" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={3} />

        {/* Heading */}
        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Wear Type
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] lg:leading-[24px] text-[#C2C6D6] max-w-sm">
              Choose how your products are categorised in the AI editorial
              catalog for{" "}
              <span className="text-white font-medium">{formattedSegment}</span>
            </p>
          </motion.div>
        </section>

        {/* Style List / Custom Prompt — animated switch */}
        <section className="mb-20">
          <AnimatePresence mode="wait">
            {!showPrompt ? (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
              >
                {styles.map((style, idx) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleStyleSelect(style.id, style.title)}
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
                  {/* Close */}
                  <div className="absolute top-0 right-0 p-4">
                    <button
                      onClick={() => setShowPrompt(false)}
                      className="p-1 rounded-full hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 text-white/50" />
                    </button>
                  </div>

                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/5 rounded-lg">
                        <Sparkles className="w-5 h-5 text-[#00C2FF]" />
                      </div>
                      <h3 className="font-roboto font-semibold text-lg text-white">
                        Custom / Open Prompt
                      </h3>
                    </div>
                    <p className="text-[#C2C6D6] text-xs leading-relaxed">
                      Describe the specific apparel type or workflow you need —
                      e.g. "Bridal lehenga with mirror embroidery, dusty rose
                      background".
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
                      AI ENGINE
                    </div>
                  </div>

                  <LoadingActionButton
                    isLoading={isGenerating}
                    onClick={handleGenerate}
                    disabled={!customPrompt.trim()}
                    className="w-full h-12"
                    icon={<Wand2 className="w-4 h-4" />}
                  >
                    GENERATE
                  </LoadingActionButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <Footer />
    </div>
  );
}
