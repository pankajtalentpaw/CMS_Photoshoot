"use client";

import React, { useState } from "react";
import FlowHeader from "@/frontend/components/FlowHeader";
import UploadZone from "@/frontend/components/UploadZone";
import { motion } from "framer-motion";
import { Loader2, Sparkles, User, Layout, Check, Download, Share2 } from "lucide-react";
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
  { name: "White Studio", img: "/bg_white_studio.png" },
  { name: "Premium Studio", img: "/bg_premium_studio.png" },
  { name: "Saree Festival", img: "/bg_saree_festival.png" },
  { name: "Outdoor", img: "/bg_outdoor.png" },
  { name: "Modern Office", img: "/bg_modern_office.png" }
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
  const canGenerateAIStudio = Boolean(clothingPhoto && selectedModel && backgroundStyle && hasStyle);
  const canGenerate = loading ? false : (isVirtualFlow ? canGenerateVirtual : canGenerateAIStudio);

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

  const validateAIStudioInputs = () => {
    const nextErrors: FormErrors = {};

    if (!clothingPhoto) {
      nextErrors.clothingImage = "Product image is required";
    }

    if (!selectedModel) {
      nextErrors.model = "Please select a model";
    }

    if (!backgroundStyle) {
      nextErrors.background = "Please select a background style";
    }

    if (!outputStyle) {
      nextErrors.style = "Please select an output style";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleGenerateTryOn = async () => {
    setSubmitError(null);

    if (isVirtualFlow && !validateVirtualTryOnInputs()) {
      return;
    }

    if (!isVirtualFlow && !clothingPhoto) {
      setFormErrors({ clothingImage: "Product image is required" });
      return;
    }

    if (!isVirtualFlow && !validateAIStudioInputs()) {
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
      if (modelUrl && modelUrl.startsWith("/")) {
        modelUrl = `${window.location.origin}${modelUrl}`;
      }

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
        mode: isVirtualFlow ? "Virtual Try-On" : "AI Studio",
        ...(isVirtualFlow
          ? {
            garmentType: tryOnProductType,
            ...(isFabricTryOn
              ? {
                gender: audience,
                category: category || undefined,
              }
              : {}),
            userPoint,
            clothingPoint,
          }
          : {}),
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
      });

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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

  const handleDownloadResult = () => {
    if (!activeResultUrl) return;
    const link = document.createElement("a");
    link.href = activeResultUrl;
    link.download = `${activeResultLabel.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.click();
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
        <div className="flex border-b border-white/5 mb-8 px-5 md:px-6">
          <button
            onClick={() => setActiveTab("Virtual Try-On")}
            className={`px-8 py-4 font-bold text-sm transition-all relative ${activeTab === "Virtual Try-On"
              ? "text-white"
              : "text-[#9CA3AF] hover:text-white"
              }`}
          >
            Virtual Try-On
            {activeTab === "Virtual Try-On" && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-figma-gradient shadow-[0_0_10px_rgba(124,77,255,0.5)]" />
            )}
          </button>
        </div>

        {/* Main Content Flow */}
        {/* Right Panel - Results & Controls */}
        <main className="w-full flex-1 max-w-full lg:max-w-7xl mx-auto pt-[40px] px-5 flex flex-col transition-all duration-500">
          <div className="flex flex-col gap-12 mb-20">
            <ProgressStepper currentStep={isVirtualFlow ? 3 : 2} />

            {/* Upload Sections Layer */}
            <div className="flex flex-col gap-12">
              {/* 1. Upload User Photo (Only for Virtual Try-On) */}
              {activeTab === "Virtual Try-On" && (
                <section>
                  <div className="mb-6">
                    <h1 className="font-roboto font-semibold text-2xl text-white mb-2">Upload Your Image</h1>
                    <p className="text-sm text-[#99A1AF]">Upload a clear photo of yourself for the virtual try-on.</p>
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

              {/* 2. Upload Clothing Image */}
              <section>
                <div className="mb-6">
                  <h1 className="font-roboto font-semibold text-2xl text-white mb-2">
                    {activeTab === "AI Studio" ? "Upload Product" : "Upload Clothing"}
                  </h1>
                  <p className="text-sm text-[#99A1AF]">
                    {activeTab === "AI Studio"
                      ? "Upload a clear photo of the product you want to studio-ize."
                      : "Upload a clear photo of the garment you want to try on."}
                  </p>
                </div>
                <UploadZone
                  onFileSelect={(file) => {
                    setClothingPhoto(file);
                    if (activeTab === "AI Studio") {
                      setSelectedModel(null);
                      setBackgroundStyle(null);
                      setOutputStyle(null);
                      setFormErrors((prev) => ({ ...prev, model: undefined, background: undefined, style: undefined }));
                    }
                    setFormErrors((prev) => ({ ...prev, clothingImage: undefined }));
                  }}
                  title="Upload Image"
                  subTitle="Drag and drop or click to select"
                  allowPointSelection={true}
                  onPointSelect={setClothingPoint}
                />
                {formErrors.clothingImage && <p className="text-xs text-red-400 mt-2">{formErrors.clothingImage}</p>}
              </section>
            </div>
            {activeTab === "AI Studio" && (
              <div className="rounded-2xl border border-white/10 bg-[#101323] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF] mb-3">AI Studio Steps</h3>
                <ol className="grid gap-2 text-sm text-[#C2C6D6]">
                  <li>1. Upload Product Image</li>
                  <li>2. Select Model</li>
                  <li>3. Select Background Style</li>
                  <li>4. Select Output Style</li>
                  <li>5. Add AI Director Notes (optional)</li>
                  <li>6. Generate Image</li>
                  <li>7. View Output</li>
                </ol>
              </div>
            )}

            {/* Select Model Section (AI Studio) */}
            {activeTab === "AI Studio" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Model</h3>
                  <span className="text-[11px] font-semibold text-[#C2C6D6]">Selected: {selectedModelLabel}</span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                  {MODELS.map((model) => (
                    <div key={model.image} className="space-y-2">
                      <button
                        onClick={() => {
                          if (!canSelectModel) return;
                          setSelectedModel(model.image);
                          setBackgroundStyle(null);
                          setOutputStyle(null);
                          setFormErrors((prev) => ({ ...prev, model: undefined, background: undefined, style: undefined }));
                        }}
                        disabled={!canSelectModel}
                        className={`relative aspect-[3/4] w-full rounded-xl overflow-hidden border-2 transition-all ${selectedModel === model.image ? "border-[#7C3AED] scale-105 shadow-[0_0_20px_rgba(124,58,237,0.4)]" : "border-transparent opacity-60 hover:opacity-100"
                          }`}
                      >
                        <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
                        <div className="absolute top-1 left-1 px-1.5 py-1 rounded-md bg-black/80 border border-white/20">
                          <p className="text-[10px] leading-none text-white font-bold">{model.name}</p>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-1 py-1">
                          <p className="text-[10px] leading-none text-white font-semibold truncate">{model.name}</p>
                        </div>
                        {selectedModel === model.image && (
                          <div className="absolute top-1 right-1 bg-[#7C3AED] rounded-md p-0.5">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                      <div className={`h-6 rounded-md border flex items-center justify-center px-1 ${selectedModel === model.image ? "border-[#7C3AED] bg-[#7C3AED]/20" : "border-white/20 bg-black/40"}`}>
                        <p className={`text-xs leading-none font-bold ${selectedModel === model.image ? "text-[#EBDDFF]" : "text-white"}`}>
                          {model.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {formErrors.model && <p className="text-xs text-red-400">{formErrors.model}</p>}
                {!canSelectModel && (
                  <p className="text-xs text-[#9CA3AF]">Upload a product image to unlock model selection.</p>
                )}
              </div>
            )}

            {/* Background Style Section (Only for AI Studio) */}
            {activeTab === "AI Studio" && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Background Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {BACKGROUNDS.map((bg, idx) => (
                    <div key={idx} className="space-y-2 group">
                      <button
                        onClick={() => {
                          if (!canSelectBackground) return;
                          setBackgroundStyle(bg.name);
                          setOutputStyle(null);
                          setFormErrors((prev) => ({ ...prev, background: undefined, style: undefined }));
                        }}
                        disabled={!canSelectBackground}
                        className={`relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${backgroundStyle === bg.name ? "border-[#7C3AED] scale-102 shadow-[0_0_15px_rgba(124,58,237,0.3)]" : "border-transparent opacity-60 hover:opacity-90"
                          }`}
                      >
                        <img src={bg.img} alt={bg.name} className="w-full h-full object-cover" />
                      </button>
                      <p className={`text-[10px] font-bold text-center transition-colors ${backgroundStyle === bg.name ? "text-[#7C3AED]" : "text-[#9CA3AF]"}`}>
                        {bg.name}
                      </p>
                    </div>
                  ))}
                </div>
                {formErrors.background && <p className="text-xs text-red-400">{formErrors.background}</p>}
                {!canSelectBackground && (
                  <p className="text-xs text-[#9CA3AF]">Select a model to unlock backgrounds.</p>
                )}
              </div>
            )}

            {/* Controls and Output Section */}
            <div className="flex flex-col gap-16">
              <div className="w-full space-y-16">
                {/* Gender and Category */}
                <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-1 gap-8">
                  {/* Product type (Virtual Try-On only) */}
                  {activeTab === "Virtual Try-On" && (
                    <div className="space-y-5 col-span-2 lg:col-span-1">
                      <h3 className="text-sm font-bold text-white">Product Type</h3>
                      <div className="flex flex-wrap gap-3">
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

                  {/* Gender selection (Virtual Try-On prompt control) */}
                  {activeTab === "Virtual Try-On" && isFabricTryOn && (
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-white">Person Type</h3>
                      <div className="flex flex-wrap gap-3">
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

                  {/* Category selection (Only relevant for apparel-like items) */}
                  {activeTab === "Virtual Try-On" && isFabricTryOn && (
                    <div className="space-y-5">
                      <h3 className="text-sm font-bold text-white">Clothing Category</h3>
                      <div className="flex flex-wrap gap-3">
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

                {/* Output Style (Both modes) */}
                <div className="space-y-5">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Output Style</h3>
                  <div className="flex flex-wrap gap-3">
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

                {isVirtualFlow && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Output Format</h3>
                    <div className="flex flex-wrap gap-3">
                      {OUTPUT_FORMATS.map((option) => (
                        <ProductTag
                          key={option.value}
                          label={option.label}
                          selected={outputFormat === option.value}
                          onClick={() => {
                            setOutputFormat(option.value);
                            setFormErrors((prev) => ({ ...prev, format: undefined }));
                          }}
                        />
                      ))}
                    </div>
                    {formErrors.format && <p className="text-xs text-red-400">{formErrors.format}</p>}
                  </div>
                )}

                {/* AI Director Notes (Both modes) */}
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">AI Director Notes</h3>
                    <span className="text-[10px] text-[#FF9E45] font-bold tracking-widest">(OPTIONAL)</span>
                  </div>
                  <textarea
                    value={directorNotes}
                    onChange={(e) => setDirectorNotes(e.target.value)}
                    placeholder="E.g. Focus on the golden pallu details, add warm sunlight flare from left..."
                    disabled={!canAddNotes}
                    className="w-full bg-[#0F111A] border border-white/10 rounded-2xl p-5 text-sm text-gray-300 placeholder-gray-700 focus:ring-1 focus:ring-[#5B45FF] transition-all min-h-[120px] resize-none"
                  />
                </div>

                {/* Generate Button Container */}
                <div className="space-y-6 pt-4">
                  <button
                    onClick={handleGenerateTryOn}
                    disabled={!canGenerate}
                    className={`w-full py-5 rounded-[24px] font-bold text-sm tracking-wide transition-all ${canGenerate
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#EC4899] text-white shadow-[0_12px_28px_rgba(124,77,255,0.4)] hover:scale-[1.02]"
                      : "bg-[#2D324D]/50 text-[#6E7180] border border-white/5 cursor-not-allowed"
                      }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>AI Processing...</span>
                      </div>
                    ) : "Generate Prime Image"}
                  </button>

                  {submitError && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                      {submitError}
                    </div>
                  )}

                  {results.length === 0 && !loading && (
                    <div className="flex flex-col items-center text-center">
                      <Sparkles className="w-8 h-8 text-[#FF9E45] opacity-50 mb-3" />
                      <h4 className="text-sm font-bold text-white mb-2 font-roboto">Studio Results</h4>
                      <p className="text-[11px] text-[#9CA3AF] leading-relaxed max-w-[200px]">
                        Generate your look once to see Front, Side, Back, and Detail views instantly.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Grid Column */}
              <div className="flex-grow bg-[#0F111A] rounded-[24px] p-6 border border-white/5 min-h-[600px] h-fit">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">Trial Results</h2>
                  <span className="bg-[#5B45FF] text-[9px] font-bold px-2 py-0.5 rounded-md text-white">360° STUDIO</span>
                </div>

                {resultItems.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-3 text-xs text-[#9CA3AF]">All generated views ({resultItems.length})</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {resultItems.map((item, index) => (
                        <button
                          key={`${item.label}-${index}`}
                          onClick={() => setActiveResultIndex(index)}
                          className={`relative overflow-hidden rounded-xl border text-left transition-all ${activeResultIndex === index
                            ? "border-[#5B45FF] shadow-[0_0_0_1px_rgba(91,69,255,0.5)]"
                            : "border-white/10 hover:border-white/30"
                            }`}
                        >
                          <div className="relative aspect-[4/3] bg-[#1A1D2B]">
                            <Image src={item.url} alt={item.label} fill className="object-cover" unoptimized />
                          </div>
                          <div className="px-2.5 py-2 text-[11px] font-semibold text-[#C2C6D6] bg-[#121522]">
                            {item.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative min-h-[500px] bg-[#11131E] rounded-[32px] border border-white/5 overflow-hidden shadow-2xl">
                  {loading && results.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                      <Loader2 className="w-12 h-12 animate-spin text-[#7C4DFF] mb-6" />
                      <p className="text-2xl font-bold text-white mb-2">Stitching 360° Studio Look</p>
                      <p className="text-sm text-[#9CA3AF]">Creating 360° Studio Views... Wait</p>
                    </div>
                  )}

                  {!loading && activeResultUrl && (
                    <>
                      <div className="absolute inset-0">
                        <Image
                          src={activeResultUrl}
                          alt={activeResultLabel}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>

                      <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        <button
                          onClick={handleDownloadResult}
                          className="h-10 px-4 rounded-lg bg-black/55 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 hover:bg-black/70"
                        >
                          <Download className="w-4 h-4" /> Download
                        </button>
                        <button
                          onClick={handleShareResult}
                          className="h-10 px-4 rounded-lg bg-black/55 border border-white/20 text-white text-sm font-semibold flex items-center gap-2 hover:bg-black/70"
                        >
                          <Share2 className="w-4 h-4" /> Share
                        </button>
                      </div>
                    </>
                  )}

                  {!loading && !activeResultUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                      <Layout className="w-14 h-14" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VirtualTryOnView;
