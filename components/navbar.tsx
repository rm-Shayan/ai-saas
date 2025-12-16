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
    <header className="w-full py-4 border-b backdrop-blur bg-white/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
      <Link href={process.env.NEXT_PUBLIC_PROD_URL || "http://localhost:3000/"}> <h1 className="text-2xl font-bold text-blue-600">InvestoCrafy</h1></Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#features" className="hover:text-blue-600 transition">Features</a>
          <a href="#how" className="hover:text-blue-600 transition">How It Works</a>
          <a href="#testimonials" className="hover:text-blue-600 transition">Testimonials</a>
        </nav>

        {/* Desktop CTA */}
        <Button className="hidden md:block">  <Link href={`${process.env.NEXT_PUBLIC_PROD_URL}/Chat` || "http://localhost:3000/Chat"}>Get Started</Link></Button>

        {/* Mobile Toggle Button */}
        {isMobile && (
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition"
            aria-label="Toggle Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        )}
      </div>

      {/* Mobile Menu */}
      {open && isMobile && (
        <div className="md:hidden px-4 pb-4 animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col gap-4 text-sm font-medium bg-white rounded-md shadow-md py-4">
            <a
              href="#features"
              className="hover:text-blue-600 transition"
              onClick={() => setOpen(false)}
            >
              Features
            </a>

            <a
              href="#how"
              className="hover:text-blue-600 transition"
              onClick={() => setOpen(false)}
            >
              How It Works
            </a>

            <a
              href="#testimonials"
              className="hover:text-blue-600 transition"
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
