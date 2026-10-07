import { createMetadata } from "@/Utils/generatemetadata";
import { Metadata } from "next";

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
  return <>{children}</>;
}
