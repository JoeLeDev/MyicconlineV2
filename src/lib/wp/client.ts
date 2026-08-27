import { getWpBaseUrl } from "./config";

export { getWpBaseUrl, getWpLoginUrl } from "./config";

type FetchOptions = {
  revalidate?: number | false;
  tags?: string[];
};

export async function wpFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { revalidate = 60, tags } = options;
  const url = path.startsWith("http")
    ? path
    : `${getWpBaseUrl()}/wp-json${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    next: {
      revalidate: revalidate === false ? undefined : revalidate,
      tags,
    },
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status} for ${url}`);
  }

  return res.json() as Promise<T>;
}

export async function wpFetchWithTotal<T>(
  path: string,
  options: FetchOptions = {},
): Promise<{ data: T; total: number; totalPages: number }> {
  const { revalidate = 60, tags } = options;
  const url = path.startsWith("http")
    ? path
    : `${getWpBaseUrl()}/wp-json${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    next: {
      revalidate: revalidate === false ? undefined : revalidate,
      tags,
    },
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`WordPress API error ${res.status} for ${url}`);
  }

  const data = (await res.json()) as T;
  const total = Number(res.headers.get("X-WP-Total") || 0);
  const totalPages = Number(res.headers.get("X-WP-TotalPages") || 0);

  return { data, total, totalPages };
}
