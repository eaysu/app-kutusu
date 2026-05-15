"use client";

import { t, type Lang } from "@/lib/i18n";

type Tab = "feed" | "mine";

type Props = {
  active: Tab;
  onChange: (tab: Tab) => void;
  lang: Lang;
};

export function BottomNav({ active, onChange, lang }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface border-t-[3px] border-on-background rounded-t-3xl shadow-brutal-up">
      <div className="flex justify-around items-center px-4 pb-4 pt-2">
        <NavButton
          icon="dynamic_feed"
          label={t(lang, "nav_feed")}
          active={active === "feed"}
          onClick={() => onChange("feed")}
        />
        <NavButton
          icon="person"
          label={t(lang, "nav_mine")}
          active={active === "mine"}
          onClick={() => onChange("mine")}
        />
      </div>
    </nav>
  );
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 transition-transform active:scale-95 ${
        active
          ? "bg-primary-container text-on-primary-container rounded-2xl border-[2px] border-on-background scale-110"
          : "text-on-surface-variant"
      }`}
    >
      <span className="material-symbols-outlined text-2xl">{icon}</span>
      <span
        className="mt-1 text-[14px] font-bold tracking-[0.05em]"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {label}
      </span>
    </button>
  );
}
