"use client";

import { useEffect, useRef, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChat,
  deleteChat,
  createChat,
  updateChatTitle,
} from "@/store/slices/chatSlice";
import ChatSidebar from "@/components/chat/chatsidebar";
import ChatHeader from "@/components/chat/chatHeader";
import ChatMessages from "@/components/chat/chatMessage";
import PromptInput from "@/components/chat/promptInput";
import Loading from "@/app/loading";
import { sendPrompt } from "@/store/slices/promptSlice";
import { AppDispatch, RootState } from "@/store/store";
import AiPage from "@/components/chat/rendercomponent";
import { IChat } from "@/store/slices/chatSlice";



export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { chats, loading: chatLoading } = useSelector(
    (state: RootState) => state.chat
  );

  const { aiResponse } = useSelector((state: RootState) => state.prompt);

  const [preview, setPreview] = useState(false);

  // Track fetched chat IDs to prevent duplicate API calls
  const fetchedChatsRef = useRef<Set<string>>(new Set());

  // ---------------- INIT CHAT ----------------
  useEffect(() => {
    if (!id || fetchedChatsRef.current.has(id.toString())) return;

    const fetchCurrentChat = async () => {
      try {
        const exists = Array.isArray(chats)
          ? chats.some((c) => c._id === id)
          : Object.values(chats).some((c: any) => c._id === id);

        if (!exists && typeof id == "string") {
          await dispatch(fetchChat({ chatId: id })).unwrap();
        }
        fetchedChatsRef.current.add(id.toString());
      } catch (err) {
        console.error("Failed to fetch chat:", err);
      }
    };

    fetchCurrentChat();
  }, [dispatch, id]);

  // ---------------- CURRENT CHAT ----------------

const chatsArr: IChat[] = useMemo(() => {
  return Array.isArray(chats) ? chats : Object.values(chats) as IChat[];
}, [chats]);

const currentChat: IChat | undefined = useMemo(() => {
  if (!id || chatsArr.length === 0) return undefined;

  // find by _id

  return chatsArr.find((c) => {
console.log("id",c?.chatId.toString())
    return  c.chatId == id
  }
   );
}, [id, chatsArr]);



console.log("Current chat:", currentChat);


  const currentChatTitle = currentChat?.title ?? "New Chat";
  const currentChatMessages = Array.isArray(currentChat?.messages)
    ? currentChat.messages
    : [];

  // ---------------- HANDLERS ----------------
  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim()) return;
    await dispatch(sendPrompt({ prompt }));
  };

  const handleDeleteChat = async (chatId?: string, deleteAll?: boolean) => {
    try {
      await dispatch(
        deleteChat({ chatId: chatId ?? undefined, deleteAll: deleteAll ?? false })
      ).unwrap();
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

  // ---------------- RENDER LOADING ----------------
  if (!id || chatLoading || !currentChat) return <Loading />;

  return (
    <div className="flex h-screen">
      <ChatSidebar
        currentChatTitle={currentChatTitle}
        onDeleteChat={handleDeleteChat}
        onUpdate={handleUpdateChatTitle}
      />
      <div className="flex flex-col flex-1">
        <ChatHeader
          title={currentChatTitle}
          onCreateChat={handleCreateChat}
          onDeleteChat={handleDeleteChat}
          // Button click toggles preview
          onPreviewToggle={() => setPreview((prev) => !prev)}
        />

        {/* AI Component Preview */}
        {preview && aiResponse?.component && (
          <div className="p-4 border mb-4 bg-gray-50 rounded">
         < AiPage/>
          </div>
        )}

        <ChatMessages messages={currentChatMessages} />
        <PromptInput onSend={handlePrompt} />
      </div>
    </div>
  );
}
