import { NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { getMyIdea, toggleUpvote } from "@/lib/ideas";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const sessionId = await getOrCreateSessionId();

  // Unlock check: a session can only upvote once they have submitted an idea.
  const mine = await getMyIdea(sessionId);
  if (!mine) {
    return NextResponse.json({ error: "feed_locked" }, { status: 403 });
  }

  try {
    const result = await toggleUpvote(id, sessionId);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
