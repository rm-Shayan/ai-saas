"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface PromptInputProps {
  onSend: (text: string) => void;
}

export default function PromptInput({ onSend }: PromptInputProps) {
  const [value, setValue] = useState("");

  // Always call hooks at top level
  const { loading } = useSelector((state: RootState) => state.prompt);

  const handleSend = (e?: FormEvent) => {
    if (e) e.preventDefault(); // Prevent page reload
    if (!value.trim() || loading) return; // Avoid sending empty or during loading
    onSend(value);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Avoid newline
      handleSend();
    }
  };

  return (
    <form
      className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sm:p-5"
      onSubmit={handleSend}
    >
      <div className="mx-auto w-full max-w-4xl flex items-end gap-2 sm:gap-3">
        <div className="relative flex-1">
          <textarea
            className="w-full min-h-[48px] max-h-[240px] border border-input bg-background rounded-xl px-4 py-3 text-sm resize-none shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-ring disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={loading ? "AI is thinking..." : "Type your message here..."}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 240) + "px";
            }}
            onKeyDown={handleKeyDown}
            onFocus={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 240) + "px";
            }}
            disabled={loading}
            rows={1}
            style={{ overflow: "auto" }}
          />
        </div>

        <Button
          type="submit"
          disabled={loading || !value.trim()}
          size="icon"
          className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}
