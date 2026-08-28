import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FioGroupShareButton } from "@/components/community/FioGroupShareButton";
import { FioGroupNotificationToggle } from "@/components/community/FioGroupNotifications";
import {
  getCategoryAccentClass,
  getFioPrimaryCategory,
  type FioCategorySlug,
} from "@/lib/wp/fio-categories";
import { formatDateTime } from "@/lib/utils/dates";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  fio: WpFio;
  schedule: string;
  locale: string;
  notificationsEnabled?: boolean;
};

function isPrivateGroup(status?: string): boolean {
  return status?.trim().toLowerCase() === "private";
}

export async function FioGroupSidebar({
  fio,
  schedule,
  locale,
  notificationsEnabled = false,
}: Props) {
  const t = await getTranslations("community");
  const category = (fio.category ??
    getFioPrimaryCategory(fio.types)) as FioCategorySlug;
  const categoryLabel = t(
    category === "other"
      ? "groupCategoryOther"
      : (`groupCategory_${category}` as "groupCategory_fio"),
  );
  const createdAt = fio.date_creation
    ? formatDateTime(fio.date_creation, locale)
    : null;

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="rounded-2xl border border-black/8 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-icc-muted">
          {t("groupSidebarTitle")}
        </h2>

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
              getCategoryAccentClass(category),
            ].join(" ")}
          >
            {categoryLabel}
          </span>

          {isPrivateGroup(fio.status) ? (
            <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-950">
              {t("groupStatusPrivate")}
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-950">
              {t("groupStatusPublic")}
            </span>
          )}

          {fio.zoom_link ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-950">
              <span aria-hidden>🌐</span>
              {t("meetsOnline")}
            </span>
          ) : null}
        </div>

        <dl className="mt-5 space-y-4 text-sm">
          {schedule ? (
            <div>
              <dt className="font-semibold text-icc-ink">{t("schedule")}</dt>
              <dd className="mt-1 text-icc-muted">{schedule}</dd>
            </div>
          ) : null}

          <div>
            <dt className="font-semibold text-icc-ink">{t("membersLabel")}</dt>
            <dd className="mt-1 text-icc-muted">
              {t("membersCountShort", { count: fio.membres })}
            </dd>
          </div>

          {createdAt ? (
            <div>
              <dt className="font-semibold text-icc-ink">{t("groupCreatedLabel")}</dt>
              <dd className="mt-1 text-icc-muted">{t("groupCreated", { date: createdAt })}</dd>
            </div>
          ) : null}
        </dl>

        <div className="mt-5 space-y-3">
          <FioGroupShareButton groupName={fio.nom} />
          <FioGroupNotificationToggle
            fioId={fio.id}
            enabled={notificationsEnabled}
          />
        </div>
      </div>
    </aside>
  );
}
