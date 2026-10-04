"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { Clipboard, Check } from "lucide-react";

interface MessageBubbleProps {
  text?: string;
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
  const [copied, setCopied] = useState(false);

  if (!text.trim()) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className={cn(
        "group relative max-w-[95%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-[65%] rounded-2xl px-4 py-3 text-sm leading-relaxed break-words shadow-sm transition-all duration-200",
        sender === "investor"
          ? "bg-primary text-primary-foreground ml-auto rounded-br-md"
          : "bg-card text-card-foreground mr-auto border border-border rounded-bl-md"
      )}
    >
      {/* Message text */}
      <div className="whitespace-pre-wrap">{text}</div>

      {/* Optional AI info */}
      {additionalInfo?.trim() && (
        <div
          className={cn(
            "mt-2 text-xs opacity-70",
            sender === "investor" ? "text-primary-foreground" : "text-muted-foreground"
          )}
        >
          {additionalInfo}
        </div>
      )}

      {/* Actions + Timestamp */}
      <div
        className={cn(
          "mt-2 flex items-center justify-between",
          sender === "investor" && "justify-end"
        )}
      >
        {sender === "ai" && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Clipboard className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        )}
        {timestamp && !isNaN(Date.parse(timestamp)) && (
          <div
            className={cn(
              "text-[10px] opacity-60",
              sender === "investor" ? "text-primary-foreground" : "text-muted-foreground"
            )}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
      </div>
    </div>
  );
}