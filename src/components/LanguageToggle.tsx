"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
};

export function LanguageToggle({ lang }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setLang(next: Lang) {
    if (next === lang || pending) return;
    startTransition(async () => {
      await fetch("/api/lang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: next }),
      });
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center bg-surface border-[2px] border-on-background rounded-full overflow-hidden shadow-brutal-sm"
    >
      <LangButton active={lang === "tr"} onClick={() => setLang("tr")}>
        TR
      </LangButton>
      <span aria-hidden className="w-[2px] h-5 bg-on-background/30" />
      <LangButton active={lang === "en"} onClick={() => setLang("en")}>
        EN
      </LangButton>
    </div>
  );
}

function LangButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-[12px] font-bold tracking-[0.05em] transition-colors ${
        active
          ? "bg-primary-container text-on-primary-container"
          : "text-on-surface-variant hover:bg-surface-container"
      }`}
      style={{ fontFamily: "var(--font-label)" }}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
