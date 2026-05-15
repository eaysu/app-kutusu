import { pickAnalysisLocale, type Idea, type Uniqueness } from "@/lib/ideas";
import { t, type Lang, type Key } from "@/lib/i18n";

const UNIQUENESS_COPY: Record<Uniqueness, { labelKey: Key; icon: string }> = {
  original: { labelKey: "uniqueness_original", icon: "bolt" },
  similar_exists: { labelKey: "uniqueness_similar", icon: "compare_arrows" },
  common: { labelKey: "uniqueness_common", icon: "groups" },
};

type Props = {
  idea: Idea;
  onEdit: () => void;
  lang: Lang;
};

export function MyIdeaCard({ idea, onEdit, lang }: Props) {
  const uniq = idea.uniqueness ? UNIQUENESS_COPY[idea.uniqueness] : null;
  const analysis = idea.aiAnalysis
    ? pickAnalysisLocale(idea.aiAnalysis, lang)
    : null;

  return (
    <section className="flex flex-col gap-3">
      <h2
        className="text-[28px] md:text-[32px] leading-[1.2] font-bold text-on-background"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        {t(lang, "my_idea_heading")}
      </h2>
      <div className="bg-primary-container text-on-primary-container border-[4px] border-on-background rounded-3xl shadow-brutal-lg p-6 flex flex-col gap-3 relative">
        <h3
          className="text-[24px] leading-[1.3] font-bold"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {idea.title}
        </h3>
        <p className="text-[18px] leading-[1.5]" style={{ fontFamily: "var(--font-body)" }}>
          {idea.description}
        </p>

        {idea.similarLinks && idea.similarLinks.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            <span
              className="text-[14px] tracking-[0.05em] font-bold opacity-70"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {t(lang, "similar_apps_heading")}
            </span>
            <ul className="flex flex-col gap-1">
              {idea.similarLinks.map((link) => (
                <li key={link}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline break-all text-[15px]"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          {uniq ? (
            <div className="flex items-center gap-2 bg-surface text-on-surface border-[2px] border-on-background rounded-full px-3 py-1 shadow-brutal-sm">
              <span className="material-symbols-outlined text-base text-secondary-container">
                {uniq.icon}
              </span>
              <span
                className="text-[14px] font-bold tracking-[0.05em]"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {t(lang, uniq.labelKey)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-surface text-on-surface border-[2px] border-on-background rounded-full px-3 py-1 shadow-brutal-sm">
              <span className="material-symbols-outlined text-base text-on-surface-variant animate-spin">
                progress_activity
              </span>
              <span
                className="text-[14px] font-bold tracking-[0.05em]"
                style={{ fontFamily: "var(--font-label)" }}
              >
                {t(lang, "analyzing")}
              </span>
            </div>
          )}
          <button
            onClick={onEdit}
            className="bg-surface text-on-surface border-[3px] border-on-background rounded-2xl px-6 py-2 shadow-brutal brutal-press flex items-center gap-2"
            style={{
              fontFamily: "var(--font-label)",
              fontWeight: 700,
              fontSize: "14px",
              letterSpacing: "0.05em",
            }}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            {t(lang, "edit_button")}
          </button>
        </div>

        {analysis && (
          <div className="mt-3 pt-3 border-t-[2px] border-on-background/20 flex flex-col gap-3">
            <span
              className="text-[14px] tracking-[0.05em] font-bold opacity-70 flex items-center gap-1"
              style={{ fontFamily: "var(--font-label)" }}
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              {t(lang, "analysis_heading")}
            </span>
            <AnalysisRow
              label={t(lang, "analysis_target")}
              value={analysis.target_audience}
            />
            <AnalysisRow
              label={t(lang, "analysis_monetization")}
              value={analysis.monetization_potential}
            />
            {analysis.possible_competitors.length > 0 && (
              <div className="flex flex-col gap-1">
                <span
                  className="text-[12px] tracking-[0.05em] font-bold opacity-70"
                  style={{ fontFamily: "var(--font-label)" }}
                >
                  {t(lang, "analysis_competitors")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {analysis.possible_competitors.map((c) => (
                    <span
                      key={c}
                      className="inline-block bg-surface text-on-surface border-[2px] border-on-background rounded-full px-3 py-1 text-[13px] font-bold tracking-[0.03em]"
                      style={{ fontFamily: "var(--font-label)" }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function AnalysisRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className="text-[12px] tracking-[0.05em] font-bold opacity-70 uppercase"
        style={{ fontFamily: "var(--font-label)" }}
      >
        {label}
      </span>
      <p
        className="text-[15px] leading-[1.5]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {value}
      </p>
    </div>
  );
}
