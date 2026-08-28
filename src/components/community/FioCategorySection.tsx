"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FioCardClient } from "@/components/community/FioCardClient";
import {
  getCategoryAccentClass,
  type FioCategorySlug,
} from "@/lib/wp/fio-categories";
import type { WpFio } from "@/lib/wp/community-types";

type Props = {
  category: FioCategorySlug;
  fios: WpFio[];
};

function categoryMessageKey(category: FioCategorySlug): string {
  if (category === "other") return "groupCategoryOther";
  return `groupCategory_${category}`;
}

export function FioCategorySection({ category, fios }: Props) {
  const t = useTranslations("community");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const categoryLabel = t(categoryMessageKey(category) as "groupCategory_fio");

  const updateScrollState = useCallback(() => {
    const node = scrollerRef.current;
    if (!node) return;

    setCanScrollPrev(node.scrollLeft > 8);
    setCanScrollNext(node.scrollLeft + node.clientWidth < node.scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [fios, updateScrollState]);

  function scrollByPage(direction: "prev" | "next") {
    const node = scrollerRef.current;
    if (!node) return;

    const delta =
      direction === "next" ? node.clientWidth * 0.85 : -node.clientWidth * 0.85;
    node.scrollBy({ left: delta, behavior: "smooth" });
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-extrabold tracking-tight text-icc-ink">
          {t("groupCategorySectionPrefix")}{" "}
          <span
            className={[
              "inline-flex rounded-full px-3 py-1 align-middle text-[0.95em]",
              getCategoryAccentClass(category),
            ].join(" ")}
          >
            {categoryLabel}
          </span>
        </h2>
        <p className="mt-2 text-sm text-icc-muted">
          {t("groupsCount", { count: fios.length })}
        </p>
      </div>

      <div className="relative">
        {canScrollPrev ? (
          <button
            type="button"
            aria-label={t("carouselPrev")}
            onClick={() => scrollByPage("prev")}
            className="absolute left-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-lg shadow-md transition hover:bg-icc-cream md:flex"
          >
            ←
          </button>
        ) : null}

        <div
          ref={scrollerRef}
          onScroll={updateScrollState}
          className="flex gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {fios.map((fio) => (
            <div
              key={fio.id}
              className="w-[min(100%,18.5rem)] shrink-0 sm:w-[19rem]"
            >
              <FioCardClient fio={fio} />
            </div>
          ))}
        </div>

        {canScrollNext ? (
          <button
            type="button"
            aria-label={t("carouselNext")}
            onClick={() => scrollByPage("next")}
            className="absolute right-0 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-icc-ink text-lg text-white shadow-md transition hover:bg-icc-coral md:flex"
          >
            →
          </button>
        ) : null}
      </div>
    </section>
  );
}
