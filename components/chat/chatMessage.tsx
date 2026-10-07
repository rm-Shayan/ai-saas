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
  activeChatId?: string; // only show redux prompt/aiResponse if it belongs to this chat
}

export default function ChatMessages({ messages, activeChatId }: ChatMessagesProps) {
  const {prompt, aiResponse, loading: isThinking, chat: promptChat } = useSelector(
    (state: RootState) => state.prompt
  );

  // Latest prompt/response from redux is relevant only for the chat that produced it
  const promptBelongsToActiveChat =
    !activeChatId || !promptChat?._id || promptChat._id === activeChatId;

  const [messagesForUI, setMessagesForUI] = useState<IMessageForUI[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mergedMessages: IMessageForUI[] = [];
    const existingIds = new Set<string>();

    // ---------------- Parent messages ----------------
    if (messages?.length) {
      messages.forEach((m: any, index: number) => {
        if (m.prompt?.text?.trim()) {
          const id = m.prompt._id || `prompt_${index}`;
          mergedMessages.push({
            _id: id,
            content: m.prompt.text,
            type: "investor",
            timestamp: m.prompt.createdAt || new Date().toISOString(),
          });
          existingIds.add(id);
        }

        if (m.aiResponse?.text?.trim()) {
          const id = m.aiResponse._id || `ai_${index}`;
          mergedMessages.push({
            _id: id,
            content: m.aiResponse.text,
            type: "ai",
            additionalInfo: m.aiResponse.additionalInfo,
            timestamp: m.aiResponse.createdAt || new Date().toISOString(),
          });
          existingIds.add(id);
        }
      });
    }

    // ---------------- Redux latest prompt ----------------
    if (promptBelongsToActiveChat && prompt?.text.trim()) {
      const id = prompt._id || `prompt_${Date.now()}`;
      if (!existingIds.has(id)) {
        mergedMessages.push({
          _id: id,
          content: prompt.text,
          type: "investor",
          timestamp: prompt.createdAt || new Date().toISOString(),
        });
        existingIds.add(id);
      }
    }

    // ---------------- Redux latest AI response ----------------
    if (promptBelongsToActiveChat && aiResponse?.text?.trim()) {
      const id = aiResponse._id || `ai_${Date.now()}`;
      if (!existingIds.has(id)) {
        mergedMessages.push({
          _id: id,
          content: aiResponse.text,
          type: "ai",
          additionalInfo: aiResponse.additionalInfo,
          timestamp: aiResponse.createdAt || new Date().toISOString(),
        });
        existingIds.add(id);
      }
    }

    // ---------------- Default AI message ----------------
    const hasRealMessage = mergedMessages.some(
      (m) => m.content && m.content.trim().length > 0
    );

    if (!hasRealMessage) {
      setMessagesForUI([]);
    } else {
      setMessagesForUI(mergedMessages);
    }
  }, [messages, prompt, aiResponse, promptBelongsToActiveChat]);

  // ---------------- Auto-scroll ----------------
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesForUI, isThinking]);

  const suggestedPrompts = [
    "Analyze a startup for investment potential",
    "Do a quick due diligence checklist",
    "Find competitors for a product",
    "Calculate TAM/SAM/SOM for a market",
    "Identify key risks before investing",
    "Compare two startups side by side",
  ];

  const handleSuggestedPrompt = (prompt: string) => {
    // We'll trigger via parent? But ChatMessages is used in both pages
    // For now, just focus on UI - parent handles sending
    const event = new CustomEvent("suggestedPrompt", { detail: prompt });
    window.dispatchEvent(event);
  };

  return (
    <ScrollArea className="flex-1">
      <div ref={scrollRef} className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 md:px-8">
        {messagesForUI.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] text-center">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                InvestoCrafy
              </h2>
              <p className="mt-2 text-muted-foreground">
                Your AI Investment Due Diligence Assistant
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="group p-3 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground transition-all duration-200 text-left text-sm shadow-sm hover:shadow-md"
                >
                  <span className="text-card-foreground group-hover:text-accent-foreground">
                    {prompt}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              Ask me anything about startups, markets, or investments
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 md:gap-5">
            {messagesForUI.map((m) => {
              return (
                <MessageBubble
                  key={m._id}
                  text={m.content}
                  sender={m.type}
                  additionalInfo={m.additionalInfo}
                  timestamp={m.timestamp}
                />
              );
            })}
            {isThinking && (
              <div className="flex items-start gap-3">
                <div className="bg-card border border-border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
