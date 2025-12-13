"use client";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  text: string;
  sender: "investor" | "ai";
  additionalInfo?: string;
  timestamp?: string;
}

export default function MessageBubble({
  text,
  sender,
  additionalInfo,
  timestamp,
}: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "max-w-[80%] p-3 rounded-xl text-sm break-words shadow-sm",
        sender === "investor"
          ? "bg-blue-500 text-white ml-auto" // 💙 Investor messages
          : "bg-white text-gray-900 mr-auto" // 🤖 AI messages white with dark text
      )}
    >
      <div>{text}</div>

      {additionalInfo && (
        <div className="mt-1 text-xs text-gray-700">{additionalInfo}</div>
      )}

      {timestamp && (
        <div className="mt-1 text-xs text-gray-500 text-right">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      )}
    </div>
  );
}
