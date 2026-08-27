export const AUTH_COOKIE = "icc_wp_token";

export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export type WpJwtTokenResponse = {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
};

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  slug: string;
  avatarUrl?: string;
};

export type WpMeResponse = {
  id: number;
  name: string;
  slug: string;
  email?: string;
  avatar_urls?: Record<string, string>;
};
