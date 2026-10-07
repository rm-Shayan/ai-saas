import { Providers } from "@/components/provider";
import { Toaster } from "react-hot-toast";
import { createMetadata } from "@/Utils/generatemetadata";
import { Metadata } from "next";
import AuthRoute from "@/components/Route/AuthRoute";

interface ChatLayoutProps {
  children: React.ReactNode;
}

export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "InvestoCrafy – AI Investment Advisor | Authentication Pages",
    description:
      "InvestoCrafy is an AI-powered investment and startup advisor. Analyze, evaluate, and get insights before investing in startups or products.",
    url: "https://www.investocrafy.com",
  });
};


export default function  AuthLayout({ children }: ChatLayoutProps) {
  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Providers>
        <Toaster position="top-right" />
        <AuthRoute>{children}</AuthRoute>
      </Providers>
    </div>
  );
}
