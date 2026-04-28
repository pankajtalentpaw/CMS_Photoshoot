# Digital Atelier — Video Generation Implementation Plan v1.0
## Strategy for Image-to-Video (I2V) Master AI Engine

This document outlines the professional implementation plan for converting approved AI-generated images into high-fidelity fashion videos, fulfilling the "Create Video" requirement within the Digital Atelier ecosystem.

---

### 1. The Staff Engineer's Choice: Wan 2.1 vs. Kling AI
To achieve the "Best Option" for fashion catalog video, we will utilize **Wan 2.1 (Image-to-Video)** as our primary engine via RunComfy.

**Why Wan 2.1?**
- **Identity Lock:** Superior temporal stability. Unlike older models (SVD), it doesn't "hallucinate" new faces mid-video.
- **Fabric Physics:** Correctly handles complex draping (Saree/Lehenga) movement without clipping.
- **Native 480p/720p/1080p Support:** Scales naturally to 4K via the RunComfy upscaling pipeline.
- **First Frame Accuracy:** Ensures the approved product image remains 100% identical at $t=0$.

---

### 2. Implementation Workflow (The "Staff" Way)

#### Phase A: Payload Construction (The Context Bridge)
The backend must map the approved image ID and selected Video Style to a dedicated video workflow.

| UI Selection | AI Motion Directive (Prompt Injection) |
| :--- | :--- |
| **Straight Walk** | `Model performing a confident runway walk directly toward camera. Fluid garment movement. Natural gait.` |
| **Slow Turn** | `Model performing a slow, graceful 360-degree rotation. Every angle of the garment revealed. Soft fabric sway.` |
| **Fabric Flow** | `Close-up focus on fabric dynamics. Gentle wind blowing. Saree pallu/Lehenga flare in slow-motion fluid motion.` |
| **Elegant Reveal** | `Cinematic entrance from off-frame. Subtle pose at center. Slow dolly-in camera movement.` |

#### Phase B: Temporal Identity Preservation
We apply the **Identity Lock v5.0** logic to the Video generation prompt.
- **Strict Frame Continuity:** Every frame must match the `MODEL_REF` face geometry.
- **Extraction Lock:** The garment color/texture from the approved image is used as the "latent ground truth" for all subsequent frames.

---

### 3. Backend Integration Plan

#### 1. API Route Extension
Enhance the existing `/api/generate` or create `/api/generate/video`:
- **Inputs:** `imageId` (Approved), `videoStyle`, `aiNotes`.
- **Validation:** Verify `imageId` state is `APPROVED`. Check user credits (Video costs more).

#### 2. RunComfy Workflow Routing
Modify `runComfyService.ts` to support Video-specific endpoints:
```typescript
// Proposed logic extension in runComfyService.ts
if (params.mode === "VIDEO_GENERATION") {
  const videoPrompt = buildVideoPrompt(params); // Uses v5.0 Video logic
  return triggerVideoWorkflow({
    init_image: params.approvedImageUrl,
    prompt: videoPrompt,
    motion_bucket: 127, // High motion for walk, low for turn
    fps: 24,
    duration: 5 // seconds
  });
}
```

#### 3. Output Handling
- **Format:** MP4 (H.264/H.265).
- **Resolution:** Initial generation at 720p → AI Temporal Upscale to 4K.
- **Storage:** Store in MongoDB/S3 with `type: "video"` for retrieval in Screen 10.

---

### 4. Quality Gates for Video
Every video must pass the following gates before reaching the user:
1. **Zero Flicker:** No texture crawling or lighting pops.
2. **Identity Stability:** The face must not morph into a different person during rotation.
3. **Product Fidelity:** Buttons, embroidery, and borders must not vanish or blur in motion.
4. **Physically Accurate Draping:** No clipping between limbs and fabric.

---

### 5. Future-Proofing: Multi-View Stitching
For the "Best Option," we can implement **Multi-View to Video (MV2V)**:
- Instead of using 1 image, we feed the **Front, Left, and Right** approved views into a **3D-aware Video Model**.
- This creates a perfectly accurate "Slow Turn" where the back of the garment is consistent with the front views.

---

### 6. Timeline & Deliverables
1. **Workflow Testing (24h):** Configure Wan 2.1 deployment in RunComfy.
2. **Service Wiring (24h):** Update `runComfyService.ts` and `generate.controller.ts`.
3. **Pipeline Stress Test (12h):** Verify credit deduction and refund logic for long-running video jobs.
4. **Final Handover:** Screen 10 rendering functional with Play/Download.

> [!IMPORTANT]
> **Constraint Reminder:** No Frontend UI/UX changes. The existing "Create Video" button and Screen 9/10 flows are ready; we are simply plugging the high-fidelity v5.0 Video Engine into the backend.
