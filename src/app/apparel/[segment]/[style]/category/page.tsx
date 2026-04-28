"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import ProductTag from "@/frontend/components/ProductTag";
import Footer from "@/frontend/components/Footer";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import InfiniteCarousel from "@/frontend/components/InfiniteCarousel";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRecentBranch } from "@/frontend/hooks/useRecentBranch";
import { useGeneration } from "@/frontend/context/GenerationContext";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TAXONOMY } from "@/registry/taxonomy";

export default function CategorySelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "ladies";
  const styleParam = (params.style as string) || "ethnic-wear";

  const { selectionState, updateSelection } = useGeneration();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(selectionState.productCategory);
  const [isContinuing, setIsContinuing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // SaaS Rule 6.1: Memory
  useRecentBranch(`${segment} ${styleParam}`, `/apparel/${segment}/${styleParam}/category`);

  const getTaxonomyData = () => {
    const s = segment.charAt(0).toUpperCase() + segment.slice(1).toLowerCase();
    const styleKey = styleParam.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const styles = TAXONOMY.apparel.styles[s] || [];
    const matchedStyle = styles.find((st: any) => st.title === styleKey);
    
    return {
      categories: matchedStyle?.leafNodes || ["Saree", "Kurti", "Other"],
      samples: matchedStyle?.samples || ["/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg"],
      description: matchedStyle?.description || `High-fidelity ${styleKey} generation for marketplace-safe catalogs.`
    };
  };

  const { categories, samples, description } = getTaxonomyData();
  const visibleCategories = showAll 
    ? categories 
    : [
        ...categories.filter((c: string) => c !== "Other").slice(0, 7), 
        ...(categories.includes("Other") ? ["Other"] : [])
      ];
  const hasMore = categories.length > 8;

  const handleContinue = async () => {
    setIsContinuing(true);
    // Save to context
    updateSelection({ 
      productCategory: selectedCategory,
      // Reset model if category changed to ensure compatibility
      ...(selectedCategory !== selectionState.productCategory ? { modelId: null } : {})
    });
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(`/apparel/${segment}/${styleParam}/upload`);
  };




  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 overflow-x-hidden">
      <FlowHeader title="Select Product" />

      <main className="w-full flex-1 max-w-full md:max-w-7xl mx-auto pt-[120px] px-5 flex flex-col">
        <div className="mt-4 mb-2">
          <ProgressStepper currentStep={4} />
        </div>

        {/* SaaS Step 3: Gallery Carousel - Robust Infinite Implementation */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-[10px] uppercase tracking-widest text-[#AF8CFF] font-bold">Sample Deliverables</h3>
            <span className="text-[10px] text-white/50 italic font-light">Swipe to explore</span>
          </div>
          
          <InfiniteCarousel items={samples} />

          <div className="mt-6 px-1">
            <p className="font-roboto text-sm text-[#C2C6D6] italic opacity-80 leading-relaxed text-center">
              {description}
            </p>
          </div>
        </section>

        <section className="mt-4 mb-10 flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
              Choose Product Type
            </h2>
            {hasMore && (
              <button 
                onClick={() => setShowAll(!showAll)}
                className="flex items-center gap-1 text-[#7C4DFF] text-sm font-medium hover:opacity-80 transition-opacity cursor-pointer"
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
              {(showAll ? categories : visibleCategories).map((cat: string, idx: number) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductTag 
                    label={cat}
                    selected={selectedCategory === cat}
                    onClick={() => setSelectedCategory(prev => prev === cat ? null : cat)}
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
              disabled={!selectedCategory || isContinuing}
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
