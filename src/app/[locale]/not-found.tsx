import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="container-icc flex min-h-[60vh] flex-col items-start justify-center py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-icc-coral">
        {t("code")}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-icc-ink md:text-4xl">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-icc-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-lg border border-icc-coral bg-icc-coral px-5 py-3 text-sm font-semibold text-white hover:bg-icc-coral-deep"
      >
        {t("home")}
      </Link>
    </div>
  );
}
