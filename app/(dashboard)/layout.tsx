import { Providers } from "@/components/provider";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "@/components/Route/PrivateRoute";
import { createMetadata } from "@/Utils/generatemetadata";
import { Metadata } from "next";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "InvestoCrafy – AI Investment Advisor | Chat Pages",
    description:
      "InvestoCrafy is an AI-powered investment and startup advisor. Analyze, evaluate, and get insights before investing in startups or products.",
    url: "https://www.investocrafy.com",
  });
};


export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Providers>
        <Toaster position="top-right" />
        <PrivateRoute>{children}</PrivateRoute>
      </Providers>
    </div>
  );
}
