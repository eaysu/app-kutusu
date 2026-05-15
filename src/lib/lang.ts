import { cookies, headers } from "next/headers";
import { DEFAULT_LANG, SUPPORTED_LANGS, type Lang } from "./i18n";

const COOKIE_NAME = "ak_lang";
const ONE_YEAR = 60 * 60 * 24 * 365;

function detectFromAcceptLanguage(header: string | null): Lang {
  if (!header) return DEFAULT_LANG;
  // Parse Accept-Language quality-ordered list, take the first supported.
  const parsed = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qPart = params.find((p) => p.trim().startsWith("q="));
      const q = qPart ? Number(qPart.split("=")[1]) || 0 : 1;
      return { tag: tag.toLowerCase(), q };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of parsed) {
    const base = tag.split("-")[0];
    if (base === "tr") return "tr";
    if (base === "en") return "en";
  }
  return "en";
}

export async function resolveLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get(COOKIE_NAME)?.value;
  if (cookieLang && (SUPPORTED_LANGS as string[]).includes(cookieLang)) {
    return cookieLang as Lang;
  }
  const h = await headers();
  return detectFromAcceptLanguage(h.get("accept-language"));
}

export async function setLangCookie(lang: Lang): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, lang, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
}
