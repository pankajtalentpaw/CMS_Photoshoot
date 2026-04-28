"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface StackedImagePreviewProps {
  images: string[];
}

export default function StackedImagePreview({ images }: StackedImagePreviewProps) {
  // Ensure we have at least 3 images
  const displayImages = images.length >= 3 ? images.slice(0, 3) : [...images, ...images, ...images].slice(0, 3);
  const [order, setOrder] = useState([0, 1, 2]); // [Index in Back slot, Index in Middle slot, Index in Front slot]

  const handleSwipe = (direction: "left" | "right") => {
    setOrder((prev) => {
      const newOrder = [...prev];
      if (direction === "right") {
        // Cyclic shift: [Back, Middle, Front] -> [Front, Back, Middle]
        const front = newOrder.pop()!;
        newOrder.unshift(front);
      } else {
        // Cyclic shift: [Back, Middle, Front] -> [Middle, Front, Back]
        const back = newOrder.shift()!;
        newOrder.push(back);
      }
      return newOrder;
    });
  };

  // Fixed Orientation Slots (from CSS)
  const slots = [
    { left: "0%", right: "23.96%", top: "0%", bottom: "19.47%", rotate: -17.98, zIndex: 10, scale: 0.9, opacity: 0.6 },
    { left: "13.02%", right: "10.95%", top: "9.44%", bottom: "10.03%", rotate: -8.18, zIndex: 20, scale: 0.95, opacity: 0.8 },
    { left: "23.96%", right: "0%", top: "18.88%", bottom: "0.59%", rotate: 0, zIndex: 30, scale: 1, opacity: 1 },
  ];

  return (
    <div className="relative w-full max-w-[340px] h-[350px] mx-auto mt-4 mb-16 touch-none select-none">
      {/* Fixed Rotation Stack - Orientation remains fixed, images cycle */}
      {order.map((imgIndex, slotIdx) => (
        <motion.div
          key={displayImages[imgIndex]}
          initial={false}
          animate={{
            left: slots[slotIdx].left,
            right: slots[slotIdx].right,
            top: slots[slotIdx].top,
            bottom: slots[slotIdx].bottom,
            rotate: slots[slotIdx].rotate,
            zIndex: slots[slotIdx].zIndex,
            scale: slots[slotIdx].scale,
            opacity: slots[slotIdx].opacity,
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 25,
            opacity: { duration: 0.2 }
          }}
          drag={slotIdx === 2 ? "x" : false} // Only the front-most card can be swiped
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info) => {
            if (info.offset.x > 80) handleSwipe("right");
            else if (info.offset.x < -80) handleSwipe("left");
          }}
          className={`absolute rounded-[10.88px] overflow-hidden border-[0.6px] border-[#2E1C4D] shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#1A1E29] ${
            slotIdx === 2 ? "cursor-grab active:cursor-grabbing ring-1 ring-white/10" : ""
          }`}
        >
          <div className="relative w-full h-full">
            <Image 
              src={displayImages[imgIndex]} 
              alt={`Photoshoot Result ${imgIndex}`} 
              fill 
              className="object-cover pointer-events-none"
              priority={slotIdx === 2}
            />
            {/* Gloss Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#7C4DFF]/5 to-transparent pointer-events-none" />
          </div>
        </motion.div>
      ))}
      
      {/* Swipe Legend + Page Counter */}
      <div className="absolute -bottom-14 left-0 right-0 flex flex-col items-center gap-2">
        <div className="flex items-center gap-10">
          <motion.div
            animate={{ x: [-3, 3] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="opacity-50"
          >
            <ChevronLeft className="w-4 h-4 text-[#7C4DFF]" />
          </motion.div>

          {/* Live page counter */}
          <div className="flex items-baseline gap-[2px] min-w-[48px] justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={order[2]}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.2 }}
                className="text-[16px] font-bold text-white tabular-nums"
              >
                {order[2] + 1}
              </motion.span>
            </AnimatePresence>
            <span className="text-[13px] font-medium text-white/40">/{displayImages.length}</span>
          </div>

          <motion.div
            animate={{ x: [3, -3] }}
            transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
            className="opacity-50"
          >
            <ChevronRight className="w-4 h-4 text-[#7C4DFF]" />
          </motion.div>
        </div>
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-x-0 -bottom-10 h-20 bg-[#7C4DFF]/10 blur-[60px] -z-10 rounded-full scale-150" />
    </div>
  );
}
