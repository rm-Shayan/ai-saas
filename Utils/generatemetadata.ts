import type { Metadata } from "next";

interface GenerateMetadataProps {
  title: string;
  description: string;
  url: string;
}

export function createMetadata({ title, description, url }: GenerateMetadataProps): Metadata {
  return {
    title,
    description,
    keywords: [
      "InvestoCrafy",
      "AI Investment Advisor",
      "Startup Analysis",
      "Investment Insights",
    ],
    authors: [{ name: "Rao Muhammad Shayan" }],
    robots: "index, follow",
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "InvestoCrafy",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "InvestoCrafy AI Advisor",
        },
      ],
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
      creator: "@rmShayan",
    },
    metadataBase: new URL("https://www.investocrafy.com"),
  };
}
