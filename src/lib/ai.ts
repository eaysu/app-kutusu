import OpenAI from "openai";
import type { IdeaAnalysis } from "./ideas";

const MODEL = "gpt-5-mini";

const SYSTEM_PROMPT = [
  "You are a friendly product analyst evaluating playful, anonymous app ideas.",
  "Be concise, specific, and constructive. Avoid generic startup advice.",
  "",
  "Uniqueness levels (categorical, same across languages):",
  "- original: a genuinely fresh angle or combination",
  "- similar_exists: clear adjacent products exist, but the take is distinct",
  "- common: a frequently-pitched concept with many close competitors",
  "",
  "Produce the analysis in BOTH Turkish (tr) and English (en).",
  "Each text field should be at most 220 characters in its own language.",
  "Competitors should be 0-4 real product names (no URLs) and should be the",
  "same list across languages (proper nouns don't translate).",
  "Write the Turkish version in natural, native-sounding Turkish — not a",
  "literal translation of the English.",
].join("\n");

export async function analyzeIdea(
  title: string,
  description: string,
): Promise<IdeaAnalysis | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const client = new OpenAI({ apiKey: key });

  const localeProperties = {
    type: "object",
    additionalProperties: false,
    required: ["target_audience", "monetization_potential", "possible_competitors"],
    properties: {
      target_audience: { type: "string" },
      monetization_potential: { type: "string" },
      possible_competitors: {
        type: "array",
        items: { type: "string" },
      },
    },
  } as const;

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Title: ${title}\n\nDescription: ${description}`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "idea_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          required: ["uniqueness", "tr", "en"],
          properties: {
            uniqueness: {
              type: "string",
              enum: ["original", "similar_exists", "common"],
            },
            tr: localeProperties,
            en: localeProperties,
          },
        },
      },
    },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) return null;
  try {
    return JSON.parse(content) as IdeaAnalysis;
  } catch {
    return null;
  }
}
