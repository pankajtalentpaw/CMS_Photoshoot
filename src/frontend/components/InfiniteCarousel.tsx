"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface InfiniteCarouselProps {
  items: string[];
  autoPlayInterval?: number;
}

const InfiniteCarousel = ({ items, autoPlayInterval = 4000 }: InfiniteCarouselProps) => {
  // 1. Cloned slides approach: [Last, 1, 2, 3, 4, First]
  // We wrap the items with clones at both ends
  const [slides] = useState([items[items.length - 1], ...items, items[0]]);
  
  // 2. Start from index 1 (the first real slide)
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const totalSlides = slides.length;
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Move to next slide
  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [isTransitioning]);

  // Move to previous slide
  const handlePrev = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  }, [isTransitioning]);

  // Handle the "Silent Jump" when transition ends
  const handleTransitionEnd = () => {
    setIsTransitioning(false);

    // 3. Handle Edge Cases:
    // When we finish transitioning to the clone of the first slide (at the very end)
    if (currentIndex >= totalSlides - 1) {
      setCurrentIndex(1); // Jump back to the actual first slide
    }
    // When we finish transitioning to the clone of the last slide (at the very beginning)
    else if (currentIndex <= 0) {
      setCurrentIndex(totalSlides - 2); // Jump to the actual last slide
    }
  };

  // 6. Support swipe/drag
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.nativeEvent.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.nativeEvent.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // 8. Auto-Play logic
  useEffect(() => {
    if (!autoPlayInterval) return;
    const interval = setInterval(handleNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [handleNext, autoPlayInterval]);

  // Calculate logical index for pagination dots
  const logicalIndex = (currentIndex === 0) 
    ? items.length - 1 
    : (currentIndex > items.length) 
      ? 0 
      : currentIndex - 1;

  return (
    <div className="relative w-full max-w-full md:max-w-[480px] md:mx-auto">
      <div className="relative w-full overflow-hidden rounded-[20px] shadow-2xl border border-white/10 group">
        <div
          onTransitionEnd={handleTransitionEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="flex cursor-grab active:cursor-grabbing"
          style={{
            // 4. Disable transition during the jump to avoid visual glitch
            transition: isTransitioning 
              ? "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)" 
              : "none",
            // 5. Normal sliding using translateX
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {slides.map((src, idx) => (
            <div key={idx} className="relative flex-none w-full aspect-[4/5]">
              <Image
                src={src}
                alt={`Sample Image ${idx}`}
                fill
                className="object-cover"
                priority={idx === 1} // Optimize LCP for first real slide
              />
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Indicators - Normalized */}
      <div className="flex justify-center gap-1.5 mt-6" role="tablist">
        {items.map((_, idx) => (
          <div
            key={idx}
            onClick={() => {
              if (isTransitioning) return;
              setIsTransitioning(true);
              setCurrentIndex(idx + 1);
            }}
            className={`h-1 rounded-full transition-all duration-500 ease-out cursor-pointer ${
              logicalIndex === idx ? "w-8 bg-[#AF8CFF] shadow-[0_0_10px_rgba(175,140,255,0.5)]" : "w-1.5 bg-white/10 hover:bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default InfiniteCarousel;
