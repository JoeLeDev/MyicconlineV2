export const WP_TOKEN_COOKIE = "icc_wp_token";
export const SESSION_COOKIE = "icc_session";

/** Durée de session côté Next (alignée cookie) */
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 12; // 12 heures

/** Compat : ancien nom */
export const AUTH_COOKIE = WP_TOKEN_COOKIE;

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

export type SessionPayload = {
  /** user id WP */
  sub: number;
  /** unix seconds */
  exp: number;
  /** slug */
  slug: string;
};
