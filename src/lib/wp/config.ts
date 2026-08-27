const DEFAULT_WP_URL = "https://myicconline.com";

export function getWpBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_WP_URL || DEFAULT_WP_URL).replace(/\/$/, "");
}

export function getWpLoginUrl(): string {
  return process.env.NEXT_PUBLIC_WP_LOGIN_URL || `${getWpBaseUrl()}/`;
}
