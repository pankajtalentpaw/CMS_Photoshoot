// src/services/runComfyService.ts
import { env } from "@/shared/config/env";
import { buildMasterPrompt, type Hub, type PromptInputs, type Background, type VideoStyle } from "@/backend/services/ai/promptEngine";
import { buildLegacyPrompt } from "@/backend/services/ai/legacyPrompts";
import { buildVideoPrompt } from "@/backend/services/ai/videoPrompts";

// Node IDs from ComfyUI Workflow (Customize based on your workflow_api.json)
const DEFAULT_MODEL_ID = "blackforestlabs/flux-2/dev/text-to-image";
const MODEL_API_BASE_URL = "https://model-api.runcomfy.net/v1";
const DEPLOYMENT_API_BASE_URL = "https://api.runcomfy.net/prod/v1";

type RunComfyStatus = "queued" | "processing" | "completed" | "failed";

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function resolveBaseUrl(configuredBaseUrl: string, deploymentId?: string) {
  const cleanedConfigured = configuredBaseUrl.trim();
  const deploymentMode = Boolean(deploymentId);

  if (!cleanedConfigured) {
    return deploymentMode ? DEPLOYMENT_API_BASE_URL : MODEL_API_BASE_URL;
  }

  // When deployment mode is enabled, model-api host cannot serve /deployments/{id}/inference.
  if (deploymentMode && /model-api\.runcomfy\.net/i.test(cleanedConfigured)) {
    return DEPLOYMENT_API_BASE_URL;
  }

  return cleanedConfigured;
}

function getRunComfyConfig() {
  const apiKey = (env.RUNCOMFY_API_KEY || env.VITE_RUNCOMFY_API_KEY || "").trim();
  const deploymentId = env.RUNCOMFY_DEPLOYMENT_ID?.trim();
  const modelId = (env.RUNCOMFY_MODEL_ID || env.VITE_RUNCOMFY_MODEL_ID || DEFAULT_MODEL_ID).trim();
  const configuredBaseUrl = (env.RUNCOMFY_API_URL || env.VITE_RUNCOMFY_API_URL || "").trim();

  const baseUrl = normalizeBaseUrl(resolveBaseUrl(configuredBaseUrl, deploymentId));

  const videoModelId = env.RUNCOMFY_VIDEO_MODEL_ID?.trim() || modelId;
  const videoDeploymentId = env.RUNCOMFY_VIDEO_DEPLOYMENT_ID?.trim() || deploymentId;

  return {
    apiKey,
    deploymentId,
    modelId,
    videoModelId,
    videoDeploymentId,
    baseUrl,
    isDeploymentMode: Boolean(deploymentId),
  };
}

function isTextToImageModel(modelId: string) {
  return /text-to-image/i.test(modelId);
}

function isNanoBananaEditModel(modelId: string) {
  return /google\/nano-banana\/pro\/edit/i.test(modelId);
}

function isSeedreamEditModel(modelId: string) {
  return /bytedance\/seedream-4-5\/edit/i.test(modelId) && !/sequential/i.test(modelId);
}

function isSeedreamSequentialModel(modelId: string) {
  return /bytedance\/seedream-4-5\/edit-sequential/i.test(modelId);
}

function isImageEditModel(modelId: string) {
  return isNanoBananaEditModel(modelId) || isSeedreamEditModel(modelId);
}

function buildNanoBananaEditPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio" | "VIDEO_GENERATION";
  gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
  garmentType?: "Fabric" | "Ready-made";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  // Hub fields
  hub?: Hub;
  segment?: string;
  wearType?: string;
  productType?: string;
  jewelleryGenre?: string;
  jewelleryStyle?: string;
  accessoryType?: string;
  productFamily?: string;
  outputStyleV2?: string;
  outputViews?: string[];
  videoStyle?: string;
}) {
  const base = buildModelPayload({
    ...params,
    userPoint: null,
    clothingPoint: null,
  });

  // Pydantic error path shows this model expects `input.image_urls[0]`.
  // Provide both images to maximize conditioning: model/person first, then product reference.
  const imageUrls = [params.modelImageUrl, params.garmentImageUrl].filter(Boolean);

  const outputFormat = base.output_format || "png";
  // This model is an image edit endpoint; keep a stable mode string.
  const editMode = "edit";

  // Model validation errors show the schema expects top-level fields (prompt, image_urls, ...).
  return {
    prompt: base.prompt,
    image_urls: imageUrls,
    num_outputs: base.num_outputs,
    output_format: outputFormat,
    mode: editMode,
  };
}

function buildSeedreamSequentialPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio" | "VIDEO_GENERATION";
  gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
  garmentType?: "Fabric" | "Ready-made";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  // Hub fields
  hub?: Hub;
  segment?: string;
  wearType?: string;
  productType?: string;
  jewelleryGenre?: string;
  jewelleryStyle?: string;
  accessoryType?: string;
  productFamily?: string;
  outputStyleV2?: string;
  outputViews?: string[];
  videoStyle?: string;
}) {
  const base = buildModelPayload({
    ...params,
    userPoint: null,
    clothingPoint: null,
  });

  const imageUrls = [params.modelImageUrl, params.garmentImageUrl].filter(Boolean);
  const requestedCount = base.num_outputs || 1;

  // Pydantic is expecting root-level fields
  return {
    prompt: base.prompt,
    images: imageUrls,
    mode: "edit",
    num_outputs: requestedCount,
    output_format: base.output_format || "png",
    sequential_image_generation_options: requestedCount
  };
}

function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

function isTransientStatus(status: number) {
  // Cloudflare / gateway / overload responses that should be retried.
  return [408, 425, 429, 500, 502, 503, 504, 520, 521, 522, 523, 524].includes(status);
}

function scoreCandidate(url: string, sourceHint: string) {
  let score = 0;
  const composite = `${sourceHint} ${url}`.toLowerCase();

  // Prioritize final/generated assets.
  if (/(output|result|generated|tryon|try-on|final|render|prediction|preview)/.test(composite)) {
    score += 4;
  }

  // De-prioritize references and inputs that often appear in payload echoes.
  if (/(input|garment|cloth|mask|source|original|ref|reference|upload)/.test(composite)) {
    score -= 6;
  }

  return score;
}

function mapRunComfyStatus(statusRaw: string | undefined): RunComfyStatus {
  const status = (statusRaw || "").toLowerCase();

  if (["completed", "succeeded", "success"].includes(status)) {
    return "completed";
  }

  if (["failed", "error", "cancelled", "canceled"].includes(status)) {
    return "failed";
  }

  if (["in_queue", "queued", "pending"].includes(status)) {
    return "queued";
  }

  return "processing";
}

async function parseErrorResponse(response: Response) {
  const bodyText = await response.text();

  if (!bodyText) {
    return `${response.status} ${response.statusText}`;
  }

  try {
    const parsed = JSON.parse(bodyText) as { message?: string; error?: string; detail?: string };
    return parsed.message || parsed.error || parsed.detail || bodyText;
  } catch {
    return bodyText;
  }
}

function extractOutputImage(payload: unknown): string | null {
  const images = extractOutputImages(payload);
  return images[0] || null;
}

function extractOutputImages(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  const data = payload as Record<string, unknown>;
  const candidates: Array<{ url: string; score: number }> = [];

  const appendUrl = (value: unknown, sourceHint = "") => {
    if (typeof value === "string" && isUrl(value) && !candidates.some((entry) => entry.url === value)) {
      candidates.push({ url: value, score: scoreCandidate(value, sourceHint) });
    }
  };

  const directOutput = data.output as Record<string, unknown> | undefined;
  appendUrl(directOutput?.image, "output.image");

  const videos = directOutput?.videos;
  if (Array.isArray(videos)) {
    videos.forEach((entry) => appendUrl(entry, "output.videos[]"));
  }

  if (Array.isArray(data.outputs)) {
    data.outputs.forEach((entry) => {
      const result = entry as Record<string, unknown> | undefined;
      appendUrl(result?.url, "outputs[].url");
    });
  }

  const outputs = data.outputs as Record<string, unknown> | undefined;
  if (outputs && typeof outputs === "object") {
    for (const nodeOutput of Object.values(outputs)) {
      if (!nodeOutput || typeof nodeOutput !== "object") continue;
      const node = nodeOutput as Record<string, unknown>;

      const images = node.images;
      if (Array.isArray(images)) {
        images.forEach((entry) => {
          const image = entry as Record<string, unknown> | undefined;
          appendUrl(image?.url, "outputs.*.images[].url");
        });
      }
    }
  }

  // Deep scan fallback for provider payload variants.
  const walk = (value: unknown, path: string) => {
    if (!value) return;

    if (typeof value === "string") {
      appendUrl(value, path);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry, index) => walk(entry, `${path}[${index}]`));
      return;
    }

    if (typeof value === "object") {
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        walk(nested, path ? `${path}.${key}` : key);
      }
    }
  };

  walk(payload, "");

  return candidates
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.url);
}

