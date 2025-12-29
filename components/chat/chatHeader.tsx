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
  const { authenticator, loading } = useSelector(
    (state: RootState) => state.auth
  );

  if (loading) return <Loading />;

  const userName = authenticator?.name || authenticator?.email || "User";
  const avatarFallback = userName.charAt(0).toUpperCase();

  return (
    <div className="w-full border-b p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex items-center justify-between bg-white">
      {/* Title */}
      <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold truncate
                     sm:pr-16 md:pr-20
                     sm:ml-8 md:ml-8 lg:ml-0">
        <Link
          href={process.env.NEXT_PUBLIC_PROD_URL || "http://localhost:3000/"}
          className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-black"
        >
          InvestoCrafy
        </Link>
      </h1>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
        {/* Preview Toggle */}
        <Button
          variant={preview ? "default" : "secondary"}
          className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm lg:text-base"
          onClick={onPreviewToggle}
        >
          <Eye className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        {/* Create Chat */}
        <Button
          variant="outline"
          onClick={onCreateChat}
          className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm lg:text-base"
        >
          <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>

        {/* Delete Chat */}
        <Button
          variant="destructive"
          onClick={onDeleteChat}
          className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm lg:text-base"
        >
          <Trash className="h-3 w-3 sm:h-4 sm:w-4 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Delete</span>
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
