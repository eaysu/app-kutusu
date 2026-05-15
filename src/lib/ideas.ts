import { getSupabase, type IdeaRow } from "./supabase";

export type Uniqueness = "original" | "similar_exists" | "common";

export type IdeaAnalysisLocale = {
  target_audience: string;
  monetization_potential: string;
  possible_competitors: string[];
};

export type IdeaAnalysis = {
  uniqueness: Uniqueness;
  tr?: IdeaAnalysisLocale;
  en?: IdeaAnalysisLocale;
  /** legacy flat shape from pre-bilingual records — read-only fallback */
  target_audience?: string;
  monetization_potential?: string;
  possible_competitors?: string[];
};

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
export function isLegacyAnalysis(analysis: IdeaAnalysis | null | undefined): boolean {
  if (!analysis) return false;
  return !analysis.tr && !analysis.en;
}

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

/* --------------------------- In-memory fallback --------------------------- */
type MemIdea = {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  similarLinks: string[];
  upvotes: number;
  uniqueness: Uniqueness | null;
  aiAnalysis: IdeaAnalysis | null;
  editCount: number;
  createdAt: string;
};

const g = globalThis as unknown as {
  __ideaStore?: { ideas: Map<string, MemIdea>; upvotes: Set<string> };
};

function memStore() {
  if (!g.__ideaStore) {
    const ideas = new Map<string, MemIdea>();
    const upvotes = new Set<string>();
    // seed
    const seed: Array<Omit<MemIdea, "createdAt">> = [
      {
        id: "seed-1",
        sessionId: "seed-1",
        title: "Tinder for finding a co-founder",
        description:
          "Swipe left on business bros, right on technical wizards. Match based on complimentary skill sets and Myers-Briggs types. Built-in vibe check.",
        similarLinks: [],
        upvotes: 342,
        uniqueness: "similar_exists",
        aiAnalysis: null,
        editCount: 0,
      },
      {
        id: "seed-2",
        sessionId: "seed-2",
        title: "AI that writes apology texts to your mom",
        description:
          "Connects to your calendar and automatically generates highly personalized excuses for missing Sunday dinner. Tone slider from sweet to grovel.",
        similarLinks: [],
        upvotes: 128,
        uniqueness: "original",
        aiAnalysis: null,
        editCount: 0,
      },
      {
        id: "seed-3",
        sessionId: "seed-3",
        title: "Uber for finding a bathroom in NYC",
        description:
          "Crowdsourced map of usable restrooms with real-time cleanliness ratings, access codes, and a panic button. Save lives, one flush at a time.",
        similarLinks: [],
        upvotes: 87,
        uniqueness: "common",
        aiAnalysis: null,
        editCount: 0,
      },
    ];
    const now = Date.now();
    seed.forEach((s, i) =>
      ideas.set(s.id, { ...s, createdAt: new Date(now - i * 1000).toISOString() }),
    );
    g.__ideaStore = { ideas, upvotes };
  }
  return g.__ideaStore;
}

function memKey(ideaId: string, sessionId: string) {
  return `${ideaId}::${sessionId}`;
}

/* --------------------------- Public data layer ---------------------------- */

function rowToIdea(d: IdeaRow, isMine: boolean): Idea {
  return {
    id: d.id,
    title: d.title,
    description: d.description,
    similarLinks: d.similar_links ?? [],
    upvotes: d.upvotes,
    uniqueness: d.ai_uniqueness,
    aiAnalysis: (d.ai_analysis as IdeaAnalysis | null) ?? null,
    isMine,
    createdAt: d.created_at,
    editCount: d.edit_count ?? 0,
  };
}

export async function getMyIdea(sessionId: string): Promise<Idea | null> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("ideas")
      .select("*")
      .eq("session_id", sessionId)
      .maybeSingle<IdeaRow>();
    if (error) throw error;
    if (!data) return null;
    return rowToIdea(data, true);
  }
  const mine = [...memStore().ideas.values()].find((i) => i.sessionId === sessionId);
  if (!mine) return null;
  return memToIdea(mine, true);
}

export async function getFeed(sessionId: string | null): Promise<{
  ideas: Idea[];
  myUpvotes: Set<string>;
}> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("ideas")
      .select("*")
      .order("upvotes", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    const rows = (data ?? []) as IdeaRow[];
    let myUpvotes = new Set<string>();
    if (sessionId) {
      const { data: ups } = await sb
        .from("upvotes")
        .select("idea_id")
        .eq("session_id", sessionId);
      const upRows = (ups ?? []) as { idea_id: string }[];
      myUpvotes = new Set(upRows.map((u) => u.idea_id));
    }
    return {
      ideas: rows.map((d) =>
        rowToIdea(d, sessionId !== null && d.session_id === sessionId),
      ),
      myUpvotes,
    };
  }
  const store = memStore();
  const ideas = [...store.ideas.values()]
    .sort((a, b) => b.upvotes - a.upvotes || (a.createdAt < b.createdAt ? 1 : -1))
    .map((m) => memToIdea(m, sessionId !== null && m.sessionId === sessionId));
  const myUpvotes = new Set<string>();
  if (sessionId) {
    for (const key of store.upvotes) {
      const [ideaId, sid] = key.split("::");
      if (sid === sessionId) myUpvotes.add(ideaId);
    }
  }
  return { ideas, myUpvotes };
}

