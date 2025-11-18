"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-blackBackground flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center"
          >
            <span className="text-6xl">⚠️</span>
          </motion.div>
          <h1 className="text-4xl font-bold text-textColor mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-400 mb-8">
            {error.message || "An unexpected error occurred"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-buttonColor text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-yellow-300 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
          >
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && error.digest && (
          <p className="mt-6 text-xs text-gray-500">Error ID: {error.digest}</p>
        )}
      </motion.div>
    </div>
  );
}
