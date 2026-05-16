"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  overallScore,
  pickAnalysisLocale,
  SCORE_CRITERIA,
  type Idea,
  type ScoreCriterion,
  type Uniqueness,
} from "@/lib/analysis";
import { t, type Lang, type Key } from "@/lib/i18n";

const UNIQUENESS_COPY: Record<Uniqueness, { labelKey: Key; icon: string }> = {
  original: { labelKey: "uniqueness_original", icon: "bolt" },
  similar_exists: { labelKey: "uniqueness_similar", icon: "compare_arrows" },
  common: { labelKey: "uniqueness_common", icon: "groups" },
};

const SCORE_LABEL: Record<ScoreCriterion, Key> = {
  originality: "score_originality",
  feasibility: "score_feasibility",
  market_demand: "score_market_demand",
  monetization: "score_monetization",
};


type Props = {
  idea: Idea;
  expanded: boolean;
  upvoted: boolean;
  lang: Lang;
  onToggle: () => void;
  onUpvote: () => void;
  onEdit?: () => void;
};

export function FeedCard({
  idea,
  expanded,
  upvoted,
  lang,
  onToggle,
  onUpvote,
  onEdit,
}: Props) {
  const mine = idea.isMine === true;
  const uniq = idea.uniqueness ? UNIQUENESS_COPY[idea.uniqueness] : null;
  const analysis = idea.aiAnalysis
    ? pickAnalysisLocale(idea.aiAnalysis, lang)
    : null;
  const overall = overallScore(idea.aiAnalysis);
  const scores = idea.aiAnalysis?.scores ?? null;

  return (
    <motion.div
      layout
      className={`border-on-background rounded-3xl shadow-brutal-md p-6 flex flex-col gap-2 cursor-pointer ${
        mine
          ? "bg-primary-container text-on-primary-container border-[4px]"
          : "bg-surface-container-lowest border-[3px]"
      }`}
      onClick={onToggle}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <motion.div layout="position" className="flex items-center gap-4">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onUpvote();
          }}
          className={`flex shrink-0 items-center gap-1 px-3 py-1.5 border-[2px] border-on-background rounded-full shadow-brutal-sm brutal-press transition-colors ${
            upvoted ? "bg-tertiary-container" : "bg-secondary-container"
          }`}
          aria-label={`Upvote ${idea.title}`}
          aria-pressed={upvoted}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined text-xl">keyboard_arrow_up</span>
          <span
            className="text-[20px] font-bold tabular-nums"
            style={{ fontFamily: "var(--font-headline)" }}
          >
            {idea.upvotes}
          </span>
        </motion.button>
        <h3
          className="min-w-0 flex-grow text-[20px] md:text-[24px] leading-[1.3] font-bold break-words [overflow-wrap:anywhere]"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {idea.title}
        </h3>
        {overall !== null && (
          <span
            className="flex shrink-0 flex-col items-end gap-0.5"
            title={t(lang, "score_overall_aria", { n: overall })}
            aria-label={t(lang, "score_overall_aria", { n: overall })}
          >
            <span
              className="text-[9px] font-bold tracking-[0.08em] opacity-50 leading-none"
              style={{ fontFamily: "var(--font-label)" }}
            >
              {t(lang, "score_badge_label")}
            </span>
            <span className="flex items-baseline gap-0.5 leading-none">
              <span
                className="text-[20px] font-bold tabular-nums"
                style={{ fontFamily: "var(--font-headline)" }}
              >
                {overall}
              </span>
              <span className="text-[11px] font-bold opacity-50">/100</span>
            </span>
          </span>
        )}
        <motion.span
          className={`material-symbols-outlined shrink-0 ${
            mine ? "text-on-primary-container" : "text-on-surface-variant"
          }`}
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
        >
          expand_more
        </motion.span>
      </motion.div>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div
              className={`flex flex-col gap-3 mt-2 pt-3 border-t-2 ${
                mine ? "border-on-background/20" : "border-on-background/10"
              }`}
            >
              <p
                className={`text-[16px] leading-[1.5] ${
                  mine ? "" : "text-on-surface-variant"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {idea.description}
              </p>

              {(uniq || mine) && (
                <div className="flex flex-wrap items-center justify-between gap-4">
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
                  {mine && onEdit && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
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
                  )}
                </div>
              )}

              {analysis && (
                <div className="mt-1 pt-3 border-t-[2px] border-on-background/20 flex flex-col gap-3">
                  <span
                    className="text-[14px] tracking-[0.05em] font-bold opacity-70 flex items-center gap-1"
                    style={{ fontFamily: "var(--font-label)" }}
                  >
                    <span className="material-symbols-outlined text-base">
                      auto_awesome
                    </span>
                    {t(lang, "analysis_heading")}
                  </span>
                  {scores && (
                    <div className="flex flex-col gap-2">
                      <span
                        className="text-[12px] tracking-[0.05em] font-bold opacity-70"
                        style={{ fontFamily: "var(--font-label)" }}
                      >
                        {t(lang, "score_heading")}
                      </span>
                      {SCORE_CRITERIA.map((c) => (
                        <ScoreBar
                          key={c}
                          label={t(lang, SCORE_LABEL[c])}
                          value={Math.min(25, Math.max(0, Number(scores[c]) || 0))}
                          note={analysis.score_notes?.[c]}
                        />
                      ))}
                    </div>
                  )}
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
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScoreBar({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <span
          className="text-[13px] font-bold"
          style={{ fontFamily: "var(--font-label)" }}
        >
          {label}
        </span>
        <span
          className="text-[13px] font-bold tabular-nums opacity-80"
          style={{ fontFamily: "var(--font-headline)" }}
        >
          {value}/25
        </span>
      </div>
      <div className="h-2 w-full bg-surface border-[2px] border-on-background rounded-full overflow-hidden">
        <div
          className="h-full bg-on-background"
          style={{ width: `${(value / 25) * 100}%` }}
        />
      </div>
      {note && (
        <p
          className="text-[12px] leading-[1.4] opacity-80"
          style={{ fontFamily: "var(--font-body)" }}
        >
          {note}
        </p>

      )}
    </div>
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
      <p className="text-[15px] leading-[1.5]" style={{ fontFamily: "var(--font-body)" }}>
        {value}
      </p>
    </div>
  );
}
