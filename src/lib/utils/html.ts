export function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rdquo;/g, "”")
    .replace(/&ldquo;/g, "“")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—");
}

export function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

/** Retire les <img> pointant vers des PDF (souvent cassés dans le contenu WP). */
export function stripBrokenPdfImages(html: string): string {
  return html.replace(
    /<img\b[^>]*src=["'][^"']*\.pdf[^"']*["'][^>]*>/gi,
    "",
  );
}

/** Extrait une URL YouTube depuis du HTML (iframe, lien, shortcode). */
export function extractYoutubeUrlFromHtml(html: string): string | undefined {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
    /src=["']([^"']*youtube\.com\/embed\/[\w-]{11}[^"']*)["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    if (match[0].includes("embed") || match[0].startsWith("http")) {
      const idMatch = match[0].match(/([\w-]{11})(?:[^\w-]|$)/);
      if (idMatch) return `https://www.youtube.com/watch?v=${idMatch[1]}`;
    }
    if (match[1] && match[1].length === 11) {
      return `https://www.youtube.com/watch?v=${match[1]}`;
    }
  }
  return undefined;
}

export function toYoutubeEmbedUrl(url: string): string | undefined {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/i,
  );
  if (!match) return undefined;
  return `https://www.youtube.com/embed/${match[1]}`;
}

/** Retire les iframes YouTube du HTML si on affiche déjà un embed dédié. */
export function stripYoutubeEmbeds(html: string): string {
  return html
    .replace(/<iframe\b[^>]*youtube\.com\/embed\/[^>]*>\s*<\/iframe>/gi, "")
    .replace(/<figure\b[^>]*wp-block-embed-youtube[^>]*>[\s\S]*?<\/figure>/gi, "");
}
