// app/dashboard/loading.tsx

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white/50 dark:bg-black/30 backdrop-blur-sm">
      <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
    </div>
  );
}
