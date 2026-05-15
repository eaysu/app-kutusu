// Client-safe: pure types and helpers only. No Supabase / server imports here,
// so client components can import this without pulling the server data layer
// (and the Supabase SDK / service-role key path) into the browser bundle.

export type Uniqueness = "original" | "similar_exists" | "common";

export type ScoreCriterion =
  | "originality"
  | "feasibility"
  | "market_demand"
  | "monetization";

export type IdeaScores = Record<ScoreCriterion, number>;

export type IdeaAnalysisLocale = {
  target_audience: string;
  monetization_potential: string;
  possible_competitors: string[];
  /** Short per-criterion rationale; absent on pre-scoring records. */
  score_notes?: Record<ScoreCriterion, string>;
};

export type IdeaAnalysis = {
  uniqueness: Uniqueness;
  /** 0-25 per criterion; absent on pre-scoring records. */
  scores?: IdeaScores;
  tr?: IdeaAnalysisLocale;
  en?: IdeaAnalysisLocale;
  /** legacy flat shape from pre-bilingual records — read-only fallback */
  target_audience?: string;
  monetization_potential?: string;
  possible_competitors?: string[];
};

export type Idea = {
  id: string;
  title: string;
  description: string;
  similarLinks: string[];
  upvotes: number;
  uniqueness?: Uniqueness | null;
  aiAnalysis?: IdeaAnalysis | null;
  isMine?: boolean;
  createdAt?: string;
  editCount: number;
};

export const SCORE_CRITERIA: ScoreCriterion[] = [
  "originality",
  "feasibility",
  "market_demand",
  "monetization",
];

/** Sum of the four 0-25 criteria, clamped to 0-100. Null if not scored. */
export function overallScore(
  analysis: IdeaAnalysis | null | undefined,
): number | null {
  const s = analysis?.scores;
  if (!s) return null;
  const total = SCORE_CRITERIA.reduce((acc, k) => {
    const v = Number(s[k]);
    if (!Number.isFinite(v)) return acc;
    return acc + Math.min(25, Math.max(0, v));
  }, 0);
  return Math.round(total);
}

export function pickAnalysisLocale(
  analysis: IdeaAnalysis,
  lang: "tr" | "en",
): IdeaAnalysisLocale | null {
  const own = analysis[lang];
  if (own) return own;
  const other = lang === "tr" ? "en" : "tr";
  const fallback = analysis[other];
  if (fallback) return fallback;
  if (analysis.target_audience !== undefined) {
    return {
      target_audience: analysis.target_audience,
      monetization_potential: analysis.monetization_potential ?? "",
      possible_competitors: analysis.possible_competitors ?? [],
    };
  }
  return null;
}

/** True when the cached analysis is in the old flat shape and needs a re-run. */
export function isLegacyAnalysis(
  analysis: IdeaAnalysis | null | undefined,
): boolean {
  if (!analysis) return false;
  return !analysis.tr && !analysis.en;
}
