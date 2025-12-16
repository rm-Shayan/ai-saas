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
  messages: any[]; // raw messages fetched from chat
}

export default function ChatMessages({ messages }: ChatMessagesProps) {
  const { message: promptMessage, aiResponse } = useSelector(
    (state: RootState) => state.prompt
  );

  const [messagesForUI, setMessagesForUI] = useState<IMessageForUI[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mergedMessages: IMessageForUI[] = [];
    const existingIds = new Set<string>();

    // Parent messages
    if (messages && messages.length) {
      messages.forEach((m, index) => {
        if (m.prompt) {
          const id = m.prompt._id || `prompt_${index}_${Date.now()}`;
          mergedMessages.push({
            _id: id,
            content: m.prompt.text || "",
            type: "investor",
            timestamp: m.prompt.createdAt || new Date().toISOString(),
          });
          existingIds.add(id);
        }
        if (m.aiResponse) {
          const id = m.aiResponse._id || `ai_${index}_${Date.now()}`;
          mergedMessages.push({
            _id: id,
            content: m.aiResponse.text || "",
            type: "ai",
            additionalInfo: m.aiResponse.additionalInfo,
            timestamp: m.aiResponse.createdAt || new Date().toISOString(),
          });
          existingIds.add(id);
        }
      });
    }

    // Redux latest prompt (add only if not in parent messages)
    if (promptMessage) {
      const id = promptMessage._id || `prompt_${Date.now()}`;
      if (!existingIds.has(id)) {
        mergedMessages.push({
          _id: id,
          content: promptMessage.prompt || "",
          type: "investor",
          timestamp: promptMessage.createdAt || new Date().toISOString(),
        });
        existingIds.add(id);
      }
    }

    // Redux latest AI response (add only if not in parent messages)
    if (aiResponse) {
      const id = aiResponse._id || `ai_${Date.now()}`;
      if (!existingIds.has(id)) {
        mergedMessages.push({
          _id: id,
          content: aiResponse.text || "",
          type: "ai",
          additionalInfo: aiResponse.additionalInfo,
          timestamp: aiResponse.createdAt || new Date().toISOString(),
        });
        existingIds.add(id);
      }
    }

    // Default AI message
    if (mergedMessages.length === 0) {
      mergedMessages.push({
        _id: "default_ai_msg",
        content:
          "Hello! I am your AI assistant. Type a prompt below to start the conversation.",
        type: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    setMessagesForUI(mergedMessages);
  }, [messages, promptMessage, aiResponse]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesForUI]);

  return (
    <ScrollArea className="flex-1 px-6 py-4">
      <div ref={scrollRef} className="flex flex-col gap-4">
        {messagesForUI.map((m) => (
          <MessageBubble
            key={m._id}
            text={m.content}
            sender={m.type}
            additionalInfo={m.additionalInfo}
            timestamp={m.timestamp}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
