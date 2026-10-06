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
  const [searchTerm, setSearchTerm] = useState("");

  const { history, loading } = useSelector((state: RootState) => state.history);
  const { chat: promptChat } = useSelector((state: RootState) => state.prompt);

  const { authenticator } = useSelector((state: RootState) => state.auth);
  const hasFetched = useRef(false);
  useEffect(() => {
    const authId = authenticator?._id || (authenticator as any)?.id;
    if (!hasFetched.current && authId) {
      dispatch(fetchHistory());
      hasFetched.current = true;
    }
  }, [dispatch, authenticator?._id, (authenticator as any)?.id]);

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
          "fixed z-50 top-0 left-0 h-screen bg-background border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 shadow-xl md:shadow-none",
          open ? "translate-x-0" : "-translate-x-full",
          "w-60 sm:w-64 md:w-72 lg:w-80"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight truncate">InvestoCrafy</h2>
          <div className="flex items-center gap-1.5">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDeleteChat?.(undefined, true)}
              title="Delete All Chats"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="md:hidden h-9 w-9"
              onClick={() => setOpen(false)}
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border bg-background/60">
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 bg-muted/30">
          <div className="p-3 space-y-1.5">
            {localChats
              .filter((chatId) => {
                const title = getChatTitle(chatId).toLowerCase();
                return title.includes(searchTerm.toLowerCase());
              })
              .map((chatId) => {
                const active = pathname.includes(chatId);
                const title = getChatTitle(chatId);
                const isEditing = editingId === chatId;

                return (
                  <div
                    key={chatId}
                    className={cn(
                      "group flex items-center justify-between rounded-lg px-2.5 py-2 transition-all duration-200 ease-out",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                  <div className="flex-1 flex items-center min-w-0">
                    {isEditing ? (
                      <input
                        className={cn(
                          "flex-1 px-2 py-1 text-sm rounded-md border focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                          active
                            ? "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder-primary-foreground/60"
                            : "bg-background border-border"
                        )}
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onBlur={() => handleUpdateTitle(chatId)}
                        onKeyDown={(e) => e.key === "Enter" && handleUpdateTitle(chatId)}
                        autoFocus
                      />
                    ) : (
                      <>
                        <button
                          type="button"
                          className="flex-1 truncate text-left text-sm font-medium leading-tight"
                          onClick={() => handleChatClick(chatId)}
                        >
                          {title}
                        </button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className={cn(
                            "ml-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                            active
                              ? "text-primary-foreground hover:bg-primary-foreground/20"
                              : "text-muted-foreground hover:bg-muted"
                          )}
                          onClick={() => {
                            setEditingId(chatId);
                            setNewTitle(title);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onDeleteChat?.(chatId)}
                    className={cn(
                      "ml-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity",
                      active
                        ? "text-primary-foreground hover:bg-primary-foreground/20 hover:text-destructive-foreground"
                        : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    )}
                    title="Delete Chat"
                  >
                    <X className="w-3.5 h-3.5" />
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
    <div className="w-60 sm:w-64 md:w-72 lg:w-80 h-screen flex flex-col p-4 bg-muted/20 border-r border-border animate-pulse">
      <div className="h-6 w-32 bg-muted rounded mb-6" />
      <div className="space-y-3">
        <div className="h-9 bg-muted/60 rounded-lg" />
        <div className="h-9 bg-muted/60 rounded-lg" />
        <div className="h-9 bg-muted/60 rounded-lg" />
      </div>
    </div>
  );
}
