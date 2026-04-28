"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import ProductTag from "@/frontend/components/ProductTag";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { useRecentBranch } from "@/frontend/hooks/useRecentBranch";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TAXONOMY } from "@/registry/taxonomy";

export default function JewelleryCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "bridal";
  const style = (params.style as string) || "sets-and-pieces";

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAll, setShowAll] = useState(false);

  // SaaS Rule 6.1: Memory
  useRecentBranch(`${segment} ${style}`, `/jewellery/${segment}/${style}/category`);

  const getTaxonomyTypes = () => {
    // Staff level improvement: Data-driven lookup
    const s = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    return TAXONOMY.jewellery.styles.leafNodes[s] || ["Necklace", "Earrings", "Other"];
  };

  const productTypes = getTaxonomyTypes();
  const visibleTypes = showAll 
    ? productTypes 
    : [
        ...productTypes.filter((t: string) => t !== "Other").slice(0, 7),
        ...(productTypes.includes("Other") ? ["Other"] : [])
      ];
  const hasMore = productTypes.length > 8;

  const CAROUSEL_IMAGES = [
    "/golden-jewlary.jpg",
    "/assets/ladies/ethnic-wear/beautiful-indian-bride-wearing-bridal-lehenga-portrait.jpg",
    "/assets/ladies/ethnic-wear/bride-wearing-gold-orange-sari-is-wearing-gold-headband.jpg"
  ];

  const handleContinue = async () => {
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(`/jewellery/${segment}/${style}/upload`);
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30">
      <FlowHeader title="Select Product" />

      <main className="w-full flex-1 max-w-full md:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <div className="mt-4 mb-2">
          <ProgressStepper currentStep={3} />
        </div>

        <section className="relative w-full aspect-square max-h-[353px] mb-8 group">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative w-full h-full rounded-[10px] overflow-hidden shadow-2xl"
            >
              <Image 
                src={CAROUSEL_IMAGES[currentSlide]}
                alt="Jewellery Preview"
                fill
                className="object-cover"
                priority={currentSlide === 0}
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {CAROUSEL_IMAGES.map((_, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx 
                  ? "w-8 bg-figma-gradient rounded-full" 
                  : "w-1.5 bg-[#D9D9D9]/20"
                }`}
              />
            ))}
          </div>
        </section>

        <section className="mt-8 mb-10 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
              Choose Product Type
            </h2>
            {hasMore && (
              <button 
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 text-[#7C4DFF] text-sm font-medium hover:opacity-80 transition-opacity"
              >
                {showAll ? (
                  <><ChevronUp className="w-4 h-4" /> Less</>
                ) : (
                  <><ChevronDown className="w-4 h-4" /> See More</>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-[14px]">
            <AnimatePresence>
              {(showAll ? productTypes : visibleTypes).map((type: string, idx: number) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductTag 
                    label={type}
                    selected={selectedType === type}
                    onClick={() => setSelectedType(prev => prev === type ? null : type)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </section>

        <div className="mt-auto mb-10 md:mb-16">
          <div className="w-full max-w-[353px] mx-auto">
            <LoadingActionButton
              isLoading={isContinuing}
              onClick={handleContinue}
              disabled={!selectedType || isContinuing}
              className="w-full h-[61px] text-[18px]"
            >
              Continue
            </LoadingActionButton>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
