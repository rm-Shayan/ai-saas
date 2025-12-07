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


export function safeParseRedisChat(data: string | null): RedisChatObj | null {
  if (!data) return null;

  try {
    const parsed = JSON.parse(data);
    // minimal check
    if (parsed.chatId && Array.isArray(parsed.messages)) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.error("Redis parse failed:", err);
    return null;
  }
}