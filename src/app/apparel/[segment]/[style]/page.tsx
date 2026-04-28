"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import ProductHero from "@/frontend/components/ProductHero";
import ProductTag from "@/frontend/components/ProductTag";
import Footer from "@/frontend/components/Footer";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ProductSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const segment = (params.segment as string) || "Ladies";
  const style = (params.style as string) || "Ethnic Wear";
  
  // Guard: If style is "select-style", redirect to the correct static route
  useEffect(() => {
    if (style === "select-style") {
      router.replace(`/apparel/${segment}/select-style`);
    }
  }, [style, segment, router]);

  const isGents = segment.toLowerCase() === "gents" || segment.toLowerCase() === "men";

  // Define dynamic image arrays for styles
  const ladiesWesternWearImages = [
    "/assets/ladies/western-wear/photo-beautiful-female-model.jpg",
    "/assets/ladies/western-wear/photo-portrait-young-beautiful-female-sexy-woman-model-with-fashionable-clothes-designs.jpg",
    "/assets/ladies/western-wear/photorealistic-hyper-realistic-image-white-background-ai-generated-by-freepik.jpg",
    "/assets/ladies/western-wear/professional-iranian-model-clean-studio-scene-professional-iranian-model-clean-studio.jpg",
    "/assets/ladies/western-wear/radiant-young-woman-with-braces-showcases-vibrant-red-lips-against-grey-backdrop.jpg",
    "/assets/ladies/western-wear/studio-shot-fashionable-young-woman-posing-against-white-background.jpg",
    "/assets/ladies/western-wear/stylish-beauty-trendy-fashion-wear-ai-generated.jpg",
    "/assets/ladies/western-wear/western-clothes.jpg"
  ];

  const gentsWesternWearImages = [
    "/assets/men/western-wear/medium-shot-man-working-as-real-estate-agent (1).jpg",
    "/assets/men/western-wear/medium-shot-man-working-as-real-estate-agent.jpg",
    "/assets/men/western-wear/men-fashion-editorial-outdoors.jpg"
  ];

  const ladiesEthnicWearImages = [
    "/assets/ladies/ethnic-wear/ChatGPT%20Image%20Apr%201,%202026,%2005_49_51%20PM.png",
    "/assets/ladies/ethnic-wear/ChatGPT%20Image%20Apr%201,%202026,%2005_51_40%20PM.png",
    "/assets/ladies/ethnic-wear/ChatGPT%20Image%20Apr%201,%202026,%2006_05_22%20PM.png",
    "/assets/ladies/ethnic-wear/ChatGPT%20Image%20Apr%201,%202026,%2006_21_52%20PM.png",
    "/assets/ladies/ethnic-wear/celebration-navratri-deity.jpg",
    "/assets/ladies/ethnic-wear/elegant-purple-gold-banarasi-silk-sari-with-intricate-weaving.jpg",
    "/assets/ladies/ethnic-wear/emerald-green-satin-kaftan.jpg",
    "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg",
    "/assets/ladies/ethnic-wear/woman-sari-with-brown-background.jpg"
  ];

  const gentsEthnicWearImages = [
    "/assets/men/ethnic-wear/elegant-indian-man-culture-character.jpg",
    "/assets/men/ethnic-wear/indian-man-traditional-wear-kurta-pyjama-cloths.jpg",
    "/assets/men/ethnic-wear/man-with-scarf-that-says-indian-it.jpg",
    "/assets/men/ethnic-wear/marathi-cultural-portrait-traditional-attire-with-warli-backdrop.jpg",
    "/assets/men/ethnic-wear/stylish-groom-fusion-attire-ar-169-v-7-job-id-4bbb310081444604a991d0671501f76f.jpg"
  ];

  const imagesMap: Record<string, string[]> = {
    "western-wear": isGents ? gentsWesternWearImages : ladiesWesternWearImages,
    "ethnic-wear": isGents ? gentsEthnicWearImages : ladiesEthnicWearImages
  };

  const activeImages = imagesMap[style] || (isGents ? gentsEthnicWearImages : ladiesEthnicWearImages);

  const ladiesEthnicTags = [
    "Saree", "Lehenga", "Suit", "Kurti", "Anarkali", 
    "Sharara", "Gown", "Ethnic Set", "Bottoms", "Other"
  ];

  const gentsEthnicTags = [
    "Kurta", "Sherwani", "Nehru Jacket", "Dhoti", "Pyjama", 
    "Pathani Suit", "Indo-Western", "Ethnic Set", "Bottoms", "Other"
  ];

  const defaultTags = isGents ? gentsEthnicTags : ladiesEthnicTags;

  const tagsMap: Record<string, string[]> = {
    "ethnic-wear": defaultTags,
    "western-wear": ["Dresses", "Tops", "Jeans", "T-Shirts", "Shirts", "Trousers", "Jumpsuits", "Co-ords", "Blazers", "Other"],
  };

  const activeTags = tagsMap[style] || defaultTags;

  // Start with no tag selected
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  if (style === "select-style") return null;

  return (
    <div className="relative flex flex-col min-h-screen bg-black text-white selection:bg-figma-gradient/30 mt-auto">
      <FlowHeader title="Select Product" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Step 3 in progress */}
        <ProgressStepper currentStep={4} />

        {/* Featured Product Hero (Carousel) */}
        <section className="mt-[28px]">
          <ProductHero images={activeImages} />
        </section>

        {/* Product Type Tags Section */}
        <section className="mt-[30px] mb-10">
          <h2 className="font-roboto font-semibold text-[20px] leading-[23px] text-white mb-[20px]">
            Choose Product Type
          </h2>
          
          <div className="flex flex-wrap gap-[10px]">
            {activeTags.map((tag) => (
              <ProductTag 
                key={tag} 
                label={tag} 
                selected={selectedTag === tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              />
            ))}
          </div>
        </section>

        {/* Inline Continue Button */}
        <div className="w-full mt-10 mb-10 lg:mb-16">
          <div className="w-full max-w-full sm:max-w-[353px] mx-auto lg:max-w-[400px]">
            {selectedTag ? (
              <Link href={`/apparel/${segment}/${style}/upload`}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full h-[61px] bg-figma-gradient rounded-full shadow-[0_0_30px_rgba(124,77,255,0.4)] hover:brightness-110 transition-all flex items-center justify-center"
                >
                  <span className="font-roboto font-semibold text-lg leading-[21px] text-white text-center">
                    Continue
                  </span>
                </motion.button>
              </Link>
            ) : (
              <button 
                disabled
                className="w-full h-[61px] bg-[#1A1A1A] border border-white/10 rounded-full flex items-center justify-center cursor-not-allowed opacity-50 transition-all"
              >
                <span className="font-roboto font-semibold text-lg leading-[21px] text-white/40 text-center">
                  Continue
                </span>
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <Footer />
    </div>
  );
}
