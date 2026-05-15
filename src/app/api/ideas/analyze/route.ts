import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getMyIdea, isLegacyAnalysis, saveAnalysis } from "@/lib/ideas";
import { analyzeIdea } from "@/lib/ai";

export const maxDuration = 60;

export async function POST() {
  const sessionId = await getSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "no_session" }, { status: 401 });
  }

  const mine = await getMyIdea(sessionId);
  if (!mine) {
    return NextResponse.json({ error: "no_idea" }, { status: 404 });
  }

  // Already analyzed with current (bilingual) shape — cached, return as-is.
  if (mine.uniqueness && mine.aiAnalysis && !isLegacyAnalysis(mine.aiAnalysis)) {
    return NextResponse.json({
      uniqueness: mine.uniqueness,
      analysis: mine.aiAnalysis,
      cached: true,
    });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
  }

  let result;
  try {
    result = await analyzeIdea(mine.title, mine.description);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "ai_failed";
    return NextResponse.json({ error: "ai_failed", detail: msg }, { status: 502 });
  }

  if (!result) {
    return NextResponse.json({ error: "ai_empty" }, { status: 502 });
  }

  try {
    await saveAnalysis(mine.id, result, result.uniqueness);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "save_failed";
    return NextResponse.json({ error: "save_failed", detail: msg }, { status: 500 });
  }

  return NextResponse.json({
    uniqueness: result.uniqueness,
    analysis: result,
    cached: false,
  });
}
