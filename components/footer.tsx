"use client";

import { Facebook, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="flex flex-col items-start space-y-4">
          <h1 className="text-2xl font-bold text-blue-600">InvestoCrafy</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-sm">
            AI-powered investment & startup advisor. Analyze, evaluate, and get insights before investing.
          </p>

          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col space-y-2 md:justify-center">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Quick Links</h3>
          <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
            Features
          </a>
          <a href="#how" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
            How It Works
          </a>
          <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
            Testimonials
          </a>
          <a href="#contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition">
            Contact
          </a>
        </div>

        {/* Newsletter / CTA */}
        <div className="flex flex-col items-start space-y-4">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Subscribe for Updates</h3>
          <div className="flex w-full gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-600 outline-none"
            />
            <Button className="px-6">Subscribe</Button>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>
      </div>

      {/* Bottom Text */}
      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          © {new Date().getFullYear()} InvestoCrafy. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
