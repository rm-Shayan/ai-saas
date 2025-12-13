"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import MessageBubble from "./messageBubble";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useEffect, useState, useRef } from "react";

// ---------------- MESSAGE TYPE ----------------
interface IMessageForUI {
  _id: string;
  content: string;
  type: "investor" | "ai";
  additionalInfo?: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: any[]; // raw messages fetched from chat, could be nested
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const { message: promptMessage, aiResponse } = useSelector(
    (state: RootState) => state.prompt
  );

  const [messagesForUI, setMessagesForUI] = useState<IMessageForUI[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mergedMessages: IMessageForUI[] = [];

    if (messages && messages.length) {
      messages.forEach((m, index) => {
        // Destructure prompt and AI response from each chat object
        if (m.prompt) {
          mergedMessages.push({
            _id: m.prompt._id || `prompt_${index}_${Date.now()}`,
            content: m.prompt.text || "",
            type: "investor",
            timestamp: m.prompt.createdAt || new Date().toISOString(),
          });
        }

        if (m.aiResponse) {
          mergedMessages.push({
            _id: m.aiResponse._id || `ai_${index}_${Date.now()}`,
            content: m.aiResponse.text || "",
            type: "ai",
            additionalInfo: m.aiResponse.additionalInfo,
            timestamp: m.aiResponse.createdAt || new Date().toISOString(),
          });
        }
      });
    }

    // Append latest Redux prompt (optional)
    if (promptMessage) {
      mergedMessages.push({
        _id: promptMessage._id || `prompt_${Date.now()}`,
        content: promptMessage.prompt || promptMessage._id || "",
        type: "investor",
        timestamp: promptMessage.createdAt || new Date().toISOString(),
      });
    }

    // Append latest Redux AI response (optional)
    if (aiResponse) {
      mergedMessages.push({
        _id: aiResponse._id || `ai_${Date.now()}`,
        content: aiResponse.text || "",
        type: "ai",
        additionalInfo: aiResponse.additionalInfo,
        timestamp: aiResponse.createdAt || new Date().toISOString(),
      });
    }

    setMessagesForUI(mergedMessages);
  }, [messages, promptMessage, aiResponse]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesForUI]);

  return (
    <ScrollArea className="flex-1 px-6 py-4">
      <div ref={scrollRef} className="flex flex-col gap-4">
        {messagesForUI.length === 0 ? (
          <p className="text-gray-500 text-sm">No messages yet</p>
        ) : (
          messagesForUI.map((m) => (
            <MessageBubble
              key={m._id}
              text={m.content}
              sender={m.type}
              additionalInfo={m.additionalInfo}
              timestamp={m.timestamp}
            />
          ))
        )}
      </div>
    </ScrollArea>
  );
}
