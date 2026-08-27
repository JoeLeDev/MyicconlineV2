export type WpRendered = {
  rendered: string;
  protected?: boolean;
};

export type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
};

export type WpMedia = {
  id: number;
  source_url: string;
  alt_text?: string;
  mime_type?: string;
  media_type?: string;
  title?: WpRendered;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      {
        source_url: string;
        width: number;
        height: number;
      }
    >;
  };
};

export type WpAuthor = {
  id: number;
  name: string;
  slug?: string;
  avatar_urls?: Record<string, string>;
};

export type WpPostMeta = {
  _myicc_youtube_url?: string;
  usp_youtube_url?: string;
  _myicc_attached_files?: string | number[] | string[];
  [key: string]: unknown;
};

export type WpPost = {
  id: number;
  date: string;
  modified: string;
  slug: string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  meta?: WpPostMeta;
  _embedded?: {
    author?: Array<WpAuthor | { code: string; message: string }>;
    "wp:featuredmedia"?: WpMedia[];
    "wp:term"?: WpTerm[][];
  };
};

export type BlogAttachment = {
  id: number;
  title: string;
  url: string;
  mimeType: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  contentHtml: string;
  date: string;
  modified: string;
  link: string;
  authorName: string;
  category?: { id: number; name: string; slug: string };
  featuredImage?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  youtubeUrl?: string;
  attachments: BlogAttachment[];
  readingTimeMinutes: number;
};
