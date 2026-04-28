"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import BottomNav from "@/frontend/components/BottomNav";
import Footer from "@/frontend/components/Footer";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  Palette,
  Sliders,
  Scissors,
} from "lucide-react";

const tools = [
  {
    icon: Sparkles,
    name: "Magic Enhance",
    description: "Enhance image quality with AI",
    color: "from-[#7C3AED] to-[#EC4899]",
    glow: "rgba(236,72,153,0.3)",
    preview: "/hero_image.png",
  },
  {
    icon: Palette,
    name: "Style Transfer",
    description: "Apply artistic styles to images",
    color: "from-[#7C3AED] to-[#EC4899]",
    glow: "rgba(236,72,153,0.3)",
    preview: "/category_placeholder.png",
  },
  {
    icon: Sliders,
    name: "Color Grading",
    description: "Professional color adjustments",
    color: "from-[#7C3AED] to-[#EC4899]",
    glow: "rgba(236,72,153,0.3)",
    preview: "/hero_image.png",
  },
  {
    icon: Scissors,
    name: "Background Removal",
    description: "Remove backgrounds instantly",
    color: "from-[#7C3AED] to-[#EC4899]",
    glow: "rgba(236,72,153,0.3)",
    preview: "/category_placeholder.png",
  },
];

export default function AILabPage() {
  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="AI Lab" />

      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5">

        {/* Heading Section */}
        <section className="mt-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-roboto font-semibold text-[36px] leading-[45px] tracking-[-0.9px] text-[#E2E2E8] mb-2">
              Experimental<br />Tools
            </h1>
            <p className="font-roboto font-normal text-[16px] leading-[19px] text-[#C2C6D6]">
              Enhance your creations with AI
            </p>
          </motion.div>
        </section>

        {/* Tool Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tools.map((tool, idx) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="w-full bg-white/5 border border-white/10 rounded-[14px] overflow-hidden cursor-pointer shadow-[0px_7px_28px_rgba(0,0,0,0.2)] group"
              >
                {/* Top: Icon + Title + Description */}
                <div className="flex items-center gap-[14px] px-[14px] h-[85px]">
                  {/* Gradient Icon Badge */}
                  <div
                    className={`w-[56px] h-[56px] flex-shrink-0 rounded-[14px] bg-gradient-to-br ${tool.color} flex items-center justify-center transition-shadow duration-300 group-hover:shadow-[0_0_24px_rgba(236,72,153,0.5)]`}
                    style={{ boxShadow: `0 0 17.65px ${tool.glow}` }}
                  >
                    <Icon className="w-[25px] h-[25px] text-white" strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div className="flex flex-col gap-[3.5px]">
                    <h3 className="font-inter font-bold text-[15.9px] leading-[24px] text-white">
                      {tool.name}
                    </h3>
                    <p className="font-inter font-normal text-[12.4px] leading-[18px] text-[#99A1AF]">
                      {tool.description}
                    </p>
                  </div>
                </div>

                {/* Bottom: Blurred Preview Image */}
                <div className="relative w-full h-[113px] overflow-hidden">
                  <Image
                    src={tool.preview}
                    alt={tool.name}
                    fill
                    className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300 group-hover:scale-105"
                   loading="lazy" />
                  {/* Gradient overlay for smooth fade */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Coming soon badge */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 bg-white/10 border border-white/20 rounded-full backdrop-blur-sm">
                    <span className="font-inter font-medium text-[10px] text-white/70 uppercase tracking-widest">
                      Try Now
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Desktop Footer */}
        <div className="mt-20 hidden lg:block">
          <Footer />
        </div>
        <div className="h-[120px] lg:hidden" />
      </main>

      <BottomNav />
    </div>
  );
}