type RunComfySubmitResponse = {
  request_id?: string;
  id?: string;
  status_url?: string;
  error_code?: number;
  error_message?: string;
  detail?: unknown;
};

function mapGenderToPromptSubject(value?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person") {
  if (!value) return "person";

  const normalized = value.toLowerCase();

  if (normalized === "male" || normalized === "man") return "male";
  if (normalized === "female" || normalized === "woman") return "female";
  if (normalized === "kids") return "kid";

  return "person";
}

function resolvePrompt(params: any): string {
  const mergedPrompt = (params.prompt || "").trim();
  const styleHint = params.style || "Natural";
  const backgroundHint = params.background || "studio";
  const categoryHint = (params.category || "").trim();
  const garmentType = params.garmentType || "Fabric";
  const genderHint = mapGenderToPromptSubject(params.gender);
  const isKidsMode = (params.gender || "").toLowerCase() === "kids";
  const viewHint = params.outputFormat === "single" ? "Single: Generate one high-quality image" : params.outputFormat === "triple" ? "3 Views: Generate Front, Side, Back views" : "6 Views: Generate Front, Back, Left, Right, Close-up, Detail views";

  if (params.hub) {
    const promptInputs: PromptInputs = {
      hub: params.hub,
      mode: params.mode,
      productImageUrl: params.garmentImageUrl,
      modelRefUrl: params.modelImageUrl || undefined,
      aiNotes: mergedPrompt || undefined,
      outputStyle: params.outputStyleV2 || styleHint,
      background: backgroundHint,
      outputViews: params.outputViews,
      videoStyle: params.videoStyle,
      ...(params.hub === "Apparel" ? {
        segment: params.segment || (params.gender === "Male" || params.gender === "Man" ? "Gents" : params.gender === "Kids" ? "Kids" : "Ladies"),
        wearType: params.wearType,
        productType: params.productType || categoryHint,
      } : {}),
      ...(params.hub === "Jewellery" ? {
        jewelleryGenre: params.jewelleryGenre,
        jewelleryStyle: params.jewelleryStyle,
      } : {}),
      ...(params.hub === "Accessories" ? {
        accessoryType: params.accessoryType,
      } : {}),
      ...(params.hub === "Products" ? {
        productFamily: params.productFamily,
      } : {}),
    } as PromptInputs;

    return buildMasterPrompt(promptInputs);
  }

  return buildLegacyPrompt({
    mode: params.mode || "Virtual Try-On",
    isKidsMode,
    garmentType,
    genderHint,
    categoryHint,
    styleHint,
    viewHint,
    backgroundHint,
    mergedPrompt,
  });
}

function buildModelPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio" | "VIDEO_GENERATION";
  gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
  garmentType?: "Fabric" | "Ready-made";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  userPoint?: { x: number; y: number } | null;
  clothingPoint?: { x: number; y: number } | null;
  // Master Prompt v2.0 hub context
  hub?: Hub;
  segment?: string;
  wearType?: string;
  productType?: string;
  jewelleryGenre?: string;
  jewelleryStyle?: string;
  accessoryType?: string;
  productFamily?: string;
  outputStyleV2?: string;
  outputViews?: string[];
  videoStyle?: string;
}) {
  const requestedViewLayout = params.outputFormat || "multi-view";
  const outputImageFormat = "png";
  const isVirtualTryOn = params.mode === "Virtual Try-On";
  const isAIStudio = params.mode === "AI Studio";
  const requestedCount = Math.max(1, Math.min(8, params.outputCount || (params.outputFormat === "single" ? 1 : params.outputFormat === "triple" ? 3 : 6)));

  const resolvedPrompt = resolvePrompt(params);

  // Many image-edit model endpoints expect a single primary image to edit.
  // For AI Studio, the primary image should be the selected model (person), with the product image provided as a reference.
  const primaryImageUrl = isAIStudio ? params.modelImageUrl : params.garmentImageUrl;
  const referenceImageUrl = isAIStudio ? params.garmentImageUrl : params.modelImageUrl;

  return {
    prompt: resolvedPrompt,
    task: isVirtualTryOn ? "virtual_try_on" : "fashion_generation",
    mode: isVirtualTryOn ? "virtual_try_on" : "studio_generation",
    // RunComfy flux-2 endpoint validates output_format as image type enum: jpeg|png|webp.
    output_format: outputImageFormat,
    image_format: outputImageFormat,
    result_format: outputImageFormat,
    // Preserve requested multi-view layout semantics for downstream workflows.
    view_layout: requestedViewLayout,
    requested_view_layout: requestedViewLayout,
    num_outputs: requestedCount,
    output_count: requestedCount,
    image_url: primaryImageUrl,
    input_image_url: primaryImageUrl,
    init_image_url: primaryImageUrl,
    base_image_url: primaryImageUrl,
    source_image_url: primaryImageUrl,
    reference_image_url: referenceImageUrl,
    edit_image_url: referenceImageUrl,
    model_image_url: params.modelImageUrl,
    garment_image_url: params.garmentImageUrl,
    person_image_url: params.modelImageUrl,
    human_image_url: params.modelImageUrl,
    cloth_image_url: params.garmentImageUrl,
    product_image_url: params.garmentImageUrl,
    person: params.modelImageUrl,
    garment: params.garmentImageUrl,
    input_person_image: params.modelImageUrl,
    input_garment_image: params.garmentImageUrl,
    user_point: params.userPoint || undefined,
    cloth_point: params.clothingPoint || undefined,
    model_point: params.userPoint || undefined,
    garment_point: params.clothingPoint || undefined,
  };
}

function buildVideoPayload(params: {
  initImageUrl: string;
  videoStyle?: string;
  prompt?: string;
  hub?: string;
}) {
  const style = (params.videoStyle || "").toLowerCase();
  
  // Aspect Ratio Logic from v5.0
  let width = 720;
  let height = 1280;

  if (style.includes("turn") || style.includes("turntable") || params.hub === "Products") {
    width = 1024;
    height = 1024;
  } else if (style.includes("reel") || style.includes("walk")) {
    width = 720;
    height = 1280;
  }

  const payload = {
    image_url: params.initImageUrl,
    input_image_url: params.initImageUrl,
    prompt: params.prompt,
    text: params.prompt, // Required by Wan 2.1 / Seedance models
    video_style: params.videoStyle,
    hub: params.hub,
    motion_bucket_id: 127,
    fps: 24,
    num_frames: 81,
    width,
    height,
    steps: 30,
    cfg: 6,
    sampling_method: "euler",
    scheduler: "normal",
    denoise: 1.0,
  };

  return payload;
}

function buildDeploymentPayload(params: {
  garmentImageUrl: string;
  modelImageUrl: string;
  prompt?: string;
  style?: string;
  background?: string;
  mode?: "Virtual Try-On" | "AI Studio" | "VIDEO_GENERATION";
  gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
  garmentType?: "Fabric" | "Ready-made";
  category?: string;
  outputFormat?: "single" | "triple" | "multi-view";
  outputCount?: number;
  userPoint?: { x: number; y: number } | null;
  clothingPoint?: { x: number; y: number } | null;
  // Hub fields
  hub?: Hub;
  segment?: string;
  wearType?: string;
  productType?: string;
  jewelleryGenre?: string;
  jewelleryStyle?: string;
  accessoryType?: string;
  productFamily?: string;
  outputStyleV2?: string;
  outputViews?: string[];
  videoStyle?: string;
}) {
  const input = buildModelPayload(params);
  const isVirtualTryOn = params.mode === "Virtual Try-On";

  const vtonWorkflow = {
    workflow_type: "virtual_try_on",
    workflow_name: "ipadapter_openpose_cloth_ksampler_output",
    pipeline: {
      steps: [
        "ipadapter",
        "openpose",
        "cloth_input",
        "ksampler",
        "output",
      ],
    },
    nodes: {
      ipadapter: {
        enabled: true,
        image_url: params.modelImageUrl,
        mode: "identity_lock",
        lock_identity: true,
        output: "identity_conditioning",
      },
      openpose: {
        enabled: true,
        image_url: params.modelImageUrl,
        lock_pose: true,
        output: "pose",
      },
      cloth_input: {
        enabled: true,
        image_url: params.garmentImageUrl,
        output: "cloth",
      },
      ksampler: {
        enabled: true,
        sampler_name: "euler",
        scheduler: "normal",
        steps: 28,
        cfg: 6,
        denoise: 0.2,
        prompt: input.prompt,
        conditioning: {
          identity_source: "ipadapter",
          pose_source: "openpose",
          cloth_source: "cloth_input",
        },
        user_point: params.userPoint || undefined,
        cloth_point: params.clothingPoint || undefined,
        output: "latent",
      },
      output: {
        enabled: true,
        decode: "vae",
        source: "ksampler",
      },
    },
    ipadapter_image_url: params.modelImageUrl,
    openpose_image_url: params.modelImageUrl,
    cloth_input_image_url: params.garmentImageUrl,
    ksampler_denoise: 0.2,
    output_source: "output",
  };

  return {
    input: {
      ...input,
      ...vtonWorkflow,
      workflow_type: isVirtualTryOn ? "virtual_try_on" : "ai_studio_try_on",
    },
  };
}

