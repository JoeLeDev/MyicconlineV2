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

/** Champ REST enrichi exposé par WordPress (préféré aux fallbacks). */
export type IccEditorialFile = {
  id?: number;
  url: string;
  title?: string;
  extension?: string;
  filesize?: number | string;
  mime_type?: string;
};

export type IccEditorial = {
  youtube_url?: string | null;
  youtube_id?: string | null;
  files?: IccEditorialFile[];
  /** Ex. "1 min de lecture" */
  reading_time?: string | number | null;
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
  icc_editorial?: IccEditorial | null;
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
  extension?: string;
  filesize?: number;
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
  /** Libellé d’affichage (ex. "1 min de lecture") */
  readingTimeLabel: string;
  readingTimeMinutes: number;
};

export type IccPageEmbed = {
  type: string;
  src: string;
  title?: string;
  height?: string;
};

export type IccPageDownload = {
  url: string;
  title: string;
  extension?: string;
  filesize?: number | string;
};

export type IccPageMagazine = {
  edition?: string;
  title?: string;
  intro?: string;
  cover_url?: string;
  pdf_url?: string;
  pages?: string[];
};

export type IccPage = {
  slug: string;
  modified?: string;
  featured_image?: string;
  intro_html?: string;
  embeds?: IccPageEmbed[];
  downloads?: IccPageDownload[];
  magazine?: IccPageMagazine | null;
  wp_link?: string;
};

export type WpPage = {
  id: number;
  slug: string;
  modified: string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  featured_media: number;
  icc_page?: IccPage | null;
  _embedded?: {
    "wp:featuredmedia"?: WpMedia[];
  };
};

export type CmsPage = {
  id: number;
  slug: string;
  title: string;
  modified: string;
  link: string;
  introHtml: string;
  contentHtml: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  embeds: IccPageEmbed[];
  downloads: IccPageDownload[];
  magazine?: IccPageMagazine | null;
};
