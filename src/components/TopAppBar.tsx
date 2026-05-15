import Image from "next/image";
import appIcon from "../app/icon.png";
import { formatNum, t, type Lang } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

type Props = {
  ideaCount: number;
  lang: Lang;
};

export function TopAppBar({ ideaCount, lang }: Props) {
  return (
    <header className="bg-surface border-b-[3px] border-on-background shadow-brutal sticky top-0 z-40">
      <div className="flex justify-between items-center gap-3 w-full px-6 py-4 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2 min-w-0">
          <Image
            src={appIcon}
            alt={t(lang, "brand")}
            width={40}
            height={40}
            priority
            className="rounded-xl border-[2px] border-on-background shadow-brutal-sm"
          />
          <span
            className="text-2xl font-bold text-on-surface truncate"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {t(lang, "brand")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle lang={lang} />
          <span
            className="hidden sm:inline-flex items-center gap-1 bg-primary-container text-on-primary-container px-4 py-2 rounded-full border-[2px] border-on-background shadow-brutal-sm"
            style={{
              fontFamily: "var(--font-label)",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.05em",
            }}
          >
            {t(lang, "topbar_ideas_chip", { n: formatNum(ideaCount, lang) })}
          </span>
        </div>
      </div>
    </header>
  );
}
