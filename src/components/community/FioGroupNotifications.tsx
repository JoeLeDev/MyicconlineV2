"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  fioId: number;
  latestActivityId: number | null;
  enabled: boolean;
};

function storageKey(fioId: number): string {
  return `icc-fio-notify-${fioId}`;
}

function lastSeenKey(fioId: number): string {
  return `icc-fio-last-seen-${fioId}`;
}

export function FioGroupNotificationBanner({
  fioId,
  latestActivityId,
  enabled,
}: Props) {
  const t = useTranslations("community");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled || !latestActivityId) return;

    const notifyEnabled = window.localStorage.getItem(storageKey(fioId)) === "1";
    if (!notifyEnabled) return;

    const lastSeen = Number(window.localStorage.getItem(lastSeenKey(fioId)) || 0);
    if (latestActivityId > lastSeen) {
      setVisible(true);

      if (
        typeof window.Notification !== "undefined" &&
        window.Notification.permission === "granted"
      ) {
        new window.Notification(t("groupNotifyNew"));
      }
    }
  }, [enabled, fioId, latestActivityId, t]);

  if (!visible) return null;

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
      <p className="font-semibold">{t("groupNotifyNew")}</p>
      <button
        type="button"
        onClick={() => {
          if (latestActivityId) {
            window.localStorage.setItem(lastSeenKey(fioId), String(latestActivityId));
          }
          setVisible(false);
        }}
        className="mt-2 font-semibold text-sky-800 underline-offset-2 hover:underline"
      >
        {t("groupNotifyMarkRead")}
      </button>
    </div>
  );
}

type ToggleProps = {
  fioId: number;
  enabled: boolean;
};

export function FioGroupNotificationToggle({ fioId, enabled }: ToggleProps) {
  const t = useTranslations("community");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setActive(window.localStorage.getItem(storageKey(fioId)) === "1");
  }, [enabled, fioId]);

  if (!enabled) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const next = !active;
        setActive(next);
        window.localStorage.setItem(storageKey(fioId), next ? "1" : "0");
        if (
          next &&
          typeof window.Notification !== "undefined" &&
          window.Notification.permission === "default"
        ) {
          void window.Notification.requestPermission();
        }
      }}
      className={[
        "inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-sky-100 text-sky-950"
          : "border border-black/10 bg-white text-icc-ink hover:border-icc-coral/30",
      ].join(" ")}
    >
      {t("groupNotifyEnable")}
    </button>
  );
}
