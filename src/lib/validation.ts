export type ValidationErrors = {
  title?: string;
  description?: string;
};

export function validateIdea(input: {
  title?: unknown;
  description?: unknown;
}): { ok: true; title: string; description: string } | { ok: false; errors: ValidationErrors } {
  const errors: ValidationErrors = {};
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description =
    typeof input.description === "string" ? input.description.trim() : "";
  if (title.length < 3) errors.title = "Title must be at least 3 characters.";
  if (description.length < 80) {
    errors.description = `Description must be at least 80 characters (currently ${description.length}).`;
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
