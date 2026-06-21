// Turns a vague idea ("Build an app") into stupidly small, roughly 15 minute
// micro tasks ("Create the GitHub repo", "Sketch the home screen on paper").
//
// IMPORTANT on keys: calling the model directly from the device means the API
// key ships inside the app, which is fine for a private build that only you
// run, but unsafe for anything distributed. For a real release, move this call
// behind a tiny backend (a Supabase Edge Function or similar) and have the app
// hit that instead. The function signature below stays the same either way.

import { DEFAULT_MODEL } from "./constants";

const SYSTEM_PROMPT = [
  "You break vague project ideas into tiny, concrete first steps.",
  "Each step must be doable in about 15 minutes, physical or digital, and unambiguous.",
  "Prefer steps that build immediate momentum over planning steps.",
  "Return ONLY a JSON array of short strings. No prose, no markdown, no code fences.",
].join(" ");

export interface GenerateOptions {
  apiKey?: string; // omit when calling through your own backend
  endpoint?: string; // override to point at your backend proxy
  model?: string;
  count?: number; // how many steps to ask for
}

export async function generateMicroSteps(
  ideaTitle: string,
  ideaNotes: string,
  options: GenerateOptions = {}
): Promise<string[]> {
  const {
    apiKey,
    endpoint = "https://api.anthropic.com/v1/messages",
    model = DEFAULT_MODEL,
    count = 6,
  } = options;

  const userPrompt =
    `Idea: ${ideaTitle}\n` +
    (ideaNotes ? `Context: ${ideaNotes}\n` : "") +
    `Give exactly ${count} first micro tasks.`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    throw new Error(`Micro step generation failed: ${res.status}`);
  }

  const data = await res.json();
  const text: string = (data.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("\n")
    .trim();

  return parseSteps(text);
}

// Offline fallback used when no API key is set, so the app works with zero
// setup. Generic but real first steps that build momentum on almost anything.
export function localMicroSteps(title: string): string[] {
  const t = title.trim() || "this idea";
  return [
    `Write one sentence describing what "done" looks like for ${t}`,
    `Spend 15 minutes on the single smallest piece of ${t}`,
    `Find one example or reference that helps with ${t}`,
    `List the next 3 concrete actions for ${t}`,
    `Set up wherever the work will live (a doc, repo, or notebook)`,
  ];
}

// Tolerant parser. Tries strict JSON first, then falls back to splitting lines
// so a stray sentence from the model never crashes the flow.
function parseSteps(text: string): string[] {
  const cleaned = text.replace(/```json|```/g, "").trim();
  try {
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr)) {
      return arr.map((s) => String(s).trim()).filter(Boolean);
    }
  } catch {
    // fall through
  }
  return cleaned
    .split("\n")
    .map((line) => line.replace(/^[\s\-\*\d\.\)]+/, "").trim())
    .filter(Boolean);
}
