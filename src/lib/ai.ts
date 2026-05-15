import OpenAI from "openai";
import type { IdeaAnalysis } from "./analysis";

const MODEL = "gpt-5-mini";

const SYSTEM_PROMPT = [
  "You are a friendly product analyst evaluating playful, anonymous app ideas.",
  "Be concise, specific, and constructive. Avoid generic startup advice.",
  "",
  "Analyze the idea AS DESCRIBED. Do NOT silently reinterpret an infeasible",
  "idea into a different, feasible product to make it look better. If the",
  "idea as written is impractical, reflect that honestly in the feasibility",
  "score and notes.",
  "",
  "Uniqueness levels (categorical, same across languages):",
  "- original: a genuinely fresh angle or combination",
  "- similar_exists: clear adjacent products exist, but the take is distinct",
  "- common: a frequently-pitched concept with many close competitors",
  "",
  "Scores: rate each of the four criteria as an INTEGER from 0 to 25",
  "(0 = very weak, 25 = excellent). These are language-independent.",
  "- originality: how fresh vs. derivative the concept is",
  "- feasibility: how realistically it can be built with current tech/resources",
  "- market_demand: how many people actually want this and how strongly",
  "- monetization: how clearly and sustainably it can make money",
  "Do not inflate scores. An impossible or joke idea should score low on",
  "feasibility even if it is original.",
  "",
  "Competitors: 0-4 names of DIRECTLY COMPARABLE products that a user would",
  "realistically consider as alternatives. Do NOT list broad platforms or",
  "organizations (e.g. Google, NASA) unless that exact product is a true",
  "head-to-head substitute. Same list across languages (proper nouns don't",
  "translate). No URLs.",
  "",
  "Produce the analysis in BOTH Turkish (tr) and English (en).",
  "Each text field should be at most 220 characters in its own language.",
  "score_notes: one short sentence per criterion (max 120 chars) explaining",
  "why that score was given, in the field's own language.",
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

  const scoreNotesSchema = {
    type: "object",
    additionalProperties: false,
    required: ["originality", "feasibility", "market_demand", "monetization"],
    properties: {
      originality: { type: "string" },
      feasibility: { type: "string" },
      market_demand: { type: "string" },
      monetization: { type: "string" },
    },
  } as const;

  const localeProperties = {
    type: "object",
    additionalProperties: false,
    required: [
      "target_audience",
      "monetization_potential",
      "possible_competitors",
      "score_notes",
    ],
    properties: {
      target_audience: { type: "string" },
      monetization_potential: { type: "string" },
      possible_competitors: {
        type: "array",
        items: { type: "string" },
      },
      score_notes: scoreNotesSchema,
    },
  } as const;

  const scoresSchema = {
    type: "object",
    additionalProperties: false,
    required: ["originality", "feasibility", "market_demand", "monetization"],
    properties: {
      originality: { type: "integer", minimum: 0, maximum: 25 },
      feasibility: { type: "integer", minimum: 0, maximum: 25 },
      market_demand: { type: "integer", minimum: 0, maximum: 25 },
      monetization: { type: "integer", minimum: 0, maximum: 25 },
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
          required: ["uniqueness", "scores", "tr", "en"],
          properties: {
            uniqueness: {
              type: "string",
              enum: ["original", "similar_exists", "common"],
            },
            scores: scoresSchema,
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
