import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type EANFormats = "ean-13" | "ean-8";

export type BarcodeScannerProps = {
  // Called when an EAN is detected; receives the raw value.
  onDetected: (ean: string) => void;
  // Pause or resume the camera and scanning.
  paused?: boolean;
  // Continue scanning after first hit; default false (stop after first).
  continuous?: boolean;
  // Prefer the native BarcodeDetector API if available; default true.
  preferNative?: boolean;
  // Video constraints override (e.g., { facingMode: "environment" }).
  videoConstraints?: MediaTrackConstraints;
  // Barcode formats to detect; defaults to ["ean-13", "ean-8"].
  formats?: EANFormats[];
  // Minimum milliseconds between detection attempts (native); default 200ms.
  scanThrottleMs?: number;
  // Optional error callback.
  onError?: (err: unknown) => void;
  // Class name for the wrapper.
  className?: string;
  // Show a minimal overlay while scanning.
  showOverlay?: boolean;
  // Overlay width as percent of video element (visual only). Default 90.
  overlayWidthPct?: number;
  // Overlay aspect ratio (width / height). Default 2.5 (wider).
  overlayAspect?: number;
};

// Very narrow type guard around window.BarcodeDetector for runtime feature detection
function hasNativeBarcodeDetector(): boolean {
  return typeof (globalThis as any).BarcodeDetector !== "undefined";
}

// Safely get supported formats from native API, if available
async function getNativeSupportedFormats(): Promise<string[] | null> {
  try {
    const BD: any = (globalThis as any).BarcodeDetector;
    if (!BD || typeof BD.getSupportedFormats !== "function") return null;
    const fmts: string[] = await BD.getSupportedFormats();
    return fmts;
  } catch {
    return null;
  }
}

