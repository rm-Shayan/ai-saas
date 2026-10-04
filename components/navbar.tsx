"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track screen width to auto-close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false); // Close mobile menu on md+ screens
        setIsMobile(false);
      } else {
        setIsMobile(true);
      }
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="w-full py-3.5 border-b border-border backdrop-blur supports-[backdrop-filter]:bg-background/80 bg-background/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* Logo */}
      <Link href={process.env.NEXT_PUBLIC_PROD_URL || "http://localhost:3000/"}>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">InvestoCrafy</h1>
      </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 lg:gap-8 text-sm font-medium">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
          <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
          <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
        </nav>

        {/* Desktop CTA */}
        <Button size="sm" className="hidden md:block text-sm">
          <Link href={`${process.env.NEXT_PUBLIC_PROD_URL}/Chat` || "http://localhost:3000/Chat"}>Get Started</Link>
        </Button>

        {/* Mobile Toggle Button */}
        {isMobile && (
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            aria-label="Toggle Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {open && isMobile && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-1 text-sm font-medium bg-card border border-border rounded-lg shadow-lg py-2 px-1">
            <a
              href="#features"
              className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              Features
            </a>

            <a
              href="#how"
              className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              How It Works
            </a>

            <a
              href="#testimonials"
              className="rounded-md px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              onClick={() => setOpen(false)}
            >
              Testimonials
            </a>

            <Button className="w-full mt-2">Get Started</Button>
          </nav>
        </div>
      )}
    </header>
  );
}
