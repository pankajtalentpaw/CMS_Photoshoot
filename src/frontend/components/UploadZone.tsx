"use client";

import { Upload, Camera, X, Sparkles, Check, Crosshair } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import Image from "next/image";

interface UploadZoneProps {
  onFileSelect?: (file: File | null) => void;
  hideText?: boolean;
  allowPointSelection?: boolean;
  onPointSelect?: (point: { x: number; y: number } | null) => void;
  title?: string;
  subTitle?: string;
  icon?: React.ReactNode;
}

const UploadZone = ({ 
  onFileSelect, 
  hideText = false, 
  allowPointSelection = false, 
  onPointSelect,
  title,
  subTitle,
  icon
}: UploadZoneProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [markerPoint, setMarkerPoint] = useState<{ x: number; y: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File must be less than 10MB");
        return;
      }
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setMarkerPoint(null); // Reset marker on new file
      onPointSelect?.(null);
      onFileSelect?.(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImage(null);
    setMarkerPoint(null);
    onPointSelect?.(null);
    onFileSelect?.(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!allowPointSelection || !imageContainerRef.current) return;
    
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const point = { x, y };
    setMarkerPoint(point);
    onPointSelect?.(point);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      {/* The capture attribute forces camera on mobile devices */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      <motion.div
        whileHover={!selectedImage ? { borderColor: "rgba(124,77,255,0.4)", backgroundColor: "rgba(46,28,77,0.2)" } : {}}
        onClick={() => !selectedImage && fileInputRef.current?.click()}
        className={`relative w-full bg-[#11131E] border ${
          selectedImage ? "border-transparent p-0 overflow-hidden h-[440px]" : "border-dashed border-white/5 py-16 min-h-[440px]"
        } rounded-[32px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 gap-0 group shadow-2xl`}
      >
        <AnimatePresence mode="wait">
          {selectedImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`w-full h-full relative ${allowPointSelection ? "cursor-crosshair" : ""}`}
              onClick={handleImageClick}
              ref={imageContainerRef}
            >
              <Image 
                src={selectedImage} 
                alt="Uploaded preview" 
                fill 
                className="object-contain" 
                loading="lazy"
                unoptimized
              />

              {/* Point Marker */}
              {allowPointSelection && markerPoint && (
                <div 
                  className="absolute z-20 pointer-events-none"
                  style={{ left: `${markerPoint.x}%`, top: `${markerPoint.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div 
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-xl border border-[#00C2FF]/50 flex items-center justify-center shadow-[0_0_20px_rgba(0,194,255,0.3)]"
                  >
                    <Sparkles className="w-6 h-6 text-[#00C2FF]" fill="#00C2FF" />
                  </motion.div>
                </div>
              )}

              <button
                onClick={clearImage}
                className="absolute top-4 right-4 w-9 h-9 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10 shadow-lg border border-white/10"
              >
                <X size={18} />
              </button>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-4 px-5 z-10 w-full pointer-events-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="flex-1 max-w-[160px] h-[44px] flex items-center justify-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-[#7C3AED] rounded-[14px] hover:bg-black/60 transition-all font-roboto font-medium text-[13px] text-white cursor-pointer"
                >
                  <Camera size={16} /> Retake
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex-1 max-w-[160px] h-[44px] flex items-center justify-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 hover:border-[#7C3AED] rounded-[14px] hover:bg-black/60 transition-all font-roboto font-medium text-[13px] text-white cursor-pointer"
                >
                  <Upload size={16} /> Re-upload
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full px-6"
            >
              {/* Reference Box UI from Screenshot */}
              <div className="w-full border-2 border-dashed border-white/10 rounded-[24px] p-8 flex flex-col items-center bg-white/[0.02] mb-8">
                <motion.div 
                  animate={{ 
                    y: [0, -5, 0],
                    boxShadow: [
                      "0 0 20px rgba(124,58,237,0.2)",
                      "0 0 35px rgba(236,72,153,0.4)",
                      "0 0 20px rgba(124,58,237,0.2)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[60px] h-[60px] bg-gradient-to-br from-[#7C3AED] to-[#EC4899] rounded-full flex items-center justify-center mb-6"
                >
                    <Upload className="w-[28px] h-[28px] text-white" strokeWidth={2.5} />
                </motion.div>

                <h3 className="font-roboto font-bold text-[20px] text-white mb-2 text-center">
                  {title || "Upload Product Image"}
                </h3>
                <p className="font-roboto font-normal text-[14px] text-[#9CA3AF] text-center mb-0 leading-tight">
                  {subTitle || "Drag and drop or click to select"}
                </p>
                <p className="font-roboto text-[11px] text-[#9CA3AF]/50 mt-2 uppercase tracking-widest font-bold">
                   Supports JPG, PNG (Max 10MB)
                </p>
              </div>

              {/* Primary Action Buttons — Side-by-Side row */}
              <div className="flex flex-row gap-4 w-full max-w-[400px]">
                <button 
                  onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                  className="flex-1 h-[54px] flex items-center justify-center gap-3 bg-[#1A1E29] border border-white/10 rounded-[14px] hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <Camera className="w-[18px] h-[18px] text-white/70 group-hover:text-white" strokeWidth={1.5} />
                  <span className="font-roboto font-bold text-[15px] text-white/80 group-hover:text-white">
                    Take Photo
                  </span>
                </button>

                <button 
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex-1 h-[54px] flex items-center justify-center gap-3 bg-[#1A1E29] border border-white/10 rounded-[14px] hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <Upload className="w-[18px] h-[18px] text-white/70 group-hover:text-white" strokeWidth={1.5} />
                  <span className="font-roboto font-bold text-[15px] text-white/80 group-hover:text-white">
                    Upload
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default UploadZone;
