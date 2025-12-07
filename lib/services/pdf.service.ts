"use server";

export async function extractTextFromPdfBase64(base64: string): Promise<string> {
  try {
    // dynamic import for CommonJS module
    const pdfParseModule = await import("pdf-parse");
    const pdfParse: (buffer: Buffer) => Promise<{ text: string }> =
      (pdfParseModule as any).default || pdfParseModule;

    const buffer = Buffer.from(base64, "base64");
    const data = await pdfParse(buffer);
    return data?.text?.trim() || "";
  } catch (err) {
    console.warn("PDF parse failed:", err);
    return "";
  }
}
