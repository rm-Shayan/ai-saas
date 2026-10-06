"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Trash, Settings, LogOut, Eye } from "lucide-react";
import { RootState } from "@/store/store";
import { useSelector, useDispatch } from "react-redux";
import Loading from "@/app/loading";
import { logout } from "@/store/slices/authSlice";
import Link from "next/link";

interface ChatHeaderProps {
  title: string;
  onCreateChat?: () => void;
  onDeleteChat?: () => void;
  onPreviewToggle?: () => void;
  preview?: boolean;
}

export default function ChatHeader({
  title,
  onCreateChat,
  onDeleteChat,
  onPreviewToggle,
  preview = false,
}: ChatHeaderProps) {
  const dispatch = useDispatch();
  const { authenticator } = useSelector(
    (state: RootState) => state.auth
  );

  const userName = authenticator?.name || authenticator?.email || "User";
  const avatarFallback = userName.charAt(0).toUpperCase();

  return (
    <div className="w-full border-b border-border px-3 py-2 sm:px-5 sm:py-3 flex flex-wrap items-center justify-between gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 shadow-sm">
      {/* Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-semibold truncate">
          <Link
            href={process.env.NEXT_PUBLIC_PROD_URL || "http://localhost:3000/"}
            className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            InvestoCrafy
          </Link>
        </h1>
        {title && title !== "New Chat" && (
          <span className="hidden md:inline text-sm text-muted-foreground truncate max-w-[160px]">
            / {title}
          </span>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 flex-wrap justify-end sm:justify-start sm:gap-2 ml-auto">
        {/* Preview Toggle */}
        <Button
          variant={preview ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-1.5 h-9 px-2 sm:px-3"
          onClick={onPreviewToggle}
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Preview</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-9 px-2 sm:px-3"
          onClick={() => {
            if (typeof window !== "undefined") {
              document.documentElement.classList.toggle("dark");
              localStorage.setItem(
                "theme",
                document.documentElement.classList.contains("dark") ? "dark" : "light"
              );
            }
          }}
        >
          <span className="text-xs">Theme</span>
        </Button>

        {/* Create Chat */}
        <Button
          variant="outline"
          size="sm"
          onClick={onCreateChat}
          className="flex items-center gap-1.5 h-9 px-2 sm:px-3"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">New Chat</span>
        </Button>

        {/* Delete Chat */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeleteChat}
          className="flex items-center gap-1.5 h-9 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Delete</span>
        </Button>

        {/* Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="outline-none">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 cursor-pointer">
                <AvatarImage src={authenticator?.avatar?.url} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem className="gap-2">
              <Settings className="h-4 w-4" />
         <Link href={`${process.env.NEXT_PUBLIC_PROD_URL}/settings` || "http://localhost:3000/settings"}> Settings</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="gap-2 text-red-600 focus:text-red-600"
              onClick={() => dispatch(logout())}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
