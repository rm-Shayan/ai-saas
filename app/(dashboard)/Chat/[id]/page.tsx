"use client";

import { useEffect, useRef, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchChat, deleteChat, createChat, updateChatTitle } from "@/store/slices/chatSlice";
import ChatSidebar from "@/components/chat/chatsidebar";
import ChatHeader from "@/components/chat/chatHeader";
import ChatMessages from "@/components/chat/chatMessage";
import PromptInput from "@/components/chat/promptInput";
import Loading from "@/app/loading";
import { sendPrompt } from "@/store/slices/promptSlice";

// ---------------- CHAT TYPE ----------------
type Chat = {
  _id: string;
  title?: string;
  messages?: any[];
};

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { chats, loading: chatLoading } = useSelector(
    (state: RootState) => state.chat
  );

  // Track fetched chat IDs to prevent duplicate API calls
  const fetchedChatsRef = useRef<Set<string>>(new Set());

  // ---------------- INIT CHAT ----------------
  useEffect(() => {
    if (!id) return;

    // Already fetched
    if (fetchedChatsRef.current.has(id.toString())) return;

    const fetchCurrentChat = async () => {
      try {
        const chatsArr: Chat[] = Array.isArray(chats)
          ? chats
          : (Object.values(chats) as Chat[]);

        const exists = chatsArr.some((c) => c._id === id);
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
  const chatsArr: Chat[] = useMemo(
    () => (Array.isArray(chats) ? chats : Object.values(chats) as Chat[]),
    [chats]
  );

const currentChat: Chat | undefined = useMemo(() => {
  if (!id || chatsArr.length === 0) return undefined;
  return chatsArr.find((c: any) => c._id === id || c.chatId === id);
}, [id, chatsArr]);


  const currentChatTitle = currentChat?.title ?? "New Chat";
  const currentChatMessages = Array.isArray(currentChat?.messages)
    ? currentChat.messages
    : [];

    
    console.log("messages",currentChatMessages)
  // ---------------- HANDLERS ----------------
  const handlePrompt = async (prompt: string) => {
    if (prompt.trim()) await dispatch(sendPrompt({ prompt }));
  };

  const handleDeleteChat = async (chatId?: string, deleteAll?: boolean) => {
    try {
      await dispatch(
        deleteChat({ chatId, deleteAll: deleteAll ?? false })
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
  if (!chatId || !title) return; // safeguard if chatId or title is undefined

  try {
    const result = await dispatch(updateChatTitle({ chatId, title })).unwrap();
    console.log("Chat title updated successfully:", result);
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
        />
        <ChatMessages messages={currentChatMessages} />
        <PromptInput onSend={handlePrompt} />
      </div>
    </div>
  );
}
