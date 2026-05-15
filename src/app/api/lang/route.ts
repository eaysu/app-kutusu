import { NextResponse } from "next/server";
import { setLangCookie } from "@/lib/lang";
import { SUPPORTED_LANGS, type Lang } from "@/lib/i18n";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const lang = (body as { lang?: unknown }).lang;
  if (typeof lang !== "string" || !(SUPPORTED_LANGS as string[]).includes(lang)) {
    return NextResponse.json({ error: "invalid_lang" }, { status: 400 });
  }
  await setLangCookie(lang as Lang);
  return NextResponse.json({ lang });
}
