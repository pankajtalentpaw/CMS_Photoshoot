// src/hooks/useGenerationPolling.ts
"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type GenerationStatus = "idle" | "submitting" | "polling" | "completed" | "failed";

interface UseGenerationPollingOptions {
  pollIntervalMs?: number;
  maxPolls?: number;
}

export interface GenerationResult {
  status: GenerationStatus;
  outputImage: string | null;
  outputImages: string[];
  outputVideo: string | null;
  error: string | null;
  generate: (payload: Record<string, unknown>) => void;
  reset: () => void;
}

export function useGenerationPolling(
  options: UseGenerationPollingOptions = {}
): GenerationResult {
  const { pollIntervalMs = 4000, maxPolls = 75 } = options;

  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [outputImages, setOutputImages] = useState<string[]>([]);
  const [outputVideo, setOutputVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollCount = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const jobIdRef = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    pollCount.current = 0;
    jobIdRef.current = null;
    if (isMounted.current) {
      setStatus("idle");
      setError(null);
      setOutputImage(null);
      setOutputImages([]);
      setOutputVideo(null);
    }
  }, [stopPolling]);

  const pollStatus = useCallback(async () => {
    if (!jobIdRef.current) return;
    pollCount.current += 1;

    if (pollCount.current > maxPolls) {
      stopPolling();
      if (isMounted.current) {
        setStatus("failed");
        setError("Generation timed out. Please try again.");
      }
      return;
    }

    try {
      const url = `/api/status?jobId=${encodeURIComponent(jobIdRef.current)}`;
      const res = await fetch(url);
      if (!res.ok) return; // transient — keep polling

      const data = await res.json();
      const jobStatus: string = data.status || "processing";

      if (jobStatus === "completed") {
        stopPolling();
        if (isMounted.current) {
          const images: string[] = Array.isArray(data.outputImages)
            ? data.outputImages.filter(Boolean)
            : data.outputImage
              ? [data.outputImage]
              : [];

          // Detect video URLs (common extensions + patterns)
          const videoUrl: string | null =
            data.outputVideo ||
            images.find((u: string) => /\.(mp4|webm|mov)(\?|$)/i.test(u)) ||
            null;

          const imageUrls = images.filter(
            (u: string) => !/\.(mp4|webm|mov)(\?|$)/i.test(u)
          );

          setOutputImages(imageUrls);
          setOutputImage(imageUrls[0] || null);
          setOutputVideo(videoUrl);
          setStatus("completed");
        }
      } else if (jobStatus === "failed") {
        stopPolling();
        if (isMounted.current) {
          setStatus("failed");
          setError(data.error || "AI generation failed.");
        }
      }
      // else processing / queued — keep polling
    } catch {
      // Network error — keep polling silently
    }
  }, [maxPolls, stopPolling]);

  const generate = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!isMounted.current) return;
      stopPolling();
      pollCount.current = 0;
      jobIdRef.current = null;

      setStatus("submitting");
      setError(null);
      setOutputImage(null);
      setOutputImages([]);
      setOutputVideo(null);

      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || "Failed to start generation");
        }

        if (!data.jobId) {
          throw new Error("No jobId returned by server");
        }

        jobIdRef.current = data.jobId;

        if (isMounted.current) {
          setStatus("polling");
          // Immediate first poll, then interval
          pollStatus();
          intervalRef.current = setInterval(pollStatus, pollIntervalMs);
        }
      } catch (err: unknown) {
        if (isMounted.current) {
          setStatus("failed");
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      }
    },
    [pollStatus, pollIntervalMs, stopPolling]
  );

  return { status, outputImage, outputImages, outputVideo, error, generate, reset };
}
