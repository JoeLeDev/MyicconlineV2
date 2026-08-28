import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PostContent } from "@/components/blog/PostContent";
import { rewriteCommunityHtml } from "@/lib/utils/community-html";
import { formatDateTime } from "@/lib/utils/dates";
import type { WpActivityItem } from "@/lib/wp/community-types";

type Props = {
  activity: WpActivityItem;
  locale?: string;
};

export async function ActivityCard({ activity, locale = "fr" }: Props) {
  const t = await getTranslations("community");
  const when = formatDateTime(activity.date, locale);
  const actionHtml = rewriteCommunityHtml(activity.action);
  const content = activity.content.rendered.trim();

  return (
    <article className="flex gap-4 border-b border-black/8 py-6 last:border-b-0 md:gap-5">
      {activity.user_avatar.thumb ? (
        <Image
          src={activity.user_avatar.thumb}
          alt=""
          width={48}
          height={48}
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white"
        />
      ) : (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-icc-coral/15 text-sm font-bold text-icc-coral"
          aria-hidden
        >
          {activity.user_name.slice(0, 1).toUpperCase()}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-icc-muted">{when}</p>
        <div className="prose-icc mt-1 text-sm leading-relaxed text-icc-ink [&_a]:font-medium [&_a]:text-icc-coral [&_a]:hover:text-icc-coral-deep">
          <PostContent html={actionHtml} />
        </div>

        {content ? (
          <div className="mt-3 rounded-lg border border-black/6 bg-icc-cream/50 px-4 py-3 text-sm text-icc-ink">
            <PostContent html={content} />
          </div>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-icc-muted">
          {activity.comment_count > 0 ? (
            <span>{t("comments", { count: activity.comment_count })}</span>
          ) : null}
          {activity.favorite_count > 0 ? (
            <span>{t("favorites", { count: activity.favorite_count })}</span>
          ) : null}
          <a
            href={activity.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-icc-coral hover:text-icc-coral-deep"
          >
            {t("viewOnWp")}
          </a>
        </div>
      </div>
    </article>
  );
}