export async function getIdeaCount(): Promise<number> {
  const sb = getSupabase();
  if (sb) {
    const { count } = await sb.from("ideas").select("*", { count: "exact", head: true });
    return count ?? 0;
  }
  return memStore().ideas.size;
}

export type CreateIdeaInput = {
  sessionId: string;
  title: string;
  description: string;
  similarLinks: string[];
};

export async function createIdea(input: CreateIdeaInput): Promise<Idea> {
  const sb = getSupabase();
  if (sb) {
    const { data, error } = await sb
      .from("ideas")
      .insert([
        {
          session_id: input.sessionId,
          title: input.title,
          description: input.description,
          similar_links: input.similarLinks,
        },
      ])
      .select("*")
      .single<IdeaRow>();
    if (error) throw error;
    return rowToIdea(data, true);
  }
  const store = memStore();
  if ([...store.ideas.values()].some((i) => i.sessionId === input.sessionId)) {
    throw new Error("session_already_has_idea");
  }
  const mem: MemIdea = {
    id: crypto.randomUUID(),
    sessionId: input.sessionId,
    title: input.title,
    description: input.description,
    similarLinks: input.similarLinks,
    upvotes: 0,
    uniqueness: null,
    aiAnalysis: null,
    editCount: 0,
    createdAt: new Date().toISOString(),
  };
  store.ideas.set(mem.id, mem);
  return memToIdea(mem, true);
}

export type UpdateIdeaInput = {
  sessionId: string;
  title: string;
  description: string;
  similarLinks: string[];
  /** New value for edit_count (existing + 1), set by the caller. */
  editCount: number;
};

export async function updateMyIdea(input: UpdateIdeaInput): Promise<Idea> {
  const sb = getSupabase();
  if (sb) {
    // Clearing the cached analysis forces a fresh AI re-run on next view.
    const { data, error } = await sb
      .from("ideas")
      .update({
        title: input.title,
        description: input.description,
        similar_links: input.similarLinks,
        edit_count: input.editCount,
        ai_analysis: null,
        ai_uniqueness: null,
      })
      .eq("session_id", input.sessionId)
      .select("*")
      .single<IdeaRow>();
    if (error) throw error;
    return rowToIdea(data, true);
  }
  const store = memStore();
  const mine = [...store.ideas.values()].find((i) => i.sessionId === input.sessionId);
  if (!mine) throw new Error("idea_not_found");
  mine.title = input.title;
  mine.description = input.description;
  mine.similarLinks = input.similarLinks;
  mine.editCount = input.editCount;
  mine.aiAnalysis = null;
  mine.uniqueness = null;
  return memToIdea(mine, true);
}

export async function saveAnalysis(
  ideaId: string,
  analysis: IdeaAnalysis,
  uniqueness: Uniqueness,
): Promise<void> {
  const sb = getSupabase();
  if (sb) {
    const { error } = await sb
      .from("ideas")
      .update({ ai_analysis: analysis, ai_uniqueness: uniqueness })
      .eq("id", ideaId);
    if (error) throw error;
    return;
  }
  const idea = memStore().ideas.get(ideaId);
  if (idea) {
    idea.aiAnalysis = analysis;
    idea.uniqueness = uniqueness;
  }
}

export async function toggleUpvote(
  ideaId: string,
  sessionId: string,
): Promise<{ upvoted: boolean; upvotes: number }> {
  const sb = getSupabase();
  if (sb) {
    const { data: existing } = await sb
      .from("upvotes")
      .select("id")
      .eq("idea_id", ideaId)
      .eq("session_id", sessionId)
      .maybeSingle<{ id: string }>();
    if (existing) {
      await sb.from("upvotes").delete().eq("id", existing.id);
    } else {
      await sb
        .from("upvotes")
        .insert([{ idea_id: ideaId, session_id: sessionId }]);
    }
    const { data: row, error } = await sb
      .from("ideas")
      .select("upvotes")
      .eq("id", ideaId)
      .single<{ upvotes: number }>();
    if (error) throw error;
    return { upvoted: !existing, upvotes: row.upvotes };
  }
  const store = memStore();
  const idea = store.ideas.get(ideaId);
  if (!idea) throw new Error("idea_not_found");
  const k = memKey(ideaId, sessionId);
  if (store.upvotes.has(k)) {
    store.upvotes.delete(k);
    idea.upvotes = Math.max(0, idea.upvotes - 1);
    return { upvoted: false, upvotes: idea.upvotes };
  }
  store.upvotes.add(k);
  idea.upvotes += 1;
  return { upvoted: true, upvotes: idea.upvotes };
}

function memToIdea(m: MemIdea, isMine: boolean): Idea {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    similarLinks: m.similarLinks,
    upvotes: m.upvotes,
    uniqueness: m.uniqueness,
    aiAnalysis: m.aiAnalysis,
    isMine,
    createdAt: m.createdAt,
    editCount: m.editCount,
  };
}
