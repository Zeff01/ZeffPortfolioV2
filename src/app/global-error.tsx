"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="bg-blackBackground min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-900/20 rounded-full flex items-center justify-center">
              <span className="text-6xl">⚠️</span>
            </div>
            <h1 className="text-4xl font-bold text-yellow-300 mb-4">
              Critical Error
            </h1>
            <p className="text-gray-400 mb-8">
              Something went wrong at the application level. Please try again.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={reset}
              className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-6 py-3 bg-yellow-300 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
