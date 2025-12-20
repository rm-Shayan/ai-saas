
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/provider";
import { Toaster } from "react-hot-toast";
import { createMetadata } from "@/Utils/generatemetadata";
import { Metadata } from "next";
import Script from "next/script";
import AuthRoute from "@/components/Route/AuthRoute";
import  "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 min-h-screen`}
    >
      {/* Structured Data JSON-LD */}
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "InvestoCrafy",
          url: "https://www.investocrafy.com",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://www.investocrafy.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        })}
      </Script>

      <Providers>
        <Toaster position="top-right" />
        <AuthRoute>{children}</AuthRoute>
      </Providers>
    </div>
  );
}
