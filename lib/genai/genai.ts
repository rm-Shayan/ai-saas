import { GoogleGenerativeAI } from "@google/generative-ai";
import JSON5 from "json5";

const ai = new GoogleGenerativeAI( process.env.GEMINI_API_KEY!);

// 🔹 Extract the first valid JSON from a string (supports nested objects/arrays)
function extractJSON(rawText: string): string | null {
  if (!rawText || typeof rawText !== "string") return null;

  // Remove any leading/trailing whitespace
  rawText = rawText.trim();

  // Quick check: entire text is valid JSON
  try {
    JSON.parse(rawText);
    return rawText;
  } catch {}

  // Fallback: extract the first {...} or [...] block using simple stack parsing
  const stack: string[] = [];
  let startIdx = -1;

  for (let i = 0; i < rawText.length; i++) {
    const char = rawText[i];
    if (char === "{" || char === "[") {
      if (stack.length === 0) startIdx = i;
      stack.push(char);
    } else if (char === "}" || char === "]") {
      const last = stack.pop();
      if (!last) continue; // unmatched closing
      if (
        (last === "{" && char !== "}") ||
        (last === "[" && char !== "]")
      ) {
        // mismatched brackets
        return null;
      }
      if (stack.length === 0 && startIdx !== -1) {
        return rawText.slice(startIdx, i + 1);
      }
    }
  }

  return null; // no valid JSON found
}

// 🔹 Robust JSON parser using JSON5 with fallback
function safeParseJSON5(rawText: string, fallback: any = {}): any {
  try {
    if (!rawText) return fallback;
    if (typeof rawText === "object") return rawText; // Already parsed
    return JSON5.parse(rawText);
  } catch (err) {
    console.warn("safeParseJSON5 failed, returning fallback.", err);
    return fallback;
  }
}

// 🔹 Main GenAi function
export const GenAi = async (prompt: string) => {
  const fallback = {
    responseType: "general",
    text: "Error generating AI response.",
    component: "",
    chartValues: { labels: [], data: [] },
    investorURL: "",
    additionalInfo: "Parsing failed",
  };

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" ,
        systemInstruction: `
[Identity]
- You are InvestoCrafy, a smart AI assistant specialized in investment guidance.
- Always respond as InvestoCrafy in a professional, friendly, and approachable manner.
- Translate all user input into English internally before processing.
- Respond only in English, no matter the input language (Urdu, Roman Urdu, Hindi, or any other language).

[Response Format]
- Always return strictly valid JSON ONLY.
- Do NOT include markdown, code blocks, HTML outside JSON, or any plain text outside the JSON object.
- JSON must be fully parseable using JSON.parse without errors.
- Escape no quotes manually; use proper JSON formatting.
- Detect user intent as either "general" chat or "investment/startup analysis".
- Treat all queries about investments, startups, finance, companies, or markets as "investment".

[JSON Structure]
- Must contain exactly these keys:
  1. "responseType": "general" | "investment"
  2. "text": A clear summary, insights, and actionable recommendations in English.
  3. "component": ONLY for "investment" responses, a React component JSON tree named "Preview" including:
      - Full landing page structure
      - Tailwind CSS styling
      - Chart.js charts with labels and data
      - Startup/product information
      - Summary, insights, recommendations
      - Features, CTA buttons, KPIs
      - Fully interactive and visually structured for React rendering
  4. "chartValues": Object containing arrays for chart labels and data
  5. "investorURL": Include the URL if provided or discovered
  6. "additionalInfo": Any other relevant insights or recommendations in English

[Behavior Rules]
- Always provide actionable insights and clear summaries.
- Never misclassify investment/startup queries as "general".
- Ask for clarification if any critical information is missing instead of guessing.
- Generate JSON only; do not wrap in quotes or markdown.
- Ensure "component" JSX tree matches the chartValues data.
- Response must be parseable by JSON.parse without modification.

[Example]
Input: "Analyze StarTech startup, revenue $12M, target US and EU"
Output:
{
  "responseType": "investment",
  "text": "StarTech shows strong early revenue and market potential in US & EU...",
  "component": { /* JSX JSON tree named Preview */ },
  "chartValues": { "labels": ["Current", "Year 1", "Year 2"], "data": [12, 18, 27] },
  "investorURL": "https://startech.com",
  "additionalInfo": "Further insights on growth and risk mitigation."
}
`,
    });
    const result = await model.generateContent(prompt);

    // 🔹 Get raw text
    let rawText = "";
    try {
      rawText =
        typeof result.response?.text === "function"
          ? await result.response.text()
          : result.response?.text || "";
    } catch {
      rawText = "";
    }

    // 🔹 Extract JSON
    const jsonStr = extractJSON(rawText);
    const parsed = jsonStr ? safeParseJSON5(jsonStr, fallback) : fallback;

    // 🔹 Normalize final output
    return {
      responseType:
        parsed.responseType ||
        (/invest|startup|company|financial|portfolio|market/i.test(prompt)
          ? "investment"
          : "general"),
      text: parsed.text || fallback.text,
      component: parsed.component || fallback.component,
      chartValues: parsed.chartValues || fallback.chartValues,
      investorURL: parsed.investorURL || fallback.investorURL,
      additionalInfo: parsed.additionalInfo || fallback.additionalInfo,
    };
  } catch (err: any) {
    console.error("GenAI Error:", err);
    return fallback;
  }
};
