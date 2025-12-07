"use client";

import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="py-28 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto text-center px-4">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-900">
          AI-Powered Investment & Startup Analysis
        </h2>

        <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
          InvestoCrafy helps you make smarter investment decisions using
          AI-driven startup analysis, product evaluation, and real-time insights.
        </p>

        <Button className="mt-8 text-lg px-10 py-6">
          Start Your Investment Journey
        </Button>
      </div>
    </section>
  );
}
