"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ResultCarouselProps {
  images: string[];
  labels?: string[];
}

const ResultCarousel = ({ images, labels = [] }: ResultCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div className="relative w-full max-w-[353px] mx-auto group">
      {/* Carousel Container */}
      <div className="relative aspect-[353/522] md:aspect-[353/502] rounded-[24px] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(124,77,255,0.15)] bg-[#1A1E29]">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                nextImage();
              } else if (swipe > swipeConfidenceThreshold) {
                prevImage();
              }
            }}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
          >
            <Image
              src={images[currentIndex]}
              alt={`AI Result ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* High Fidelity AI Badge */}
        <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="font-roboto text-[10px] font-bold text-white uppercase tracking-wider">
            High Fidelity AI
          </span>
        </div>

        {/* Dynamic View Label Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 pointer-events-none">
          <motion.p 
            key={`label-${currentIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-roboto font-bold text-xl text-white tracking-tight"
          >
            {labels[currentIndex] || `View ${currentIndex + 1}`}
          </motion.p>
          <p className="text-[#9CA3AF] text-[10px] font-bold uppercase tracking-[1.5px] mt-1 opacity-70">
            AI Generated Output
          </p>
        </div>
      </div>

      {/* Carousel Dot Indicators (Exact Figma Step Indicators) */}
      <div className="flex justify-center gap-2 mt-4">
        {images.map((_, idx) => (
          <motion.div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              currentIndex === idx ? "w-6 bg-[#7C4DFF]" : "w-2 bg-white/20"
            }`}
            animate={{
              scale: currentIndex === idx ? 1.1 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ResultCarousel;
