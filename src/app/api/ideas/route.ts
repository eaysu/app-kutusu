import { NextResponse } from "next/server";
import { getOrCreateSessionId } from "@/lib/session";
import { createIdea, getMyIdea, updateMyIdea } from "@/lib/ideas";
import { parseSimilarLinks, validateIdea } from "@/lib/validation";

export async function POST(req: Request) {
  const sessionId = await getOrCreateSessionId();
  const existing = await getMyIdea(sessionId);
  if (existing) {
    return NextResponse.json(
      { error: "session_already_has_idea", idea: existing },
      { status: 409 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const data = body as { title?: unknown; description?: unknown; similarLinks?: unknown };
  const result = validateIdea(data);
  if (!result.ok) {
    return NextResponse.json({ error: "validation", errors: result.errors }, { status: 400 });
  }

  try {
    const idea = await createIdea({
      sessionId,
      title: result.title,
      description: result.description,
      similarLinks: parseSimilarLinks(data.similarLinks),
    });
    return NextResponse.json({ idea }, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const sessionId = await getOrCreateSessionId();
  const existing = await getMyIdea(sessionId);
  if (!existing) {
    return NextResponse.json({ error: "no_idea" }, { status: 404 });
  }
  if (existing.editCount >= 1) {
    return NextResponse.json({ error: "edit_limit" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const data = body as { title?: unknown; description?: unknown; similarLinks?: unknown };
  const result = validateIdea(data);
  if (!result.ok) {
    return NextResponse.json({ error: "validation", errors: result.errors }, { status: 400 });
  }
  try {
    const idea = await updateMyIdea({
      sessionId,
      title: result.title,
      description: result.description,
      similarLinks: parseSimilarLinks(data.similarLinks),
      editCount: existing.editCount + 1,
    });
    return NextResponse.json({ idea });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
