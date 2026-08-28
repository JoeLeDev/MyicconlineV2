"use client";

import { useState, type ReactNode } from "react";

type Tab = {
  id: string;
  label: string;
  badge?: number;
};

type Props = {
  tabs: Tab[];
  panels: Record<string, ReactNode>;
  defaultTab?: string;
};

export function FioGroupTabs({ tabs, panels, defaultTab }: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "feed");

  return (
    <div>
      <div
        className="border-b border-black/8 bg-white"
        role="tablist"
        aria-label="Sections du groupe"
      >
        <div className="container-icc flex max-w-5xl gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(tab.id)}
                className={[
                  "relative shrink-0 px-4 py-4 text-sm font-semibold transition",
                  selected
                    ? "text-icc-coral"
                    : "text-icc-muted hover:text-icc-ink",
                ].join(" ")}
              >
                {tab.label}
                {tab.badge != null && tab.badge > 0 ? (
                  <span className="ml-1.5 rounded-full bg-icc-cream px-2 py-0.5 text-xs font-bold text-icc-ink">
                    {tab.badge}
                  </span>
                ) : null}
                {selected ? (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-icc-coral" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="container-icc max-w-5xl py-8 md:py-10">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            role="tabpanel"
            hidden={active !== tab.id}
            className={active === tab.id ? undefined : "hidden"}
          >
            {panels[tab.id]}
          </div>
        ))}
      </div>
    </div>
  );
}
