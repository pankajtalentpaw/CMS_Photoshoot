"use client";

import { motion } from "framer-motion";

export const Skeleton = ({ className = "" }: { className?: string }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-white/5 rounded-lg ${className}`}
    >
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{ 
          repeat: Infinity, 
          duration: 1.5, 
          ease: "linear" 
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="w-full h-full p-4 border border-white/5 rounded-2xl bg-white/5">
    <Skeleton className="w-full aspect-[4/5] mb-4" />
    <Skeleton className="w-2/3 h-6 mb-2" />
    <Skeleton className="w-1/2 h-4" />
  </div>
);
