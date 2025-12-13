"use client";

import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-4">
      {/* Blue 404 */}
      <h1 className="text-[8rem] md:text-[12rem] font-extrabold mb-4 text-blue-600 dark:text-blue-500">
        404
      </h1>

      {/* Professional message */}
      <p className="text-2xl md:text-3xl font-semibold mb-2 text-black dark:text-gray-100 text-center">
        Oops! The page you are looking for doesn’t exist.
      </p>
      <p className="text-sm md:text-base mb-8 text-center text-gray-600 dark:text-gray-300">
        You may have mistyped the URL or the page has been moved.
      </p>

      {/* Go Home button */}
      <button
        onClick={() => router.push("/")}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg shadow-md transform transition-all duration-300 hover:scale-105"
      >
        Go to Home
      </button>
    </div>
  );
}
