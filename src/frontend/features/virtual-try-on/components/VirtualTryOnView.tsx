"use client";

import React, { useState } from "react";
import FlowHeader from "@/frontend/components/FlowHeader";
import UploadZone from "@/frontend/components/UploadZone";
import { motion } from "framer-motion";
import { 
  Loader2, 
  Sparkles, 
  User, 
  Layout, 
  Check, 
  Download, 
  Share2, 
  RefreshCcw 
} from "lucide-react";
import { saveAs } from "file-saver";
import ProgressStepper from "@/frontend/components/ProgressStepper";
import Image from "next/image";
import { storageService } from "@/backend/services/storageService";
import { useSession } from "next-auth/react";
import ProductTag from "@/frontend/components/ProductTag";

type StatusResponse = {
  success?: boolean;
  status?: "pending" | "processing" | "completed" | "failed";
  outputImage?: string;
  outputImages?: string[];
  error?: string;
};

type FormErrors = {
  userImage?: string;
  clothingImage?: string;
  model?: string;
  background?: string;
  category?: string;
  style?: string;
  format?: string;
  submit?: string;
};

const AUDIENCE_OPTIONS = ["Male", "Female", "Kids"] as const;
const CATEGORIES_BY_AUDIENCE: Record<(typeof AUDIENCE_OPTIONS)[number], string[]> = {
  Male: ["Men T-Shirts", "Men Shirts", "Men Ethnic Wear"],
  Female: ["Women T-Shirts", "Women Dresses", "Women Ethnic Wear"],
  Kids: ["Kids T-Shirts", "Kids Dresses", "School Wear"],
};

const MODELS = [
  { name: "Model 1", image: "/Model_1.jpg" },
  { name: "Model 2", image: "/Model_2.jpg" },
  { name: "Model 3", image: "/Model_3.jpg" },
  { name: "Model 4", image: "/Model_4.jpg" },
  { name: "Model 5", image: "/Model_5.jpg" },
  { name: "Model 6", image: "/Model_6.jpg" },
  { name: "Model 7", image: "/Model_7.jpg" },
  { name: "Model 8", image: "/Model_8.jpg" },
];

const BACKGROUNDS = [
  { name: "White Studio", img: "/assets/Bg Images/White Studio.jpg" },
  { name: "Premium Studio", img: "/assets/Bg Images/Premium Studio.jpg" },
  { name: "Saree Festival", img: "/assets/Bg Images/Festival Studio.jpg" },
  { name: "Outdoor", img: "/assets/Bg Images/Outdoor.jpg" },
  { name: "Modern Office", img: "/assets/Bg Images/Modern Office.jpg" }
];

const OUTPUT_STYLES = ["Natural", "Sitting", "Outdoor"];
const OUTPUT_FORMATS = [
  { label: "Single", value: "single", count: 1 },
  { label: "3 Views", value: "triple", count: 3 },
  { label: "6 Views", value: "multi-view", count: 6 },
];
const RESULT_LABELS = ["Front View", "Left View", "Right View", "Drape Detail", "Borree Detail", "Border Close-up"];
const TRY_ON_PRODUCT_TYPES = ["Fabric", "Ready-made"] as const;

