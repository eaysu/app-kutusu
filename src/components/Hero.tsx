import { formatNum, t, type Lang } from "@/lib/i18n";

type Props = {
  ideaCount: number;
  lang: Lang;
};

export function Hero({ ideaCount, lang }: Props) {
  const title = t(lang, "hero_title");
  return (
    <section className="text-center flex flex-col items-center gap-6">
      <h1
        className="hidden md:block max-w-2xl text-[48px] leading-[1.1] tracking-[-0.02em] font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      <h1
        className="md:hidden max-w-sm text-[28px] leading-[1.2] font-bold"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {title}
      </h1>
      <div
        className="bg-tertiary-container text-on-tertiary-container border-[3px] border-on-background rounded-full px-6 py-3 inline-block shadow-brutal -rotate-2"
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 600,
          fontSize: "24px",
          lineHeight: "1.3",
        }}
      >
        {t(lang, "hero_counter", { n: formatNum(ideaCount, lang) })}
      </div>
    </section>
  );
}
