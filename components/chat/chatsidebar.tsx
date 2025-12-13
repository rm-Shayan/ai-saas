"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Menu, X, Trash2, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Loading from "@/app/loading";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchHistory } from "@/store/slices/historySlice";

interface ChatSidebarProps {
  currentChatTitle?: string;
  onDeleteChat?: (chatId?: string, deleteAll?: boolean) => void;
  onUpdate?: (chatId: string, title: string) => void; // callback to update title
}

export default function ChatSidebar({ currentChatTitle, onDeleteChat, onUpdate }: ChatSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);
  const [localChats, setLocalChats] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");

  const { history, loading } = useSelector((state: RootState) => state.history);
  const { chat: promptChat } = useSelector((state: RootState) => state.prompt);

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      dispatch(fetchHistory());
      hasFetched.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    if (!history) return;
    const chats = [...history.chats];
    if (promptChat && !chats.includes(promptChat._id)) {
      chats.unshift(promptChat._id);
    }
    setLocalChats(chats);
  }, [history, promptChat]);

  if (loading || !history) return <SidebarLoading />;

  const handleChatClick = (chatId: string) => {
    router.push(`/Chat/${chatId}`);
    setOpen(false);
  };

  const getChatTitle = (chatId: string) => {
    if (promptChat?._id === chatId && promptChat.title) return promptChat.title;
    if (pathname.includes(chatId) && currentChatTitle) return currentChatTitle;
    return chatId;
  };

  const handleUpdateTitle = (chatId: string) => {
    if (newTitle.trim() && onUpdate) onUpdate(chatId, newTitle.trim());
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close Sidebar" : "Open Sidebar"}
          className="transition-all duration-300"
        >
          {open ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
        </Button>
      </div>

      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/30 z-40 transition-opacity md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-50 top-0 left-0 h-screen bg-white shadow-lg flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          "w-64 sm:w-56 md:w-72 lg:w-80"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold truncate">InvestoCrafy</h2>
          <div className="flex items-center space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onDeleteChat?.(undefined, true)}
              title="Delete All Chats"
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="md:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5 text-gray-700" />
            </Button>
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 bg-gray-50">
          <div className="p-2 space-y-2">
            {localChats.map((chatId) => {
              const active = pathname.includes(chatId);
              const title = getChatTitle(chatId);
              const isEditing = editingId === chatId;

              return (
                <div
                  key={chatId}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2 py-1 transition-all duration-200",
                    active ? "bg-blue-500 text-white shadow-md" : "hover:bg-gray-200"
                  )}
                >
                  <div className="flex-1 flex items-center">
                    {isEditing ? (
                      <input
                        className="flex-1 p-1 text-sm rounded border border-gray-300 focus:outline-none focus:ring focus:ring-blue-300"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => handleUpdateTitle(chatId)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle(chatId)}
                        autoFocus
                      />
                    ) : (
                      <>
                        <span
                          className="flex-1 truncate cursor-pointer"
                          onClick={() => handleChatClick(chatId)}
                        >
                          {title}
                        </span>
                        <Edit2
                          className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                          onClick={() => {
                            setEditingId(chatId);
                            setNewTitle(title);
                          }}
                        />
                      </>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteChat?.(chatId)}
                    className="ml-2 text-red-500 hover:text-red-600"
                    title="Delete Chat"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}

function SidebarLoading() {
  return (
    <div className="w-64 sm:w-56 md:w-72 lg:w-80 h-screen flex items-center justify-center bg-gray-100 border-r">
      <Loading />
    </div>
  );
}
