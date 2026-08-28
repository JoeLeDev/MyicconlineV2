"use client";

import { useEffect, useRef, useState } from "react";
import type { IccPageEmbed } from "@/lib/wp/types";

type Props = {
  embed: IccPageEmbed;
  /** Formulaire plein écran sans scroll interne dans l’iframe */
  autoResize?: boolean;
};

function parseHeightValue(raw?: string): number | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  const pxMatch = value.match(/^([\d.]+)px$/);
  if (pxMatch) return Math.round(Number(pxMatch[1]));

  const vhMatch = value.match(/^([\d.]+)vh$/);
  if (vhMatch && typeof window !== "undefined") {
    return Math.round((Number(vhMatch[1]) / 100) * window.innerHeight);
  }

  const num = Number(value);
  return Number.isFinite(num) && num > 0 ? Math.round(num) : null;
}

function extractHeightFromMessage(data: unknown): number | null {
  if (typeof data === "number" && data > 0) return Math.round(data);

  if (typeof data === "string") {
    try {
      return extractHeightFromMessage(JSON.parse(data));
    } catch {
      const parsed = parseHeightValue(data);
      return parsed;
    }
  }

  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;
  const candidates = [
    record.height,
    record.frameHeight,
    record.iframeHeight,
    record["iframe-height"],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && candidate > 0) {
      return Math.round(candidate);
    }
    if (typeof candidate === "string") {
      const parsed = parseHeightValue(candidate);
      if (parsed) return parsed;
    }
  }

  return null;
}

export function WpFormEmbed({ embed, autoResize = false }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const title = embed.title?.trim() || "Formulaire ICC Online";
  const configuredHeight = parseHeightValue(embed.height);
  const [height, setHeight] = useState(configuredHeight ?? 900);

  useEffect(() => {
    if (!autoResize) return;

    function applyHeight(next: number) {
      if (next > 0) {
        setHeight(Math.max(next + 24, 480));
      }
    }

    function onMessage(event: MessageEvent) {
      const fromIframe = iframeRef.current?.contentWindow;
      if (fromIframe && event.source !== fromIframe) return;

      const next = extractHeightFromMessage(event.data);
      if (next) applyHeight(next);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [autoResize]);

  useEffect(() => {
    if (!autoResize || configuredHeight) return;

    function onResize() {
      const parsed = parseHeightValue(embed.height);
      if (parsed) setHeight(Math.max(parsed + 24, 480));
    }

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [autoResize, configuredHeight, embed.height]);

  const iframeHeight = autoResize
    ? height
    : configuredHeight ?? 900;

  return (
    <div className={autoResize ? "w-full" : "overflow-hidden rounded-xl border border-black/8 bg-white"}>
      <iframe
        ref={iframeRef}
        src={embed.src}
        title={title}
        className="w-full border-0"
        style={{ height: `${iframeHeight}px`, display: "block" }}
        scrolling={autoResize ? "no" : undefined}
        loading="lazy"
        allow="fullscreen"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
