"use client";

import FlowHeader from "@/frontend/components/FlowHeader";
import Footer from "@/frontend/components/Footer";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import { Download, Play, RefreshCcw, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useProject } from "@/frontend/context/ProjectContext";
import { useGeneration } from "@/frontend/context/GenerationContext";

type ResultItem = {
  title: string;
  image: string;
  isVideo: boolean;
  videoUrl?: string;
};

export default function ProductsOutputResultsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const styleParam = (params.style as string) || "home";
  const product = searchParams.get("product") || "Product";

  const { currentProject, resetProject } = useProject();
  const { resetGeneration } = useGeneration();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !currentProject?.outputViews?.length && !currentProject?.primeImage) {
      router.replace(`/products/${styleParam}/views?product=${product}`);
    }
  }, [isMounted, currentProject, router, styleParam, product]);

  const outputViews = currentProject?.outputViews || [];
  const generatedViewLabels = currentProject?.generatedViewLabels || [];

  const results: ResultItem[] = [
    ...(currentProject?.primeImage ? [{ title: "Prime Render", image: currentProject.primeImage, isVideo: false }] : []),
    ...outputViews.map((url: string, i: number) => ({
      title: generatedViewLabels[i] || `View ${i + 1}`,
      image: typeof url === "string" ? url : (url as any).url || "",
      isVideo: false,
    })),
    ...(currentProject?.videoUrl
      ? [{ title: "Contextual Video", image: currentProject?.primeImage || "", videoUrl: currentProject.videoUrl, isVideo: true }]
      : []),
  ];

  const handleDownloadAll = async () => {
    if (!results.length) return;
    try {
      setIsDownloading(true);
      const zip = new JSZip();
      await Promise.all(
        results.map(async (res, idx) => {
          const urlToFetch = res.videoUrl || res.image;
          if (!urlToFetch) return;
          const response = await fetch(`/api/proxy?url=${encodeURIComponent(urlToFetch)}`);
          if (!response.ok) return;
          const blob = await response.blob();
          let ext = res.isVideo ? "mp4" : "png";
          if (blob.type === "image/jpeg") ext = "jpg";
          else if (blob.type === "image/webp") ext = "webp";
          zip.file(`${res.title.replace(/\s+/g, "_")}_${idx + 1}.${ext}`, blob);
        })
      );
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Products_${styleParam}_views.zip`);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="relative min-h-screen bg-black text-white font-roboto">
      <FlowHeader title="Results" />

      <main className="w-full max-w-full lg:max-w-7xl mx-auto pt-[120px] px-5 pb-20 flex flex-col items-center">
        <ProgressStepper currentStep={4} partialStep={false} />

        <div className="w-full max-w-[353px] grid grid-cols-2 gap-3 mt-10 mb-8">
          {results.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="flex flex-col gap-2"
            >
              <div className="relative w-full aspect-[4/5] rounded-[14px] overflow-hidden bg-[#1A1E29] border border-white/10">
                <Image src={item.image} alt={item.title} fill className="object-cover" unoptimized />
                {item.isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-[#00A3FF] to-[#D100FF] flex items-center justify-center shadow-lg">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                )}
              </div>
              <span className="text-center text-[13px] font-medium text-white/80">{item.title}</span>
            </motion.div>
          ))}
        </div>

        <div className="w-full max-w-[353px] mb-4">
          <button
            onClick={() => router.push(`/products/${styleParam}/video-style?product=${product}`)}
            className="w-full h-[54px] rounded-full border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 transition-all text-white font-bold text-[15px]"
          >
            <PlayCircle className="w-5 h-5" />
            Create Video
          </button>
        </div>

        <div className="w-full max-w-[353px] flex flex-col gap-4">
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="w-full h-[61px] bg-gradient-to-r from-[#00A3FF] to-[#D100FF] rounded-full flex items-center justify-center gap-3 text-white font-bold text-[18px] shadow-[0_10px_40px_rgba(0,163,255,0.3)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isDownloading ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            Download All
          </button>
          <button
            onClick={() => { resetProject(); resetGeneration(); router.push("/"); }}
            className="w-full h-[61px] bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white font-bold text-[18px] hover:bg-white/10 transition-all active:scale-[0.98]"
          >
            Create New Project
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
