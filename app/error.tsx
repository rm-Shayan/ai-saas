"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error("Caught by Error Boundary:", error);
  }, [error]);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4">
      {/* Heading */}
      <h1 className="text-6xl md:text-8xl font-extrabold text-blue-600 dark:text-blue-500 mb-4 animate-bounce">
        Oops!
      </h1>

      {/* Error message */}
      <p className="text-xl md:text-2xl mb-2 text-black dark:text-gray-100 font-semibold text-center">
        Something went wrong
      </p>

      <p className="text-sm md:text-base mb-8 text-center text-gray-600 dark:text-gray-300">
        {error.message}
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg shadow-lg transition transform hover:scale-105"
        >
          Try Again
        </button>

        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg shadow-lg transition transform hover:scale-105"
        >
          Go Home
        </button>
      </div>
    </div>
  );
}
