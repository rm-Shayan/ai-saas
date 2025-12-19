"use client";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  text?: string; // 👈 optional
  sender: "investor" | "ai";
  additionalInfo?: string;
  timestamp?: string;
}

export default function MessageBubble({
  text = "",
  sender,
  additionalInfo,
  timestamp,
}: MessageBubbleProps) {
  // ❗ dev-only debug (remove in prod)
  // console.log("MessageBubble:", { sender, text, timestamp, additionalInfo });

  // 🚫 agar message empty hai to kuch render hi mat karo
  if (!text.trim()) return null;

  return (
    <div
      className={cn(
        "max-w-[80%] p-3 rounded-xl text-sm break-words shadow-sm",
        sender === "investor"
          ? "bg-blue-500 text-white ml-auto"
          : "bg-white text-gray-900 mr-auto"
      )}
    >
      {/* Message text */}
      <div className="whitespace-pre-wrap">{text}</div>

      {/* Optional AI info */}
      {additionalInfo?.trim() && (
        <div className="mt-1 text-xs text-gray-600">
          {additionalInfo}
        </div>
      )}

      {/* Timestamp */}
      {timestamp && !isNaN(Date.parse(timestamp)) && (
        <div className="mt-1 text-xs text-gray-400 text-right">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}
