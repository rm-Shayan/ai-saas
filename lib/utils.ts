import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { RedisChatObj } from "./services/chat.service";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function safeJsonParse<T>(raw: unknown): T | null {
  if (!raw) return null;

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  // If it's already an object (Redis may return object), cast it
  if (typeof raw === "object") {
    return raw as T;
  }

  return null;
}


// 🔹 Fully safe Redis JSON parse
export function safeParseRedisChat(raw: string | null): RedisChatObj | null {
  if (!raw || raw.trim() === "") return null; // empty or null
  try {
    const parsed = JSON.parse(raw);
    // minimal validation
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.chatId &&
      Array.isArray(parsed.messages)
    ) {
      return parsed as RedisChatObj;
    }
    console.warn("⚠️ Redis data invalid, ignoring:", parsed);
    return null;
  } catch (err) {
    console.error("❌ Redis parse failed, ignoring value:", err, raw);
    return null;
  }
}
