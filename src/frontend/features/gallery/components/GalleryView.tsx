"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import BottomNav from "@/frontend/components/BottomNav";
import Footer from "@/frontend/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, ImageOff } from "lucide-react";
import { useProject } from "@/frontend/context/ProjectContext";
import ProtectedRoute from "@/frontend/components/ProtectedRoute";

interface GalleryItem {
  jobId: string;
  hub: string;
  mode: string;
  productType: string;
  approved: boolean;
  status: string;
  outputImage: string | null;
  outputImages: string[];
  createdAt: string;
}

function useGallery() {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Fixed: Handle potential JSON parsing errors and HTTP status
    fetch("/api/gallery?type=all&limit=48")
      .then(async (r) => {
        if (!r.ok) {
          const errData = await r.json().catch(() => ({}));
          throw new Error(errData.error ?? "Failed to load gallery");
        }
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (data.success) {
          setImages(data.images ?? []);
          setVideos(data.videos ?? []);
        } else {
          setError(data.error ?? "Failed to load gallery");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load gallery");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return { images, videos, loading, error };
}

export default function GalleryView() {
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");
  const [mounted, setMounted] = useState(false);
  const { images, videos, loading, error } = useGallery();
  const { credits } = useProject();

  useEffect(() => { setMounted(true); }, []);

  const items = activeTab === "images" ? images : videos;

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen bg-black text-white selection:bg-figma-gradient/30 font-roboto">
        {/* Restored Original Header UI */}
        <FlowHeader title="My Gallery" />

        {/* Main Content */}
        <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 pb-[120px]">
          {/* Segmented Control - Restored to Original Design */}
          <div className="w-full h-[64px] bg-[#111111] rounded-[18px] p-1.5 flex gap-1.5 mb-8 shadow-inner border border-white/5">
            <button
              onClick={() => setActiveTab("images")}
              className={`flex-1 rounded-[14px] font-bold text-[16px] transition-all duration-300 ${
                activeTab === "images"
                  ? "bg-gradient-to-r from-[#00A3FF] to-[#D100FF] text-white shadow-lg"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Images
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`flex-1 rounded-[14px] font-bold text-[16px] transition-all duration-300 ${
                activeTab === "videos"
                  ? "bg-gradient-to-r from-[#00A3FF] to-[#D100FF] text-white shadow-lg"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              Videos
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[163/220] rounded-[22px] bg-white/[0.03] animate-pulse border border-white/5"
                />
              ))}
            </div>
          )}

          {/* Gallery Grid - Restored to Original Design */}
          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {items.map((item, idx) => {
                const src = item.outputImage ?? item.outputImages[0] ?? null;
                return (
                  <motion.div
                    key={item.jobId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="relative aspect-[163/220] rounded-[22px] overflow-hidden border border-white/10 group cursor-pointer bg-[#0A0A0A]"
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt="Generation"
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ImageOff className="w-8 h-8 text-white/10" />
                      </div>
                    )}

                    {activeTab === "videos" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#FF00C7] flex items-center justify-center shadow-xl opacity-90 group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty States */}
          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32 text-white/20">
              <div className="w-20 h-20 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                <ImageOff className="w-10 h-10 opacity-20" />
              </div>
              <p className="text-[15px] font-medium">No {activeTab} yet</p>
            </div>
          )}

          {error && (
            <div className="text-center py-32 text-red-400/60 font-medium">
              {error}
            </div>
          )}
        </main>

        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
