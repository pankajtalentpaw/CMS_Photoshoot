"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface VideoStyleCardProps {
  title: string;
  image: string;
  selected: boolean;
  onClick: () => void;
  storyboard?: string[];
}

const VideoStyleCard = ({ title, image, selected, onClick, storyboard }: VideoStyleCardProps) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex flex-col items-center gap-3 cursor-pointer group w-full"
    >
      {/* Rectangle 27 Container */}
      <div className={`relative w-full aspect-[166/207] rounded-[10px] overflow-hidden border-2 transition-all ${
        selected ? "border-[#7C4DFF] shadow-[0_0_20px_rgba(124,77,255,0.3)]" : "border-white/5 group-hover:border-[#7C4DFF]/50"
      }`}>
        <Image
          src={image}
          alt={title}
          fill
          className={`object-cover transition-opacity duration-300 ${storyboard ? "group-hover:opacity-0" : ""}`}
          loading="lazy" 
        />

        {/* Storyboard 3-frame Grid (appears on hover) */}
        {storyboard && (
          <div className="absolute inset-0 grid grid-cols-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {storyboard.slice(0, 3).map((frame, i) => (
              <div key={i} className="relative h-full border-r border-white/10 last:border-0">
                <Image 
                  src={frame} 
                  alt={`Frame ${i}`} 
                  fill 
                  className="object-cover"
                />
              </div>
            ))}
            {/* Movement Path Indicator Overlay */}
            <div className="absolute bottom-2 inset-x-0 flex justify-center">
              <div className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] text-white uppercase tracking-widest font-bold">
                Path Preview
              </div>
            </div>
          </div>
        )}

        {/* Play Icon/Ellipse 6 Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${storyboard ? "group-hover:opacity-0" : "bg-black/20 group-hover:bg-black/10"}`}>
          <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all ${
            selected ? "bg-white border-transparent" : "bg-transparent border border-white"
          }`}>
            <Play className={`w-5 h-5 transition-colors ${
              selected ? "text-[#7C4DFF] fill-[#7C4DFF]" : "text-white"
            }`} />
          </div>
        </div>
      </div>

      {/* Style Label (Straight Walk etc) */}
      <span className={`font-roboto font-medium text-[13px] leading-[15px] text-center transition-colors ${
        selected ? "text-[#7C4DFF]" : "text-white"
      }`}>
        {title}
      </span>
    </motion.div>
  );
};

export default VideoStyleCard;
