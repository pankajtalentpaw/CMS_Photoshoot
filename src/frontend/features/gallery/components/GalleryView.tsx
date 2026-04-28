"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import BottomNav from "@/frontend/components/BottomNav";
import Footer from "@/frontend/components/Footer";
import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

const galleryImages = [
  { src: "/hero_image.png", alt: "Navratri Deity Celebration" },
  { src: "/category_placeholder.png", alt: "Flamenco Dancer Blue Outfit" },
  { src: "/hero_image.png", alt: "Traditional Sari Portrait" },
  { src: "/category_placeholder.png", alt: "Cosmetic Product Tones" },
  { src: "/category_placeholder.png", alt: "Real Estate Agent" },
  { src: "/hero_image.png", alt: "Woman in Sari Brown Background" },
  { src: "/hero_image.png", alt: "Patiala Suit Maroon" },
  { src: "/category_placeholder.png", alt: "Businessman Blue Suit" },
];

const galleryVideos = [
  { src: "/hero_image.png", alt: "Straight Walk – Saree" },
  { src: "/category_placeholder.png", alt: "Slow Turn – Western Wear" },
  { src: "/category_placeholder.png", alt: "Runway Walk – Fusion" },
  { src: "/hero_image.png", alt: "Cinematic Pan – Kurti" },
];

export default function GalleryPage() {
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");

  const items = activeTab === "images" ? galleryImages : galleryVideos;

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 lg:pb-0">
      <FlowHeader title="Gallery" />

      {/* Sub-header Tab Toggle (Rectangle 39 / Group 56) */}
      <div className="fixed top-[99px] left-0 right-0 z-40 bg-[#0C101C] px-5 pt-[7px] pb-[7px]">
        <div className="max-w-full lg:max-w-7xl mx-auto">
          <div className="w-full h-[57px] bg-[#181D29] rounded-[10px] flex p-[5px] gap-[5px]">
            <button
              onClick={() => setActiveTab("images")}
              className={`flex-1 h-[47px] rounded-[10px] font-roboto font-semibold text-[15px] leading-[18px] text-center transition-all duration-200 ${
                activeTab === "images"
                  ? "bg-figma-gradient text-white shadow-[0_0_20px_rgba(124,77,255,0.35)]"
                  : "bg-transparent text-[#9CA3AF] hover:text-white"
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex-1 h-[47px] rounded-[10px] font-roboto font-semibold text-[15px] leading-[18px] text-center transition-all duration-200 ${
                activeTab === "videos"
                  ? "bg-figma-gradient text-white shadow-[0_0_20px_rgba(124,77,255,0.35)]"
                  : "bg-transparent text-[#9CA3AF] hover:text-white"
              }`}
            >
              Videos
            </button>
          </div>
        </div>
      </div>

      {/* Main Gallery Grid */}
      <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[180px] px-5">

        {/* 2-column mobile grid, 4-column desktop with proper gaps */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {items.map((item, idx) => (
            <motion.div
              key={`${activeTab}-${idx}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="relative aspect-[163/210] cursor-pointer group overflow-hidden rounded-[8px] border border-white/5"
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
               loading="lazy" />

              {/* Video play icon overlay */}
              {activeTab === "videos" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-[44px] h-[44px] rounded-full bg-figma-gradient flex items-center justify-center shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              )}

              {/* Hover label */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end pb-2 px-3">
                <span className="font-roboto text-xs text-white/90 truncate">{item.alt}</span>
              </div>
            </motion.div>
          ))}
        </div>

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
