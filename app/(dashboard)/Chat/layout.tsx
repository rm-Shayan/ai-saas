import { Providers } from "@/components/provider";
import { Toaster } from "react-hot-toast";
import { createMetadata } from "@/Utils/generatemetadata";
import { Metadata } from "next";
import Script from "next/script";
import "../../globals.css";

export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "InvestoCrafy – AI Investment Advisor | Chat",
    description:
      "InvestoCrafy is an AI-powered investment and startup advisor. Analyze, evaluate, and get insights before investing in startups or products.",
    url: "https://www.investocrafy.com",
  });
};

export default function ChatSoftLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="antialiased bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Script id="structured-data-chat" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "InvestoCrafy",
          url: "https://www.investocrafy.com",
        })}
      </Script>
      <Providers>
        <Toaster position="top-right" />
        {children}
      </Providers>
    </div>
  );
}
