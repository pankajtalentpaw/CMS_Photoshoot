"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null;
  posterUrl?: string;
}

const VideoPreviewModal = ({ isOpen, onClose, videoUrl, posterUrl }: VideoPreviewModalProps) => {
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

  if (!videoUrl) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 md:p-10">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[500px] max-h-[90vh] aspect-[9/16] bg-[#0A0A0A] rounded-[32px] overflow-hidden border border-white/10 shadow-2xl z-10"
          >
            {/* Video Player */}
            <video
              src={videoUrl}
              poster={posterUrl}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-xl rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-all z-20 group"
            >
              <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
            </button>
            
            {/* Branding Watermark (Optional) */}
            <div className="absolute bottom-6 left-6 pointer-events-none opacity-50">
                <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Digital Atelier 360° Preview</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VideoPreviewModal;
