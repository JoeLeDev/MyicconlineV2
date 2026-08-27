import { stripHtml } from "./html";

export function estimateReadingTimeMinutes(html: string): number {
  const text = stripHtml(html);
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
