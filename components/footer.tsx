"use client";

import { Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email.trim()) {
      toast.error("Please enter a valid email!");
      return;
    }
    // Ideally, send email to backend here
    toast.success(`Subscribed successfully with ${email}!`);
    setEmail(""); // Clear input after subscription
  };

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col items-start space-y-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">InvestoCrafy</h1>
          <p className="text-muted-foreground max-w-sm leading-relaxed">
            AI-powered investment & startup advisor. Analyze, evaluate, and get insights before investing.
          </p>

          <div className="flex space-x-4">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-2 md:justify-center">
          <h3 className="font-semibold text-foreground">Quick Links</h3>
          <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#how" className="text-muted-foreground hover:text-primary transition-colors">
            How It Works
          </a>
          <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">
            Testimonials
          </a>
          <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </div>

        {/* Newsletter / CTA */}
        <div className="flex flex-col items-start space-y-4">
          <h3 className="font-semibold text-foreground">Subscribe for Updates</h3>
          <div className="flex w-full gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="flex-1 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <Button size="sm" onClick={handleSubscribe}>
              Subscribe
            </Button>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="mt-12 border-t border-border pt-6 text-center">
        <p className="text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} InvestoCrafy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
