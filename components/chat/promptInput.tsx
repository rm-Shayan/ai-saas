"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";


export default function PromptInput({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="p-4 border-t bg-white flex items-center gap-2">
      <input
        className="flex-1 border rounded-xl p-3 text-sm"
        placeholder="Type your prompt..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <Button
        onClick={() => {
          if (value.trim() === "") return;
          onSend(value);
          setValue("");
        }}
      >
        <Send className="h-4 w-4 mr-2" /> Send
      </Button>
    </div>
  );
}
