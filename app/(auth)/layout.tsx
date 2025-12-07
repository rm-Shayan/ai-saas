import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { createMetadata } from "@/Utils/generatemetadata";
import { Providers } from "@/components/provider";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Optionally, define dynamic metadata for all auth pages
export const generateMetadata = (): Metadata => {
  return createMetadata({
    title: "Authentication | InvestoCrafy",
    description:
      "Login or Signup to access AI-powered investment insights, startup analysis, and financial recommendations on InvestoCrafy.",
    url: "https://www.investocrafy.com/auth",
  });
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
                target: "https://www.investocrafy.com/search?q={search_term_string}",
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
        {children}</Providers>
      </body>
    </html>
  );
}
