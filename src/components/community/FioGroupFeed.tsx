"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ActivityCardClient } from "@/components/community/ActivityCardClient";
import type { WpActivityItem } from "@/lib/wp/community-types";

type Props = {
  fioId: number;
  locale: string;
  initialActivities: WpActivityItem[];
  initialHasMore: boolean;
  initialPage: number;
};

export function FioGroupFeed({
  fioId,
  locale,
  initialActivities,
  initialHasMore,
  initialPage,
}: Props) {
  const t = useTranslations("community");
  const [activities, setActivities] = useState(initialActivities);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActivities(initialActivities);
    setPage(initialPage);
    setHasMore(initialHasMore);
  }, [initialActivities, initialHasMore, initialPage, fioId]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);

    try {
      const nextPage = page + 1;
      const res = await fetch(
        `/api/community/fio/${fioId}/activity?page=${nextPage}&per_page=15`,
        { cache: "no-store" },
      );
      const json = (await res.json()) as {
        ok?: boolean;
        data?: {
          activities: WpActivityItem[];
          has_more: boolean;
          page: number;
        };
      };

      if (!res.ok || !json.ok || !json.data) {
        setError(t("error"));
        return;
      }

      setActivities((current) => [...current, ...json.data!.activities]);
      setPage(json.data.page);
      setHasMore(Boolean(json.data.has_more));
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }, [fioId, hasMore, loading, page, t]);

  if (activities.length === 0) {
    return (
      <div className="rounded-2xl border border-black/8 bg-icc-cream/40 px-6 py-10 text-center">
        <p className="text-icc-muted">{t("emptyGroupFeed")}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl border border-black/8 bg-white px-4 md:px-6">
        {activities.map((activity) => (
          <ActivityCardClient
            key={activity.id}
            activity={activity}
            locale={locale}
          />
        ))}
      </div>

      {error ? <p className="mt-3 text-sm text-icc-coral">{error}</p> : null}

      {hasMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => void loadMore()}
            disabled={loading}
            className="rounded-lg border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-icc-ink transition hover:border-icc-coral/30 hover:text-icc-coral disabled:opacity-60"
          >
            {loading ? t("groupLoadingMore") : t("groupLoadMore")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
