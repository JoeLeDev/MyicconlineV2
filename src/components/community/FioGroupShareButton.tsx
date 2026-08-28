"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  groupName: string;
};

export function FioGroupShareButton({ groupName }: Props) {
  const t = useTranslations("community");
  const [copied, setCopied] = useState(false);

  const share = useCallback(async () => {
    const url = window.location.href;

    try {
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: groupName,
          url,
        });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        setCopied(false);
      }
    }
  }, [groupName]);

  return (
    <button
      type="button"
      onClick={() => void share()}
      className="inline-flex w-full items-center justify-center rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-icc-ink transition hover:border-icc-coral/30 hover:text-icc-coral"
    >
      {copied ? t("groupShareCopied") : t("groupShare")}
    </button>
  );
}
