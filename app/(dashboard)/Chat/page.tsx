"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchChat, deleteChat } from "@/store/slices/chatSlice";
import ChatSidebar from "@/components/chat/chatsidebar";
import ChatHeader from "@/components/chat/chatHeader";
import ChatMessages from "@/components/chat/chatMessage";
import PromptInput from "@/components/chat/promptInput";
import Loading from "@/app/loading";
import { sendPrompt } from "@/store/slices/promptSlice";
import { createChat } from "@/store/slices/chatSlice";

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const initializedRef = useRef(false);

  const { chats, loading: chatLoading } = useSelector(
    (state: RootState) => state.chat
  );

  // ---------------- INIT CHAT ----------------
  useEffect(() => {
    const initChat = async () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      try {
        if (!id) {
          // URL has NO chatId → fetch all chats and redirect to first
          const chatsObj = await dispatch(fetchChat()).unwrap();
          let chatsArr: string[] = [];

          if (Array.isArray(chatsObj)) {
            chatsArr = chatsObj.map((c: any) => c._id);
          } else if (typeof chatsObj === "object" && chatsObj !== null) {
            chatsArr = Object.values(chatsObj).map((c: any) => c._id || c);
          }

          const firstChatId = chatsArr[0];
          if (firstChatId) {
            router.replace(`/Chat/${firstChatId}`);
          }
        }
        // if id exists, fetching will be handled by next useEffect below
      } catch (err) {
        console.error("Chat init failed:", err);
      }
    };

    initChat();
  }, [dispatch, id, router]);

  // ---------------- FETCH CURRENT CHAT ON ID CHANGE ----------------
  useEffect(() => {
    if (!id) return;
    const exists = chats.some((c) => c._id?.toString() === id.toString());
    if (!exists) {
      dispatch(fetchChat({ chatId: id.toString() }));
    }
  }, [id, chats, dispatch]);

  // ---------------- CURRENT CHAT ----------------
  const currentChat = chats.find((c) => c._id?.toString() === id?.toString());

  console.log("current chat",currentChat)
  const currentChatTitle = currentChat?.title || "New Chat";

  // ---------------- HANDLERS ----------------
  const handlePrompt = async (prompt: string) => {
    if (prompt.trim()) {
      await dispatch(sendPrompt({ prompt }));
    }
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
      // redirect to the newly created chat
      router.replace(`/Chat/${newChat.chat._id}`);
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  if (chatLoading) return <Loading />;

  return (
    <div className="flex h-screen">
      <ChatSidebar currentChatTitle={currentChatTitle} onDeleteChat={handleDeleteChat} />
      <div className="flex flex-col flex-1">
        <ChatHeader title={currentChatTitle} onCreateChat={handleCreateChat} onDeleteChat={handleDeleteChat} />
        <ChatMessages messages={currentChat?.messages || []} />
        <PromptInput onSend={handlePrompt} />
      </div>
    </div>
  );
}
