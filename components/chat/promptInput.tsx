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
      className="p-4 border-t bg-white flex items-center gap-2"
      onSubmit={handleSend}
    >
      <textarea
        className="flex-1 border rounded-xl p-3 text-sm resize-none h-12 focus:outline-none"
        placeholder={loading ? "Waiting for AI response..." : "Type your prompt..."}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />

      <Button
        type="submit"
        disabled={loading || !value.trim()}
        className="flex items-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin inline-block" />
            Loading...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send
          </>
        )}
      </Button>
    </form>
  );
}
