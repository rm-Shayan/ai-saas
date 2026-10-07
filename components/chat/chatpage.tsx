"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import { createChat, deleteChat } from "@/store/slices/chatSlice";
import { sendPrompt } from "@/store/slices/promptSlice";
import { fetchHistory, clearHistory, addChat } from "@/store/slices/historySlice";

import ChatSidebar from "@/components/chat/chatsidebar";
import ChatHeader from "@/components/chat/chatHeader";
import ChatMessages from "@/components/chat/chatMessage";
import PromptInput from "@/components/chat/promptInput";
import { updateChatTitle } from "@/store/slices/chatSlice";



function ChatContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { chat, loading: promptLoading } = useSelector(
    (state: RootState) => state.prompt
  );



  // ---------------- REDIRECT AFTER CHAT CREATE (PROMPT) ----------------
  useEffect(() => {
    if (chat?._id ) {
      router.replace(`/Chat/${chat._id}`);
    }
  }, [chat, router]);

  // ---------------- HANDLERS ----------------
  const { authenticator } = useSelector((state: RootState) => state.auth);

  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    try {
      const result = await dispatch(sendPrompt({ prompt })).unwrap();

      const chatId = result.data?.chat?._id || chat?._id;
      if (chatId) {
        dispatch(addChat(chatId));
        router.replace(`/Chat/${chatId}`);
      }
    } catch (err: any) {
      console.error("Failed to send prompt:", err);
      if (/401|unauthorized|access token missing/i.test(String(err?.message || err))) {
        router.replace("/login");
      }
    }
  };

  useEffect(() => {
    const handleSuggested = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) handlePrompt(custom.detail);
    };
    window.addEventListener("suggestedPrompt", handleSuggested);
    return () => window.removeEventListener("suggestedPrompt", handleSuggested);
  }, [chat, authenticator?._id, (authenticator as any)?.id]);

  const handleCreateChat = async () => {
    try {
      const newChat = await dispatch(createChat()).unwrap();
      const chatId = newChat?.chat?._id;
      if (chatId) {
        dispatch(addChat(chatId));
        router.replace(`/Chat/${chatId}`);
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };


  const handleDeleteChat = async (chatId?: string, deleteAll?: boolean) => {
    try {
      await dispatch(deleteChat({ chatId, deleteAll })).unwrap();
      if (deleteAll) {
        router.replace("/Chat");
      } else if (chatId && chat?._id === chatId) {
        router.replace("/Chat");
      }
      // Clear fetched flag so sidebar refetches fresh history
      if (authenticator?._id || (authenticator as any)?.id) {
        dispatch(clearHistory());
        dispatch(fetchHistory());
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

const handleUpdateChat = async (title: string, chatId?: string) => {
  if (!title.trim()) return;

  try {
    await dispatch(
      updateChatTitle({ chatId: chatId ?? undefined, title })
    ).unwrap();
  } catch (err) {
    console.error("Failed to update chat title:", err);
  }
};


  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar currentChatTitle="New Chat" onDeleteChat={handleDeleteChat} onUpdate={handleUpdateChat} />

      <div className="flex flex-col flex-1 min-w-0">
        <ChatHeader
          title="New Chat"
          onCreateChat={handleCreateChat}
          onDeleteChat={handleDeleteChat}
        />

        <ChatMessages messages={[]} />

        <PromptInput onSend={handlePrompt} />
      </div>
    </div>
  );
}

export default ChatContent;