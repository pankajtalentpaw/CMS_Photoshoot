"use client";

import { motion } from "framer-motion";
import BrandLogo from "@/frontend/components/BrandLogo";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        className="relative flex flex-col items-center gap-8"
      >
        {/* Modern Brand Pulse */}
        <div className="relative">
          <BrandLogo className="w-32 md:w-48 h-auto" />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-gradient-to-r from-[#00C2FF] via-[#7C4DFF] to-[#FF00C7] blur-3xl -z-10 rounded-full"
          />
        </div>

        {/* Professional Loading Indicator */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -6, 0],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 0.6, 
                  repeat: Infinity, 
                  delay: i * 0.15 
                }}
                className="w-2 h-2 rounded-full bg-gradient-to-r from-[#00C2FF] to-[#FF00C7]"
              />
            ))}
          </div>
          <p className="font-manrope text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] font-bold">
            Synchronizing Ecosystem
          </p>
        </div>
      </motion.div>
    </div>
  );
}
