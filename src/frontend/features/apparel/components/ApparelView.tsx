"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import SegmentCard from "@/frontend/components/SegmentCard";
import ProductScroll from "@/frontend/components/ProductScroll";
import Footer from "@/frontend/components/Footer";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ApparelPage() {
  const segments = [
    { title: "Ladies", image: "/assets/ladies/ethnic-wear/woman-sari-stands-front-large-window.jpg", fullWidth: false },
    { title: "Gents", image: "/assets/men/western-wear/men-fashion-editorial-outdoors.jpg", fullWidth: false },
    { title: "Kids", image: "/apparel_kids.png", fullWidth: true },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Apparel" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">
        {/* Progress Indication (Stepper) */}
        <ProgressStepper currentStep={2} />

        {/* Heading Section */}
        <section className="mt-8 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-roboto font-semibold text-3xl lg:text-[36px] leading-tight lg:leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-4">
              Select Segment
            </h1>
            <p className="font-roboto font-normal text-base leading-[19px] text-[#C2C6D6]">
              Choose the target audience for your product
            </p>
          </motion.div>
        </section>

        {/* Audience Selection Grid */}
        <section className="mb-20">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {segments.map((segment, idx) => (
              <motion.div 
                key={idx} 
                className={`${segment.fullWidth ? "col-span-2 lg:col-span-1" : "col-span-1"}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/apparel/${segment.title.toLowerCase()}/select-style`}>
                  <SegmentCard 
                    title={segment.title} 
                    image={segment.image} 
                    fullWidth={segment.fullWidth} 
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trending Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-roboto font-semibold text-xl leading-[23px] text-white">
              Trending in AI Editorial
            </h2>
            
            {/* See gallery button (Frame 3) */}
            <button className="flex items-center justify-center px-[10px] py-[5px] h-6 bg-black/30 shadow-[2px_2px_2px_rgba(0,0,0,0.54)] rounded-full group">
              <span className="font-roboto font-medium text-[12px] leading-[14px] text-center uppercase text-figma-gradient group-hover:scale-105 transition-transform">
                See gallery
              </span>
            </button>
          </div>

          {/* Reuse ProductScroll for the trending feed */}
          <div className="-mx-5">
            <ProductScroll />
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
