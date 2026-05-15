import { NextResponse } from "next/server";
import { listAllIdeas, saveAnalysis } from "@/lib/ideas";
import { analyzeIdea } from "@/lib/ai";

// One-off maintenance: re-run AI analysis for every existing idea so older
// records get the new 0-100 scoring. Token-gated; not linked anywhere in the UI.
export const maxDuration = 300;

export async function POST(req: Request) {
  const token = process.env.ADMIN_TASK_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "admin_token_unset" }, { status: 503 });
  }
  if (req.headers.get("x-admin-token") !== token) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
  }

  const ideas = await listAllIdeas();
  let processed = 0;
  const failed: { id: string; reason: string }[] = [];

  for (const idea of ideas) {
    try {
      const result = await analyzeIdea(idea.title, idea.description);
      if (!result) {
        failed.push({ id: idea.id, reason: "ai_empty" });
        continue;
      }
      await saveAnalysis(idea.id, result, result.uniqueness);
      processed += 1;
    } catch (e) {
      failed.push({
        id: idea.id,
        reason: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    total: ideas.length,
    processed,
    failed,
  });
}
