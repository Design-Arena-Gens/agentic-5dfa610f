"use client";

import type { ScriptSegment } from "@/lib/socialTemplates";

interface VideoComposerOptions {
  imageSrc: string;
  segments: ScriptSegment[];
  orientation: "portrait" | "landscape";
  fps?: number;
}

function timeToSegment(segments: ScriptSegment[], elapsed: number) {
  let accumulator = 0;
  for (const segment of segments) {
    accumulator += segment.duration;
    if (elapsed < accumulator) {
      return { segment, index: segments.indexOf(segment), timeIntoSegment: elapsed - (accumulator - segment.duration) };
    }
  }
  return {
    segment: segments[segments.length - 1],
    index: segments.length - 1,
    timeIntoSegment:
      elapsed -
      segments
        .slice(0, segments.length - 1)
        .reduce((sum, current) => sum + current.duration, 0),
  };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Não foi possível carregar a imagem enviada."));
    image.src = src;
  });
}

export async function composeVideo({
  imageSrc,
  segments,
  orientation,
  fps = 30,
}: VideoComposerOptions): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  if (
    typeof MediaRecorder === "undefined" ||
    !MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
  ) {
    console.warn(
      "MediaRecorder com codec VP9 não suportado, fornecendo apenas o roteiro.",
    );
    return null;
  }

  const width = orientation === "portrait" ? 720 : 1280;
  const height = orientation === "portrait" ? 1280 : 720;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context não disponível.");
  }

  const image = await loadImage(imageSrc);
  const totalDuration = segments.reduce(
    (sum, segment) => sum + segment.duration,
    0,
  );
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType: "video/webm;codecs=vp9",
    videoBitsPerSecond: 4_000_000,
  });

  const chunks: Blob[] = [];
  let animationFrame: number;
  let stopped = false;

  recorder.ondataavailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  const gradient = context.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#020817");
  gradient.addColorStop(1, "#1f2937");

  const imageHeight = Math.floor(height * 0.55);
  const imageWidth = Math.floor((image.width / image.height) * imageHeight);
  const imageX = (width - imageWidth) / 2;
  const imageY = height * 0.09;

  const render = (startTime: number) => {
    const now = performance.now();
    const elapsed = (now - startTime) / 1000;

    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    // Overlay glow
    context.fillStyle = "rgba(15, 118, 110, 0.35)";
    context.fillRect(imageX - 16, imageY - 16, imageWidth + 32, imageHeight + 32);

    context.drawImage(image, imageX, imageY, imageWidth, imageHeight);

    const { segment, index } = timeToSegment(segments, Math.min(elapsed, totalDuration - 0.01));

    context.fillStyle = "white";
    context.textAlign = "center";

    context.font = "bold 42px Inter, sans-serif";
    context.fillText(segment.title.toUpperCase(), width / 2, imageY + imageHeight + 64);

    context.font = "24px Inter, sans-serif";
    const maxWidth = width * 0.82;
    const lines = wrapText(context, segment.text, maxWidth);
    lines.forEach((line, lineIndex) => {
      context.fillText(
        line,
        width / 2,
        imageY + imageHeight + 120 + lineIndex * 34,
      );
    });

    // progress bar
    context.fillStyle = "rgba(255, 255, 255, 0.25)";
    context.fillRect(width * 0.09, height - 140, width * 0.82, 8);
    context.fillStyle = "#22d3ee";
    context.fillRect(
      width * 0.09,
      height - 140,
      (width * 0.82 * (index + 1)) / segments.length,
      8,
    );

    // time indicator
    context.font = "18px Inter, sans-serif";
    context.textAlign = "left";
    context.fillStyle = "rgba(255,255,255,0.7)";
    context.fillText(
      `00:${Math.max(0, Math.floor(totalDuration - elapsed))
        .toString()
        .padStart(2, "0")}`,
      width * 0.09,
      height - 104,
    );

    if (elapsed >= totalDuration) {
      if (!stopped && recorder.state === "recording") {
        stopped = true;
        recorder.stop();
      }
      return;
    }

    animationFrame = requestAnimationFrame(() => render(startTime));
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(testLine);
          currentLine = "";
        }
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.slice(0, 4);
  };

  return new Promise<string | null>((resolve) => {
    recorder.onstop = () => {
      cancelAnimationFrame(animationFrame);
      const blob = new Blob(chunks, { type: "video/webm" });
      resolve(URL.createObjectURL(blob));
    };
    recorder.start();
    const start = performance.now();
    animationFrame = requestAnimationFrame(() => render(start));
    setTimeout(() => {
      if (!stopped && recorder.state === "recording") {
        recorder.stop();
        stopped = true;
      }
    }, (totalDuration + 1) * 1000);
  });
}
