"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle, Trash } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  onCreateChat?: () => void; // function to create a new chat
  onDeleteChat?: () => void; // function to delete chat
}

export default function ChatHeader({ title, onCreateChat, onDeleteChat }: ChatHeaderProps) {
  return (
    <div className="w-full border-b p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 flex items-center justify-between bg-white">
      
      {/* Header Title */}
      <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-semibold 
                     pl-2 sm:pl-4 md:pl-6 lg:pl-8 xl:pl-12 truncate">
        InvestoCrafy
      </h1>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Create Chat Button */}
        <Button
          variant="outline"
          className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base lg:text-base"
          onClick={onCreateChat}
        >
          <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>

        {/* Delete Chat Button */}
        <Button
          variant="destructive"
          className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 text-xs sm:text-sm md:text-base lg:text-base"
          onClick={onDeleteChat}
        >
          <Trash className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5" />
          <span className="hidden sm:inline">Delete Chat</span>
        </Button>
      </div>
    </div>
  );
}
