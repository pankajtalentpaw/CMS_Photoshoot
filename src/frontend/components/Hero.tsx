"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const carouselImages = [
  "/hero_slide_1.png",
  "/hero_slide_2.png",
  "/hero_slide_3.png"
];

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  // Auto-slide every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const setStep = (idx: number) => {
    setDirection(idx > currentIndex ? 1 : -1);
    setCurrentIndex(idx);
  };

  const slideVariants: Variants = {
    hidden: (dir: number) => ({
      x: dir > 0 ? "100%" : "-100%",
    }),
    visible: {
      x: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
      },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? "-100%" : "100%",
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
      },
    }),
  };

  return (
    <section
      aria-label="Featured showcase carousel"
      aria-roledescription="carousel"
      className="relative w-full max-w-full lg:max-w-7xl h-[261px] lg:h-[450px] mx-auto mt-[119px] mb-8 group"
    >
      {/* Hero Banner Container */}
      <div className="relative w-full h-[247px] lg:h-[420px] overflow-hidden rounded-[20px] glass shadow-2xl">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute inset-0 w-full h-full"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);
              if (swipe < -swipeConfidenceThreshold) {
                handleNext();
              } else if (swipe > swipeConfidenceThreshold) {
                handlePrev();
              }
            }}
          >
            <Image
              src={carouselImages[currentIndex]}
              alt={`Hero Banner ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 353px, 1280px"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />

        {/* Navigation Arrows (Hidden on mobile, visible on desktop hover) */}
        <button
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-md hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
        >
          <ChevronLeft className="w-5 h-5 text-white" aria-hidden="true" />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 border border-white/20 backdrop-blur-md hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-10"
        >
          <ChevronRight className="w-5 h-5 text-white" aria-hidden="true" />
        </button>
      </div>

      {/* Pagination Indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center gap-1.5 h-[14px]" role="tablist" aria-label="Carousel slides">
        {carouselImages.map((_, idx) => (
          <button
            key={idx}
            role="tab"
            onClick={() => setStep(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            aria-selected={idx === currentIndex}
            className={`h-[7px] rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-[24.5px] bg-figma-gradient"
                : "w-[7px] bg-[#D9D9D9] hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

// Swipe helpers
const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export default Hero;
