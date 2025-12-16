"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

import { createChat, deleteChat } from "@/store/slices/chatSlice";
import { sendPrompt } from "@/store/slices/promptSlice";

import ChatSidebar from "@/components/chat/chatsidebar";
import ChatHeader from "@/components/chat/chatHeader";
import ChatMessages from "@/components/chat/chatMessage";
import PromptInput from "@/components/chat/promptInput";
import { updateChatTitle } from "@/store/slices/chatSlice";
import Loading from "@/app/loading";

function ChatContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { chat, loading: promptLoading } = useSelector(
    (state: RootState) => state.prompt
  );

  const { chats, loading: chatLoading } = useSelector(
    (state: RootState) => state.chat
  );

  // ---------------- REDIRECT AFTER CHAT CREATE (PROMPT) ----------------
  useEffect(() => {
    if (chat?._id) {
      router.replace(`/Chat/${chat._id}`);
    }
  }, [chat, router]);

  // ---------------- HANDLERS ----------------
  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    try {
      const result = await dispatch(sendPrompt({ prompt })).unwrap();

      // result.data.chat ya chat._id ke basis pe redirect
      const chatId = result.data?.chat?._id || chat?._id;
      if (chatId) {
        router.replace(`/Chat/${chatId}`);
      }
    } catch (err) {
      console.error("Failed to send prompt:", err);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await dispatch(createChat()).unwrap();
      const chatId = newChat?.chat?._id;
      if (chatId) router.replace(`/Chat/${chatId}`);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const handleDeleteChat = async (chatId?: string, deleteAll?: boolean) => {
    try {
      await dispatch(deleteChat({ chatId, deleteAll })).unwrap();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

const handleUpdateChat = async (title: string, chatId?: string) => {
  if (!title.trim()) return; // Title required

  try {
    await dispatch(
      updateChatTitle({ chatId: chatId ?? undefined, title })
    ).unwrap();
  } catch (err) {
    console.error("Failed to update chat title:", err);
  }
};


  // ---------------- LOADING STATE ----------------

  return (
    <div className="flex h-screen">
      <ChatSidebar currentChatTitle="New Chat" onDeleteChat={handleDeleteChat} onUpdate={handleUpdateChat} />

      <div className="flex flex-col flex-1">
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
