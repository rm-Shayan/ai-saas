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
import { fetchHistory, clearHistory, addChat } from "@/store/slices/historySlice";
import { getUser, refreshToken } from "@/store/slices/authSlice";
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

  // Preview opens only on explicit user toggle — do not auto-open on chat load
  const [showPreview, setShowPreview] = useState<boolean>(false);

  const fetchedChatsRef = useRef<Set<string>>(new Set());

  const { authenticator } = useSelector((state: RootState) => state.auth);
  // ---------------- FETCH CURRENT CHAT ----------------
  useEffect(() => {
    const currentUserId = authenticator?._id || (authenticator as any)?.id;
    if (!id || !currentUserId || fetchedChatsRef.current.has(id.toString())) return;

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
  }, [dispatch, id, authenticator?._id, (authenticator as any)?.id]);

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

    if (!authenticator?._id) {
      // Session may still be resolving — verify once before bouncing to login
      try {
        await dispatch(getUser()).unwrap();
      } catch {
        try {
          await dispatch(refreshToken()).unwrap();
          await dispatch(getUser()).unwrap();
        } catch {
          router.replace("/login");
          return;
        }
      }
    }

    // Clear previous chat preview
    dispatch(clearPreview());

    // Send new prompt (attach to the currently open chat)
    try {
      await dispatch(
        sendPrompt({ prompt, chatId: typeof id === "string" ? id : undefined })
      ).unwrap();
    } catch (err: any) {
      if (/401|unauthorized|access token missing/i.test(String(err))) {
        router.replace("/login");
        return;
      }
      return;
    }

    // Show prompt preview
    setShowPreview(true);
  };

  useEffect(() => {
    const handleSuggested = (e: Event) => {
      const custom = e as CustomEvent<string>;
      if (custom.detail) handlePrompt(custom.detail);
    };
    window.addEventListener("suggestedPrompt", handleSuggested);
    return () => window.removeEventListener("suggestedPrompt", handleSuggested);
  }, [authenticator?._id]);

  const handleDeleteChat = async (chatId?: string, deleteAll?: boolean) => {
    try {
      await dispatch(deleteChat({ chatId, deleteAll })).unwrap();
      if (deleteAll) {
        router.replace("/Chat");
      } else if (chatId && id === chatId) {
        router.replace("/Chat");
      }
      // Clear fetched flag so sidebar refetches fresh history
      if (authenticator?._id) {
        dispatch(clearHistory());
        dispatch(fetchHistory());
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await dispatch(createChat()).unwrap();
      dispatch(addChat(newChat.chat._id));
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

  if (!id || (chatLoading && !currentChat)) return <Loading />;


  // ---------------- LATEST COMPONENT FOR PREVIEW ----------------
const latestMessageWithAi = [...currentChatMessages].reverse().find(m => m.aiResponse);

const latestAiResponse = latestMessageWithAi?.aiResponse ?? promptAiResponse;

const latestComponent = promptPreview || latestAiResponse?.component || chatPreview || null;

const latestChartValues = latestAiResponse?.chartValues || {};

  // ---------------- LATEST PROPS ----------------



  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        currentChatTitle={currentChatTitle}
        onDeleteChat={handleDeleteChat}
        onUpdate={handleUpdateChatTitle}
      />
      <div className="flex flex-col flex-1 min-w-0 relative">
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

        <ChatMessages messages={currentChatMessages} activeChatId={typeof id === "string" ? id : undefined} />
        <PromptInput onSend={handlePrompt} />
      </div>
    </div>
  );
}