export default function BarcodeScanner(props: BarcodeScannerProps) {
  const {
    onDetected,
    paused = false,
    continuous = false,
    preferNative = true,
    videoConstraints,
    formats = ["ean-13", "ean-8"],
    scanThrottleMs = 200,
    onError,
    className,
    showOverlay = true,
    overlayWidthPct = 90,
    overlayAspect = 2.5,
  } = props;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastScanRef = useRef<number>(0);
  const stopZXingRef = useRef<null | (() => void)>(null);
  const [state, setState] = useState<
    | { status: "idle" }
    | { status: "requesting-permission" }
    | { status: "scanning"; engine: "native" | "zxing" }
    | { status: "stopped" }
    | { status: "error"; message: string }
  >({ status: "idle" });

  const desiredFormats = useMemo(() => new Set(formats), [formats]);

  const stopStream = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (stopZXingRef.current) {
      try {
        stopZXingRef.current();
      } catch {
        // ignore
      }
      stopZXingRef.current = null;
    }
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setState({ status: "stopped" });
  }, []);

  // Start camera stream when not paused
  useEffect(() => {
    if (paused) {
      stopStream();
      return;
    }

    let cancelled = false;
    const start = async () => {
      try {
        setState({ status: "requesting-permission" });
        // Guard: mediaDevices not available (often due to insecure context on mobile)
        if (
          typeof navigator === "undefined" ||
          !navigator.mediaDevices ||
          typeof navigator.mediaDevices.getUserMedia !== "function"
        ) {
          const insecure = typeof window !== "undefined" && (window as any).isSecureContext === false;
          const msg = insecure
            ? "Camera access requires a secure context (HTTPS). Please open the site over HTTPS or use localhost."
            : "Camera API not available in this browser. Try the latest Chrome or Firefox.";
          setState({ status: "error", message: msg });
          onError?.(new Error(msg));
          return;
        }
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: "environment",
            ...videoConstraints,
          },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play().catch(() => {
            // Some browsers require user interaction; surface a helpful state
          });
        }
        // Choose engine
        const useNative = preferNative && hasNativeBarcodeDetector();
        if (useNative) {
          runNativeDetector().catch(async (err) => {
            // If native fails for any reason, try ZXing fallback
            await runZXingFallback().catch((zxErr) => {
              // Surface the native error first; log fallback too
              console.warn("ZXing fallback failed:", zxErr);
              setState({ status: "error", message: toMessage(err) });
              onError?.(err);
            });
          });
        } else {
          await runZXingFallback().catch((err) => {
            setState({ status: "error", message: toMessage(err) });
            onError?.(err);
          });
        }
      } catch (err) {
        setState({ status: "error", message: toMessage(err) });
        onError?.(err);
      }
    };

    start();
    return () => {
      cancelled = true;
      stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, preferNative, JSON.stringify(videoConstraints)]);

  // Native BarcodeDetector loop
  const runNativeDetector = useCallback(async () => {
    const BD: any = (globalThis as any).BarcodeDetector;
    const supported = (await getNativeSupportedFormats()) ?? [];
    const wanted = supported.filter((f) => desiredFormats.has(f as EANFormats));
    const detector = new BD({ formats: wanted.length ? wanted : Array.from(desiredFormats) });
    setState({ status: "scanning", engine: "native" });

    const loop = async () => {
      if (paused) return; // effect cleanup will stop
      const now = Date.now();
      if (now - lastScanRef.current < scanThrottleMs) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      lastScanRef.current = now;
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      try {
        // Many implementations accept the video element directly; if that fails we can try ImageBitmap
        const results = await detector.detect(video as any);
        if (Array.isArray(results) && results.length) {
          for (const r of results) {
            const raw = String(r.rawValue ?? r.raw ?? "");
            if (!raw || !isEan(raw) || !isValidEan(raw)) continue;
            const fmtNorm = normalizeFormat(r.format ?? r.type);
            let matches = desiredFormats.size === 0;
            if (!matches) {
              if (fmtNorm) {
                matches = desiredFormats.has(fmtNorm);
              } else {
                const inferred: EANFormats | null = raw.length === 13 ? "ean-13" : raw.length === 8 ? "ean-8" : null;
                matches = inferred ? desiredFormats.has(inferred) : false;
              }
            }
            if (matches) {
              onDetected(raw);
              if (!continuous) {
                stopStream();
                return;
              }
            }
          }
        }
      } catch (err) {
        // Non-fatal; continue trying
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [continuous, desiredFormats, onDetected, paused, scanThrottleMs, stopStream]);

  // ZXing fallback via dynamic import to avoid hard dependency
  const runZXingFallback = useCallback(async () => {
    setState({ status: "scanning", engine: "zxing" });
    // Dynamic import keeps build working even if package isn't installed; we can surface a clear message.
    let BrowserMultiFormatReader: any;
    try {
      const mod = await import(/* @vite-ignore */ "@zxing/browser");
      BrowserMultiFormatReader = mod.BrowserMultiFormatReader ?? mod;
    } catch (err) {
      throw new Error(
        "ZXing fallback not available. Please install @zxing/browser or enable native BarcodeDetector."
      );
    }

    const reader = new BrowserMultiFormatReader();
    const video = videoRef.current;
    if (!video) throw new Error("Video element not ready");
    const controls = await reader.decodeFromVideoDevice(
      undefined,
      video,
      (result: any, _err: any, c: any) => {
        if (result) {
          const text: string = result.getText ? result.getText() : String(result.text ?? "");
          if (text && isEan(text) && isValidEan(text)) {
            let matches = desiredFormats.size === 0;
            if (!matches) {
              const inferred: EANFormats | null = text.length === 13 ? "ean-13" : text.length === 8 ? "ean-8" : null;
              matches = inferred ? desiredFormats.has(inferred) : false;
            }
            if (matches) {
              onDetected(text);
              if (!continuous) {
                try {
                  c?.stop?.();
                } catch {}
                stopStream();
              }
            }
          }
        }
        // ignore decode errors; ZXing is chatty during scanning
      }
    );
    stopZXingRef.current = () => {
      try {
        controls?.stop?.();
      } catch {
        // ignore
      }
    };
  }, [continuous, desiredFormats, onDetected, stopStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  const statusText = useMemo(() => {
    switch (state.status) {
      case "idle":
        return "Idle";
      case "requesting-permission":
        return "Requesting camera permission…";
      case "scanning":
        return `Scanning (${state.engine})…`;
      case "stopped":
        return "Stopped";
      case "error":
        return `Error: ${state.message}`;
      default:
        return "";
    }
  }, [state]);

  return (
    <div className={className} style={{ position: "relative", width: "100%" }}>
      <video
        ref={videoRef}
        // iOS requires these to avoid fullscreen takeover
        playsInline
        muted
        autoPlay
        style={{ width: "100%", borderRadius: 8, background: "#000" }}
      />
      {showOverlay && state.status === "scanning" ? (
        <Overlay widthPct={overlayWidthPct} aspect={overlayAspect} />
      ) : null}
      <div
        aria-live="polite"
        style={{
          position: "absolute",
          left: 12,
          bottom: 12,
          padding: "4px 8px",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          fontSize: 12,
          borderRadius: 4,
        }}
      >
        {statusText}
      </div>
    </div>
  );
}

function Overlay({ widthPct, aspect }: { widthPct: number; aspect: number }) {
  // Simple focus frame overlay
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${Math.max(10, Math.min(100, widthPct))}%`,
          maxWidth: 640,
          aspectRatio: `${aspect} / 1`,
          border: "2px solid rgba(255,255,255,0.9)",
          borderRadius: 8,
          boxShadow: "0 0 0 100vmax rgba(0,0,0,0.35)",
        }}
      />
    </div>
  );
}

function toMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function normalizeFormat(fmt: string | undefined | null): EANFormats | null {
  if (!fmt) return null;
  const f = String(fmt).toLowerCase().replace(/_/g, "-");
  if (f === "ean-13" || f === "ean13") return "ean-13";
  if (f === "ean-8" || f === "ean8") return "ean-8";
  return null;
}

function isEan(text: string): text is string {
  return /^\d{8}$/.test(text) || /^\d{13}$/.test(text);
}

function isValidEan(text: string): boolean {
  if (!isEan(text)) return false;
  if (text.length === 13) {
    // EAN-13: 12 data digits + 1 check digit
    const digits = text.split("").map((d) => Number(d));
    const check = digits[12];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const weight = (i % 2 === 0) ? 1 : 3; // positions 1..12 from left, odd index (0) -> weight 1
      sum += digits[i] * weight;
    }
    const calc = (10 - (sum % 10)) % 10;
    return calc === check;
  }
  if (text.length === 8) {
    // EAN-8: 7 data digits + 1 check digit
    const digits = text.split("").map((d) => Number(d));
    const check = digits[7];
    let sum = 0;
    // weights for positions 1..7: 3,1,3,1,3,1,3
    for (let i = 0; i < 7; i++) {
      const weight = (i % 2 === 0) ? 3 : 1;
      sum += digits[i] * weight;
    }
    const calc = (10 - (sum % 10)) % 10;
    return calc === check;
  }
  return false;
}