export const VirtualTryOnView = () => {
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const [clothingPhoto, setClothingPhoto] = useState<File | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"Virtual Try-On" | "AI Studio">("Virtual Try-On");
  const [tryOnProductType, setTryOnProductType] = useState<(typeof TRY_ON_PRODUCT_TYPES)[number]>("Fabric");
  const [userPoint, setUserPoint] = useState<{ x: number, y: number } | null>(null);
  const [clothingPoint, setClothingPoint] = useState<{ x: number, y: number } | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [backgroundStyle, setBackgroundStyle] = useState<string | null>(null);
  const [outputStyle, setOutputStyle] = useState<string | null>(null);
  const [audience, setAudience] = useState<(typeof AUDIENCE_OPTIONS)[number]>("Female");
  const [outputFormat, setOutputFormat] = useState<string>("multi-view");
  const [directorNotes, setDirectorNotes] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeResultIndex, setActiveResultIndex] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: session } = useSession();

  const isVirtualFlow = activeTab === "Virtual Try-On";
  const isFabricTryOn = isVirtualFlow && tryOnProductType === "Fabric";
  const requiresCategory = isFabricTryOn;
  const hasUserImage = Boolean(userPhoto);
  const hasClothingImage = Boolean(clothingPhoto);
  const hasCategory = Boolean(category);
  const hasStyle = Boolean(outputStyle);
  const hasFormat = Boolean(outputFormat);
  const hasRequiredCategory = requiresCategory ? hasCategory : true;

  const canSelectCategory = isVirtualFlow ? (hasUserImage && hasClothingImage) : false;
  const canSelectModel = !isVirtualFlow ? Boolean(clothingPhoto) : false;
  const canSelectBackground = !isVirtualFlow ? Boolean(clothingPhoto && selectedModel) : false;
  const canSelectStyle = isVirtualFlow ? (canSelectCategory && hasRequiredCategory) : canSelectBackground;
  const canAddNotes = isVirtualFlow ? (canSelectStyle && hasStyle && hasFormat) : Boolean(canSelectStyle && hasStyle);
  const canGenerateVirtual = hasUserImage && hasClothingImage && hasRequiredCategory && hasStyle && hasFormat;
  const canGenerate = loading ? false : canGenerateVirtual;

  const validateVirtualTryOnInputs = () => {
    const nextErrors: FormErrors = {};

    if (!userPhoto) {
      nextErrors.userImage = "User image is required";
    }

    if (!clothingPhoto) {
      nextErrors.clothingImage = "Clothing image is required";
    }

    if (requiresCategory && !category) {
      nextErrors.category = "Please select a clothing category";
    }

    if (!outputStyle) {
      nextErrors.style = "Please select an output style";
    }

    if (!outputFormat) {
      nextErrors.format = "Please select an output format";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };



  const handleGenerateTryOn = async () => {
    setSubmitError(null);

    if (!validateVirtualTryOnInputs()) {
      return;
    }

    if (!session?.user) {
      console.warn("User is not signed in, proceeding without authentication.");
    }

    setLoading(true);
    setResults([]);
    setActiveResultIndex(0);

    try {
      const userId = session?.user?.id ?? "guest-user";
      let modelUrl = selectedModel;
      let garmentUrl = "";

      // Public assets selected from the model picker are stored as relative paths.
      // Convert them to absolute URLs so backend URL validation accepts them.
      const ensurePublicUrl = async (url: string) => {
        if (!url) return url;
        
        let targetUrl = url;
        const isLocalPath = targetUrl.startsWith("/");
        const isLocalHost = targetUrl.includes("localhost:") || targetUrl.includes("127.0.0.1:");

        if (!isLocalPath && !isLocalHost) return url;

        if (isLocalHost) {
          try {
            const parsed = new URL(targetUrl);
            targetUrl = parsed.pathname + parsed.search;
          } catch (e) {}
        }

        try {
          const res = await fetch(targetUrl);
          const blob = await res.blob();
          const file = new File([blob], targetUrl.split("/").pop() || "asset.jpg", { type: blob.type });
          return await storageService.uploadGarment(userId || "guest", file);
        } catch (err) {
          console.error("Failed to auto-upload local asset:", targetUrl, err);
          return url;
        }
      };

      if (modelUrl) modelUrl = await ensurePublicUrl(modelUrl);
      if (garmentUrl) garmentUrl = await ensurePublicUrl(garmentUrl);

      if (clothingPhoto instanceof File) {
        garmentUrl = await storageService.uploadGarment(userId, clothingPhoto);
      }

      if (userPhoto instanceof File) {
        modelUrl = await storageService.uploadGarment(userId, userPhoto);
      }

      const resolvedOutputFormat = isVirtualFlow ? outputFormat : "single";
      const resolvedOutputCount = isVirtualFlow
        ? OUTPUT_FORMATS.find((option) => option.value === outputFormat)?.count || 6
        : 1;

      const payload = {
        garmentImageUrl: garmentUrl,
        modelImageUrl: modelUrl || undefined,
        style: outputStyle || "",
        outputFormat: resolvedOutputFormat,
        outputCount: resolvedOutputCount,
        background: !isVirtualFlow ? (backgroundStyle ?? undefined) : undefined,
        notes: directorNotes.trim() || undefined,
        mode: "Virtual Try-On",
        garmentType: tryOnProductType,
        ...(isFabricTryOn
          ? {
            gender: audience,
            category: category || undefined,
          }
          : {}),
        userPoint,
        clothingPoint,
      };

      console.log("[VirtualTryOn] Sending payload", {
        gender: payload.gender,
        category: payload.category,
        style: payload.style,
        outputFormat: payload.outputFormat,
        outputCount: payload.outputCount,
        hasUserImage: Boolean(payload.modelImageUrl),
        hasClothImage: Boolean(payload.garmentImageUrl),
        mode: payload.mode,
        hub: "Apparel",
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...payload, hub: "Apparel" }),
      });

      if (!response.ok) {
        const rawBody = await response.text();
        let parsed: { error?: string; message?: string } | null = null;

        if (rawBody) {
          try {
            parsed = JSON.parse(rawBody) as { error?: string; message?: string };
          } catch {
            parsed = null;
          }
        }

        const errorMessage =
          parsed?.error ||
          parsed?.message ||
          rawBody ||
          `Request failed (${response.status})`;

        console.error("[VirtualTryOn] Generate request failed", {
          status: response.status,
          error: errorMessage,
        });

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("[VirtualTryOn] Generate response", data);

      // Start polling for the real AI result
      const pollResult = async (jobId: string) => {
        try {
          const statusRes = await fetch(`/api/status?jobId=${jobId}`);
          const statusData = (await statusRes.json()) as StatusResponse;

          if (!statusRes.ok || statusData.success === false) {
            throw new Error(statusData.error || "Failed to fetch generation status");
          }

          if (statusData.status === "completed" && (statusData.outputImage || (statusData.outputImages?.length || 0) > 0)) {
            const images = (statusData.outputImages?.filter(Boolean) || []).length > 0
              ? (statusData.outputImages?.filter(Boolean) || [])
              : (statusData.outputImage ? [statusData.outputImage] : []);

            if (images.length === 0) {
              throw new Error("Generation completed but returned no images");
            }

            setResults(images);
            setActiveResultIndex(0);
            setLoading(false);
          } else if (statusData.status === "failed") {
            throw new Error(statusData.error || "AI generation failed");
          } else {
            // Still processing, poll again only if the result was successful so far
            if (statusData.error) {
              throw new Error(statusData.error);
            }
            setTimeout(() => pollResult(jobId), 3000);
          }
        } catch (err) {
          console.error("Polling error:", err);
          setLoading(false);
          const message = err instanceof Error ? err.message : "Failed to check generation status.";
          setSubmitError(message);
        }
      };

      if (data.jobId) {
        pollResult(data.jobId);
      } else {
        throw new Error("No Job ID returned from AI service");
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      setLoading(false);
      const message = error instanceof Error ? error.message : "Failed to start AI generation. Please check your connection.";
      setSubmitError(message);
    }
  };

  const resultItems = results.map((url, index) => ({
    label: RESULT_LABELS[index] || `View ${index + 1}`,
    url,
  }));

  const selectedModelLabel = MODELS.find((model) => model.image === selectedModel)?.name || "None";

  const activeResultUrl = resultItems[activeResultIndex]?.url || resultItems[0]?.url || "";
  const activeResultLabel = resultItems[activeResultIndex]?.label || "Result";

  const handleDownloadResult = async () => {
    if (!activeResultUrl) return;
    try {
      setIsDownloading(true);
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(activeResultUrl)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Failed to fetch image");
      
      const blob = await response.blob();
      let ext = "png";
      if (blob.type === "image/jpeg") ext = "jpg";
      else if (blob.type === "image/webp") ext = "webp";
      
      const filename = `TryOn_${activeResultLabel.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.${ext}`;
      saveAs(blob, filename);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download image. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareResult = async () => {
    if (!activeResultUrl) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Virtual Try-On Result",
          text: `Check my ${activeResultLabel}`,
          url: activeResultUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(activeResultUrl);
      setSubmitError("Result link copied. You can now share it.");
    } catch (error) {
      console.error("Share failed:", error);
      setSubmitError("Unable to share result right now.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#E2E2E8] font-roboto select-none">
      <FlowHeader title="Virtual Try-On" showBack={true} />

      <div className="max-w-[1400px] mx-auto pt-[120px] pb-10">
        {/* Tab selection bar removed as per request to focus only on Virtual Try-On */}


        {/* Main Content Flow */}
        <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column: Uploads & Controls */}
            <div className="flex flex-col gap-10">
              <ProgressStepper currentStep={isVirtualFlow ? 3 : 2} />

              {/* Upload Your Image (Only for Virtual Try-On) */}
              {activeTab === "Virtual Try-On" && (
                <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                  <div className="mb-6">
                    <h2 className="font-roboto font-semibold text-xl text-white mb-1">Upload Your Image</h2>
                    <p className="text-xs text-[#99A1AF]">Upload a clear photo of yourself for the virtual try-on.</p>
                  </div>
                  <UploadZone
                    onFileSelect={(file) => {
                      setUserPhoto(file);
                      setFormErrors((prev) => ({ ...prev, userImage: undefined }));
                    }}
                    title="Upload Image"
                    subTitle="Drag and drop or click to select"
                    allowPointSelection={true}
                    onPointSelect={setUserPoint}
                  />
                  {formErrors.userImage && <p className="text-xs text-red-400 mt-2">{formErrors.userImage}</p>}
                </section>
              )}

              {/* Upload Clothing Section */}
              <section className="bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                <div className="mb-6">
                  <h2 className="font-roboto font-semibold text-xl text-white mb-1">
                    Upload Clothing
                  </h2>
                  <p className="text-xs text-[#99A1AF]">
                    Upload a clear photo of the garment you want to try on.
                  </p>
                </div>
                <UploadZone
                  onFileSelect={(file) => {
                    setClothingPhoto(file);
                    setFormErrors((prev) => ({ ...prev, clothingImage: undefined }));
                  }}
                  title="Upload Image"
                  subTitle="Drag and drop or click to select"
                  allowPointSelection={true}
                  onPointSelect={setClothingPoint}
                />
                {formErrors.clothingImage && <p className="text-xs text-red-400 mt-2">{formErrors.clothingImage}</p>}
              </section>



              {/* AI Controls (Style, Format, Notes) */}
              <div className="space-y-8 bg-white/[0.02] border border-white/5 rounded-[32px] p-8">
                {/* Product/Person Types */}
                <div className="grid grid-cols-1 gap-6">
                  {activeTab === "Virtual Try-On" && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Product Type</h3>
                      <div className="flex flex-wrap gap-2">
                        {TRY_ON_PRODUCT_TYPES.map((option) => (
                          <ProductTag
                            key={option}
                            label={option}
                            selected={tryOnProductType === option}
                            onClick={() => {
                              setTryOnProductType(option);
                              if (option === "Ready-made") {
                                setCategory(null);
                                setFormErrors((prev) => ({ ...prev, category: undefined }));
                              }
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "Virtual Try-On" && isFabricTryOn && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Person Type</h3>
                      <div className="flex flex-wrap gap-2">
                        {AUDIENCE_OPTIONS.map((option) => (
                          <ProductTag
                            key={option}
                            label={option}
                            selected={audience === option}
                            onClick={() => {
                              setAudience(option);
                              setCategory(null);
                              setFormErrors((prev) => ({ ...prev, category: undefined }));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "Virtual Try-On" && isFabricTryOn && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Category</h3>
                      <div className="flex flex-wrap gap-2">
                        {(CATEGORIES_BY_AUDIENCE[audience] || []).map((c) => (
                          <ProductTag
                            key={c}
                            label={c}
                            selected={category === c}
                            onClick={() => {
                              if (!canSelectCategory) return;
                              setCategory(c);
                              setFormErrors((prev) => ({ ...prev, category: undefined }));
                            }}
                          />
                        ))}
                      </div>
                      {formErrors.category && <p className="text-xs text-red-400">{formErrors.category}</p>}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Output Style</h3>
                  <div className="flex flex-wrap gap-2">
                    {OUTPUT_STYLES.map((s) => (
                      <ProductTag
                        key={s}
                        label={s}
                        selected={outputStyle === s}
                        onClick={() => {
                          if (!canSelectStyle) return;
                          setOutputStyle(s);
                          setFormErrors((prev) => ({ ...prev, style: undefined }));
                        }}
                      />
                    ))}
                  </div>
                  {formErrors.style && <p className="text-xs text-red-400">{formErrors.style}</p>}
                </div>


                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">AI Director Notes</h3>
                    <span className="text-[10px] text-[#FF9E45] font-bold tracking-widest">(OPTIONAL)</span>
                  </div>
                  <textarea
                    value={directorNotes}
                    onChange={(e) => setDirectorNotes(e.target.value)}
                    placeholder="E.g. Focus on details, add warm sunlight..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:ring-1 focus:ring-[#7C4DFF] transition-all min-h-[100px] resize-none"
                  />
                </div>

                <button
                  onClick={handleGenerateTryOn}
                  disabled={!canGenerate}
                  className={`w-full py-5 rounded-[24px] font-bold text-[16px] tracking-wide transition-all ${canGenerate
                    ? "bg-gradient-to-r from-[#00A3FF] to-[#D100FF] text-white shadow-[0_12px_28px_rgba(0,163,255,0.3)] hover:scale-[1.02]"
                    : "bg-white/5 text-[#6E7180] border border-white/5 cursor-not-allowed"
                    }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Look...</span>
                    </div>
                  ) : "Generate Prime Image"}
                </button>

                {submitError && (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                    {submitError}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Results Dashboard */}
            <div className="sticky top-[140px] flex flex-col gap-6">
              <div className="bg-[#101323] border border-white/10 rounded-[32px] p-6 lg:p-8 min-h-[600px] flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Try-On Output</h2>
                    <span className="bg-gradient-to-r from-[#00A3FF] to-[#D100FF] text-[9px] font-bold px-2.5 py-1 rounded-full text-white uppercase">Live Render</span>
                  </div>
                  {resultItems.length > 0 && (
                    <span className="text-[11px] font-medium text-[#C2C6D6]">{resultItems.length} Views Generated</span>
                  )}
                </div>

                {/* Main Preview Area */}
                <div className="relative flex-1 bg-black/40 rounded-[24px] border border-white/5 overflow-hidden shadow-inner group mb-6">
                  {loading && results.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="mb-6"
                      >
                        <RefreshCcw className="w-12 h-12 text-[#00A3FF]" />
                      </motion.div>
                      <p className="text-xl font-bold text-white mb-2">Generating Your Look</p>
                      <p className="text-sm text-[#9CA3AF]">Stitching Virtual Try-On Views...</p>
                    </div>
                  ) : activeResultUrl ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeResultUrl}
                        alt={activeResultLabel}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                      
                      {/* Interaction Overlay */}
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={handleDownloadResult}
                          disabled={isDownloading}
                          className="h-12 px-6 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-sm font-bold flex items-center gap-2 hover:bg-black/80 transition-all shadow-xl"
                        >
                          {isDownloading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Download
                        </button>
                        <button
                          onClick={handleShareResult}
                          className="h-12 px-6 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-sm font-bold flex items-center gap-2 hover:bg-black/80 transition-all shadow-xl"
                        >
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-10 opacity-20">
                      <Layout className="w-16 h-16 mb-4" />
                      <p className="text-sm font-medium">Upload photos and click generate to see your studio results here.</p>
                    </div>
                  )}
                </div>

                {/* Thumbnails Grid */}
                {resultItems.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {resultItems.map((item, index) => (
                      <button
                        key={`${item.label}-${index}`}
                        onClick={() => setActiveResultIndex(index)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeResultIndex === index
                          ? "border-[#00A3FF] scale-105 shadow-[0_0_15px_rgba(0,163,255,0.4)]"
                          : "border-transparent opacity-40 hover:opacity-100"
                          }`}
                      >
                        <Image src={item.url} alt={item.label} fill className="object-cover" unoptimized />
                      </button>
                    ))}
                  </div>
                )}
                
                {activeResultUrl && (
                   <div className="mt-4 text-center">
                     <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">{activeResultLabel}</p>
                   </div>
                )}
              </div>
              

            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VirtualTryOnView;
