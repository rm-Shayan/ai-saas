"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChat,
  deleteChat,
  createChat,
  updateChatTitle,
  IChat,
  clearPreview,
} from "@/store/slices/chatSlice";
import ChatSidebar from "@/components/chat/chatsidebar";
import ChatHeader from "@/components/chat/chatHeader";
import ChatMessages from "@/components/chat/chatMessage";
import PromptInput from "@/components/chat/promptInput";
import Loading from "@/app/loading";
import { sendPrompt } from "@/store/slices/promptSlice";
import { AppDispatch, RootState } from "@/store/store";
import AiPage from "@/components/chat/Aipage";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { chats, loading: chatLoading, preview: chatPreview } = useSelector(
    (state: RootState) => state.chat
  );
 
  const { preview:promptPreview,aiResponse:promptAiResponse} = useSelector((state: RootState) => state.prompt);

  // Show preview if chat slice or prompt slice has a component
  const [showPreview, setShowPreview] = useState<boolean>(!!chatPreview || !!promptPreview);

  const fetchedChatsRef = useRef<Set<string>>(new Set());

  // ---------------- FETCH CURRENT CHAT ----------------
  useEffect(() => {
    if (!id || fetchedChatsRef.current.has(id.toString())) return;

    const fetchCurrentChat = async () => {
      try {
        const exists = chats.some((c) => c._id === id);
        if (!exists && typeof id === "string") {
          await dispatch(fetchChat({ chatId: id })).unwrap();
        }
        fetchedChatsRef.current.add(id.toString());
      } catch (err) {
        console.error("Failed to fetch chat:", err);
      }
    };

    fetchCurrentChat();
  }, [dispatch, id, chats]);

  // ---------------- CURRENT CHAT ----------------
  const chatsArr: IChat[] = useMemo(() => chats || [], [chats]);
  const currentChat: IChat | undefined = useMemo(() => {
    if (!id || chatsArr.length === 0) return undefined;
    return chatsArr.find((c) => c.chatId == id);
  }, [id, chatsArr]);



  const currentChatTitle = currentChat?.title ?? "New Chat";
  const currentChatMessages = currentChat?.messages ?? [];


  // ---------------- HANDLERS ----------------
  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim()) return;

    // Clear previous chat preview
    dispatch(clearPreview());

    // Send new prompt
    await dispatch(sendPrompt({ prompt }));

    // Show prompt preview
    setShowPreview(true);
  };

  const handleDeleteChat = async (chatId?: string, deleteAll?: boolean) => {
    try {
      await dispatch(deleteChat({ chatId, deleteAll })).unwrap();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await dispatch(createChat()).unwrap();
      router.replace(`/Chat/${newChat.chat._id}`);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const handleUpdateChatTitle = async (chatId?: string, title?: string) => {
    if (!chatId || !title) return;
    try {
      await dispatch(updateChatTitle({ chatId, title })).unwrap();
    } catch (err) {
      console.error("Failed to update chat title:", err);
    }
  };

  if (!id || chatLoading || !currentChat) return <Loading />;


  // ---------------- LATEST COMPONENT FOR PREVIEW ----------------
const latestMessageWithAi = [...currentChatMessages].reverse().find(m => m.aiResponse);

const latestAiResponse = latestMessageWithAi?.aiResponse ?? promptAiResponse;

const latestComponent = promptPreview || latestAiResponse?.component || chatPreview || null;

const latestChartValues = latestAiResponse?.chartValues || {};

  // ---------------- LATEST PROPS ----------------



  return (
    <div className="flex h-screen">
      <ChatSidebar
        currentChatTitle={currentChatTitle}
        onDeleteChat={handleDeleteChat}
        onUpdate={handleUpdateChatTitle}
      />
      <div className="flex flex-col flex-1 relative">
        <ChatHeader
          title={currentChatTitle}
          onCreateChat={handleCreateChat}
          onDeleteChat={handleDeleteChat}
          onPreviewToggle={() => setShowPreview((prev) => !prev)}
          preview={showPreview}
        />

        {/* AI Component Preview */}
   {showPreview && latestComponent && (
  <AiPage component={latestComponent} chartValues={latestChartValues} />
)}

        <ChatMessages messages={currentChatMessages} />
        <PromptInput onSend={handlePrompt} />
      </div>
    </div>
  );
}
