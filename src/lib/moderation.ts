import OpenAI from "openai";

// Uses OpenAI's free moderation endpoint to flag sexual / violent / harassing
// / hateful content. Fails OPEN (returns false) when the API key is missing or
// the call errors, so an outage never blocks legitimate submissions — the
// deterministic validation in validation.ts still applies regardless.
export async function isFlaggedContent(text: string): Promise<boolean> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return false;
  try {
    const client = new OpenAI({ apiKey: key });
    const res = await client.moderations.create({
      model: "omni-moderation-latest",
      input: text.slice(0, 4000),
    });
    return res.results.some((r) => r.flagged);
  } catch {
    return false;
  }
}
