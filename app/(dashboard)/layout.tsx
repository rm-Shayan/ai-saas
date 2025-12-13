"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/provider";
import { Toaster } from "react-hot-toast";
import PrivateRoute from "@/components/Route/PrivateRoute";

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

export default function ChatLayout({ children }: ChatLayoutProps) {
  return (
   <html lang="en">
      <head>
        {/* Structured Data JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
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
            }),
          }}
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900`}
      >
        <Providers>
          <Toaster position="top-right" />
          <PrivateRoute> 
            {children}
            </PrivateRoute>
        </Providers>
      </body>
    </html>
  );
}
