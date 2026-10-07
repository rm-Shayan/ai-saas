"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-gradient-to-b from-background via-background to-muted/30">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_50%)]" />
      <div className="max-w-6xl mx-auto text-center px-4">
        <div className="inline-flex items-center rounded-full border border-border bg-background/80 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm mb-6">
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          AI-Powered Investment Intelligence
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          AI-Powered Investment & Startup Analysis
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          InvestoCrafy helps you make smarter investment decisions using
          AI-driven startup analysis, product evaluation, and real-time insights.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="px-8 py-6 text-base shadow-sm hover:shadow-md transition-shadow">
            <Link href="/Chat">
              Start Your Investment Journey
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="px-8 py-6 text-base">
            <Link href="#features">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
