import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 🔹 Robust JSON parser
function safeParseJSON(rawText: string, fallback: any = {}) {
  try {
    if (!rawText || typeof rawText !== "string") return fallback;

    // Extract first JSON block { ... } or [ ... ]
    const match = rawText.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match) return fallback;

    let jsonStr = match[0];

    // Remove trailing commas before } or ]
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, "$1");

    // Fix unquoted keys: key: value -> "key": value
    jsonStr = jsonStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

    // Replace single quotes around string values with double quotes
    jsonStr = jsonStr.replace(/:\s*'([^']*)'/g, ': "$1"');

    return JSON.parse(jsonStr);
  } catch (err) {
    console.warn("safeParseJSON failed, returning fallback.", err);
    return fallback;
  }
}

// 🔹 Main GenAi function
export const GenAi = async (prompt: string) => {
  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
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

    // Inside GenAi function, after the result is received
    let rawText = "";
    try {
      rawText =
        typeof result.response?.text === "function"
          ? result.response.text()
          : "";
      console.log("Raw AI Response:", rawText);
    } catch (err) {
      console.warn("Failed to get AI response text:", err);
      rawText = "";
    }

    // Parse the rawText using safeParseJSON
    const parsed = safeParseJSON(rawText, {
      responseType: /invest|startup|company|financial|portfolio|market/i.test(
        prompt
      )
        ? "investment"
        : "general",
      text: "Error generating AI response.",
      component: "",
      chartValues: { labels: [], data: [] },
      investorURL: "",
      additionalInfo: "Parsing failed",
    });

    const finalParsed = {
      responseType:
        parsed.responseType ||
        (/invest|startup|company|financial|portfolio|market/i.test(prompt)
          ? "investment"
          : "general"),
      text: parsed.text || "Error generating AI response.",
      component: parsed.component || "",
      chartValues: parsed.chartValues || { labels: [], data: [] },
      investorURL: parsed.investorURL || "",
      additionalInfo: parsed.additionalInfo || "Parsing failed",
    };

    return finalParsed;
  } catch (err: any) {
    console.error("GenAI Error:", err);
    return {
      responseType: /invest|startup|company|financial|portfolio|market/i.test(
        prompt
      )
        ? "investment"
        : "general",
      text: "Error generating AI response.",
      component: "",
      chartValues: { labels: [], data: [] },
      investorURL: "",
      additionalInfo: err.message,
    };
  }
};
