"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import ProductScroll from "@/frontend/components/ProductScroll";
import ProductTag from "@/frontend/components/ProductTag";
import Footer from "@/frontend/components/Footer";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingActionButton from "@/frontend/components/LoadingActionButton";
import { useRecentBranch } from "@/frontend/hooks/useRecentBranch";
import { Check, RefreshCcw, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

export default function ProductsLeafPage() {
  const params = useParams();
  const router = useRouter();
  const style = (params.style as string) || "home-decor";
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isContinuing, setIsContinuing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // SaaS Rule 6.1: Memory
  useRecentBranch(`Products ${style}`, `/products/${style}`);

  const getProductTypes = (style: string) => {
    const s = style.toLowerCase();
    if (s === "home") return ["Vase", "Lamp", "Wall Art", "Cushion", "Rug", "Showpiece", "Candle", "Other"];
    if (s === "beauty") return ["Lipstick", "Skin Cream", "Perfume", "Eye Liner", "Maskara", "Foundation", "Other"];
    if (s === "handicrafts") return ["Pottery", "Wood Carving", "Metal Art", "Weaving", "Terracotta", "Other"];
    if (s === "packaged") return ["Boxed Tea", "Spice Jar", "Health Drink", "Snack Pack", "Gourmet Box", "Other"];
    return ["Standard", "Lifestyle Item", "Premium Gift", "Custom", "Other"];
  };

  const products = getProductTypes(style);
  const visibleProducts = showAll 
    ? products 
    : [
        ...products.filter((p: string) => p !== "Other").slice(0, 7),
        ...(products.includes("Other") ? ["Other"] : [])
      ];

  const handleContinue = async () => {
    if (!selectedProduct) return;
    setIsContinuing(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push(`/products/${style}/upload?product=${selectedProduct.toLowerCase()}`);
  };

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Choose Product" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        <ProgressStepper currentStep={3} />

        <section className="mt-8 mb-10">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight text-[#E2E2E8] mb-4 capitalize">
              {style.replace('-', ' ')}
            </h1>
            <p className="font-roboto font-normal text-base text-[#C2C6D6] mb-8">
              Select product leaf to begin AI production
            </p>
          </motion.div>
          
          <div className="-mx-5">
            <ProductScroll />
          </div>
        </section>

        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-roboto font-semibold text-xl text-white">Exact Item Type</h2>
            {products.length > 8 && (
              <button 
                onClick={() => setShowAll(!showAll)}
                className="text-[#7C4DFF] text-sm flex items-center gap-1"
              >
                {showAll ? <><ChevronUp className="w-4 h-4" /> Less</> : <><ChevronDown className="w-4 h-4" /> See More</>}
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {(showAll ? products : visibleProducts).map((prod) => (
                <ProductTag 
                  key={prod} 
                  label={prod} 
                  selected={selectedProduct === prod} 
                  onClick={() => setSelectedProduct(prev => prev === prod ? null : prod)} 
                />
              ))}
            </AnimatePresence>
          </div>
        </section>

        <div className="mt-auto mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            <LoadingActionButton
              isLoading={isContinuing}
              onClick={handleContinue}
              disabled={!selectedProduct || isContinuing}
              className="w-full h-[61px] text-[18px]"
            >
              Start Generation
            </LoadingActionButton>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