function normalizeSubmitResponse(data: RunComfySubmitResponse, requestPathPrefix: string) {
  if (typeof data.error_code === "number" || data.error_message) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : data.detail
          ? JSON.stringify(data.detail)
          : "";
    throw new Error(
      `RunComfy request rejected${data.error_code ? ` (${data.error_code})` : ""}: ${data.error_message || "Unknown error"}${detail ? ` | detail: ${detail}` : ""}`
    );
  }

  if (data.status_url && isUrl(data.status_url)) {
    return data.status_url;
  }

  if (data.request_id) {
    return `${requestPathPrefix}/${data.request_id}/status`;
  }

  if (data.id) {
    return `${requestPathPrefix}/${data.id}/status`;
  }

  throw new Error("RunComfy did not return request_id/status_url");
}

export const runComfyService = {
  /**
   * Phase 1: Submit the workflow to RunComfy.
   */
  async triggerWorkflow(params: {
    garmentImageUrl: string;
    modelImageUrl: string;
    prompt?: string;
    style?: string;
    background?: string;
    mode?: "Virtual Try-On" | "AI Studio" | "VIDEO_GENERATION";
    gender?: "Male" | "Female" | "Kids" | "Man" | "Woman" | "Person";
    garmentType?: "Fabric" | "Ready-made";
    category?: string;
    outputFormat?: "single" | "triple" | "multi-view";
    outputCount?: number;
    userPoint?: { x: number, y: number } | null;
    clothingPoint?: { x: number, y: number } | null;
    // Master Prompt v2.0 hub context
    hub?: Hub;
    segment?: string;
    wearType?: string;
    productType?: string;
    jewelleryGenre?: string;
    jewelleryStyle?: string;
    accessoryType?: string;
    productFamily?: string;
    outputStyleV2?: string;
    outputViews?: string[];
    videoStyle?: string;
  }) {
    const config = getRunComfyConfig();

    if (!config.apiKey) {
      throw new Error("RUNCOMFY_API_KEY is missing");
    }

    const isVideo = params.mode === "VIDEO_GENERATION";
    const activeModelId = isVideo ? config.videoModelId : config.modelId;
    const activeDeploymentId = isVideo ? config.videoDeploymentId : config.deploymentId;
    const isDeployment = Boolean(activeDeploymentId);

    // AI Studio / Virtual Try-On require image conditioning (product + model images).
    // The Flux "text-to-image" model endpoint ignores image inputs and will generate unrelated outfits.
    if (!isDeployment && !isVideo && isTextToImageModel(activeModelId)) {
      const mode = params.mode || "AI Studio";
      throw new Error(
        `RunComfy is configured with a text-to-image model (${activeModelId}). ` +
          `${mode} requires an image-conditioned ComfyUI deployment to apply the uploaded product onto the selected model. ` +
          `Set RUNCOMFY_DEPLOYMENT_ID to your deployed try-on workflow (recommended), or switch RUNCOMFY_MODEL_ID to a workflow/model that supports image inputs.`
      );
    }

    try {
      const url = isDeployment
        ? `${config.baseUrl}/deployments/${activeDeploymentId}/inference`
        : `${config.baseUrl}/models/${activeModelId}`;

      let requestPayload: any;

      if (isVideo) {
        const videoPrompt = buildVideoPrompt({
          productImageUrl: params.garmentImageUrl || "",
          videoStyle: (params.videoStyle ?? "Straight Walk") as VideoStyle,
          hub: (params.hub ?? "Apparel") as Hub,
          background: params.background as Background,
          aiNotes: params.prompt || null,
        } as PromptInputs);
        const videoPayload = buildVideoPayload({
          initImageUrl: params.garmentImageUrl,
          videoStyle: params.videoStyle,
          prompt: videoPrompt,
          hub: params.hub,
        });
        requestPayload = isDeployment ? { input: videoPayload } : videoPayload;
      } else if (isDeployment) {
        requestPayload = buildDeploymentPayload(params);
      } else if (isSeedreamSequentialModel(activeModelId)) {
        requestPayload = buildSeedreamSequentialPayload(params);
      } else if (isImageEditModel(activeModelId)) {
        requestPayload = buildNanoBananaEditPayload(params);
      } else {
        requestPayload = buildModelPayload(params);
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorText = await parseErrorResponse(response);
        throw new Error(`RunComfy submission failed: ${errorText}`);
      }

      const data = (await response.json()) as RunComfySubmitResponse;
      return normalizeSubmitResponse(data, `${config.baseUrl}/requests`);
    } catch (error: unknown) {
      console.error("❌ [runComfyService] triggerWorkflow Error:", error);
      throw error;
    }
  },

  /**
   * Phase 2: Check the status of a request.
   */
  async checkStatus(requestId: string) {
    const config = getRunComfyConfig();

    if (!config.apiKey) {
      return { status: "failed", error: "Missing RunComfy API Key" };
    }

    try {
      const statusUrl = isUrl(requestId)
        ? requestId
        : `${config.baseUrl}/${requestId.includes("/") ? requestId : `requests/${requestId}/status`}`;

      const statusResponse = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${config.apiKey}`,
        },
      });

      if (!statusResponse.ok) {
        // Model API occasionally returns HTML Cloudflare error pages (e.g. 504) during long generations.
        // Treat transient HTTP errors as still processing so the UI keeps polling.
        if (isTransientStatus(statusResponse.status) || statusResponse.status === 404) {
          return {
            status: "processing" as const,
            outputImage: null,
            error: null,
          };
        }

        const errorText = await parseErrorResponse(statusResponse);
        return {
          status: "failed" as const,
          outputImage: null,
          error: `Failed to check RunComfy status: ${errorText}`,
        };
      }

      const statusData = (await statusResponse.json()) as {
        status?: string;
        error?: string;
        message?: string;
        result_url?: string;
      };

      const normalizedStatus = mapRunComfyStatus(statusData.status);

      if (normalizedStatus === "completed") {
        const resultUrl = statusData.result_url || statusUrl.replace(/\/status$/, "/result");

        const resultResponse = await fetch(resultUrl, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${config.apiKey}`,
          },
        });

        if (!resultResponse.ok) {
          if (isTransientStatus(resultResponse.status) || resultResponse.status === 404) {
            return {
              status: "processing" as const,
              outputImage: null,
              error: null,
            };
          }

          const resultErrorText = await parseErrorResponse(resultResponse);
          return {
            status: "failed" as const,
            outputImage: null,
            error: `Failed to fetch RunComfy result: ${resultErrorText}`,
          };
        }

        const resultData = await resultResponse.json();

        // If the result actually indicates a failure despite the status endpoint saying completed
        if (mapRunComfyStatus(resultData.status) === "failed") {
          return {
            status: "failed" as const,
            outputImage: null,
            error: resultData.error || resultData.message || "Generation failed in result",
          };
        }

        const outputImages = extractOutputImages(resultData);
        const outputImage = outputImages[0] ?? null;

        return {
          status: "completed" as const,
          outputImage,
          outputImages,
          error: outputImage ? null : "Generation completed but no output image URL was found",
        };
      }

      return {
        status: normalizedStatus,
        outputImage: null,
        error: statusData.error || statusData.message || null,
      };
    } catch (error: unknown) {
      // Network errors / timeouts should not hard-fail polling.
      const message = error instanceof Error ? error.message : String(error);
      console.error("❌ [runComfyService] checkStatus Error:", error);

      if (/timeout|timed out|gateway time-?out|cloudflare|fetch failed|ECONNRESET|ENOTFOUND/i.test(message)) {
        return {
          status: "processing" as const,
          outputImage: null,
          error: null,
        };
      }

      return {
        status: "failed" as const,
        outputImage: null,
        error: message,
      };
    }
  }
};