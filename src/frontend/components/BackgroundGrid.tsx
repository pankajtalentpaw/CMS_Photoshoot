"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface BackgroundGridProps {
  selectedTitle: string | null;
  onSelect: (bg: { title: string; image: string }) => void;
  onPreview?: (bg: { title: string; image: string }) => void;
}

const BackgroundGrid = ({ selectedTitle, onSelect, onPreview }: BackgroundGridProps) => {
  const backgrounds = [
    { title: "White Studio", image: "/bg_white_studio.png" },
    { title: "Premium Studio", image: "/bg_premium_studio.png" },
    { title: "Saree Festival", image: "/bg_saree_festival.png" },
    { title: "Outdoor", image: "/bg_outdoor.png" },
    { title: "Modern Office", image: "/bg_modern_office.png" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Select a background style"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4"
    >
      {backgrounds.map((bg, idx) => {
        const isSelected = selectedTitle === bg.title;
        return (
          <motion.button
            key={idx}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={`${bg.title}${isSelected ? " (selected)" : ""}`}
            onClick={() => onSelect(bg)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(bg);
              }
            }}
            onDoubleClick={() => onPreview?.(bg)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex flex-col gap-2 group cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7C4DFF] focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-[6px]"
          >
            {/* Image Container */}
            <div className={`relative w-full aspect-[111/99] rounded-[6px] overflow-hidden border transition-all ${
              isSelected ? "border-[#7C4DFF]" : "border-white/5 group-hover:border-[#7C4DFF]"
            }`}>
              <Image
                src={bg.image}
                alt={bg.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 180px"
                loading="lazy"
              />
            </div>
            
            {/* Label */}
            <span className={`font-roboto font-medium text-[13px] leading-[15px] text-center transition-colors ${
              isSelected ? "text-[#7C4DFF]" : "text-white"
            }`}>
              {bg.title}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default BackgroundGrid;
