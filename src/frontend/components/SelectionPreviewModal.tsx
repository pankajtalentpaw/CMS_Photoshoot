"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

interface SelectionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: string | null;
}

const SelectionPreviewModal = ({ isOpen, onClose, image }: SelectionPreviewModalProps) => {
  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!image) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          {/* Overlay (Rectangle 50) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Container (Rectangle 26) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg lg:max-w-xl aspect-[353/569] bg-[#1A1E29] rounded-[20px] overflow-hidden border border-[#2E1C4D] shadow-2xl z-10"
          >
            {/* Model Image Preview */}
            <Image
              src={image}
              alt="Model Preview"
              fill
              sizes="(max-width: 768px) 90vw, 768px"
              loading="lazy"
              className="object-cover"
            />

            {/* Premium Gradient Overlay (Subtle) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Close Button (Frame/Vector) */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-10 h-10 bg-black/20 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-20"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            {/* Optional: Selection Label or Status could go here */}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SelectionPreviewModal;
