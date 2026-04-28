"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductHeroProps {
  image?: string;
  images?: string[];
}

const ProductHero = ({ image, images = [] }: ProductHeroProps) => {
  const displayImages = images.length > 0 ? images : (image ? [image] : ["/hero_image.png"]);
  const [[page, direction], setPage] = useState([0, 0]);

  const currentIndex = Math.abs(page % displayImages.length);

  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  useEffect(() => {
    if (displayImages.length <= 1) return;
    
    const timer = setInterval(() => {
      setPage(prev => [prev[0] + 1, 1]);
    }, 5000);

    return () => clearInterval(timer);
  }, [displayImages.length]);

  const variants: Variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 }
      }
    })
  };

  return (
    <div className="relative w-full lg:max-w-7xl mx-auto h-[354px] group flex flex-col items-center">
      {/* Featured Image Container */}
      <div className="relative w-full max-w-full h-[340px] rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 mb-4 bg-zinc-900/50 backdrop-blur-sm">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={displayImages[currentIndex]}
              alt={`Featured Product ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
        
        {displayImages.length > 1 && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-4 z-20">
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.7)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(-1)}
              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto border border-white/10"
            >
              <ChevronLeft size={24} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1, backgroundColor: "rgba(0,0,0,0.7)" }}
              whileTap={{ scale: 0.9 }}
              onClick={() => paginate(1)}
              className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto border border-white/10"
            >
              <ChevronRight size={24} />
            </motion.button>
          </div>
        )}
      </div>

      {/* Pagination Indicators */}
      <div className="flex justify-center items-center gap-2.5">
        {displayImages.map((_, index) => (
          <motion.div
            key={index}
            onClick={() => setPage([index, index > currentIndex ? 1 : -1])}
            animate={{
              width: currentIndex === index ? 32 : 8,
              backgroundColor: currentIndex === index ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.3)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`h-2 rounded-full cursor-pointer hover:bg-white/50 transition-colors`}
            style={{
              background: currentIndex === index ? 'linear-gradient(90deg, #7C4DFF 0%, #FF00C7 100%)' : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductHero;
