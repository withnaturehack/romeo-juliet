"use client";

import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong. Please try again.",
  onRetry,
}: ErrorStateProps) {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <AlertCircle className="mb-4 text-red-500" size={48} />
      <p className="text-lg font-medium text-gray-800 mb-2">Oops</p>
      <p className="text-gray-500 text-sm max-w-xs mb-6">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-full bg-[#4A5E41] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Try again
          </button>
        )}
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 rounded-full border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Go home
        </button>
      </div>
    </div>
  );
}
