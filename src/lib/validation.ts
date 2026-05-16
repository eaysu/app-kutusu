export type ValidationErrors = {
  title?: string;
  description?: string;
};

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 2000;

// Idea text is plain prose — no markup is ever legitimate. Rejecting angle
// brackets kills XSS-payload spam and shrinks the prompt-injection surface
// before the text is fed to OpenAI.
const HTML_LIKE = /[<>]/;

export function containsMarkup(s: string): boolean {
  return HTML_LIKE.test(s);
}

export function validateIdea(input: {
  title?: unknown;
  description?: unknown;
}): { ok: true; title: string; description: string } | { ok: false; errors: ValidationErrors } {
  const errors: ValidationErrors = {};
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";

  if (title.length < 3) {
    errors.title = "Title must be at least 3 characters.";
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be at most ${TITLE_MAX} characters.`;
  } else if (containsMarkup(title)) {
    errors.title = "Title can't contain HTML or code.";
  }

  if (description.length < 80) {
    errors.description = `Description must be at least 80 characters (currently ${description.length}).`;
  } else if (description.length > DESCRIPTION_MAX) {
    errors.description = `Description must be at most ${DESCRIPTION_MAX} characters.`;
  } else if (containsMarkup(description)) {
    errors.description = "Description can't contain HTML or code.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, title, description };
}

export function parseSimilarLinks(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
  }
  if (typeof input !== "string") return [];
  return input
    .split(/\s*,\s*|\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 10);
}
