"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImage from "@/public/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { LANDING } from "@/config/site";
import { Button, Text, PageContainer } from "@/components/ui";
import { COLORS } from "@/lib/theme";

export default function StartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleGoogleLogin = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : LANDING.messageError,
      });
      setLoading(false);
    }
  };

  return (
    <PageContainer className="flex flex-col items-center justify-center">
      <section
        className="w-full min-h-[100svh] flex items-center justify-center px-4 sm:px-8 py-8"
        style={{ background: COLORS.cream }}
      >
        <div className="relative w-full max-w-[440px] sm:max-w-[520px] rounded-xl sm:rounded-2xl bg-white/80 backdrop-blur-[1px] shadow-[0_6px_24px_rgba(40,48,38,0.08)] border border-[#D9D6CD] px-6 sm:px-8 pt-7 sm:pt-8 pb-10 sm:pb-12">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="#262D25"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <Image
              src={logoImage}
              alt="Romeo & Juliet"
              className="h-auto w-12 sm:w-14"
              priority
            />
          </div>

          <div className="mt-16 sm:mt-20 flex flex-col items-center text-center">
            <Text
              as="h1"
              variant="serif"
              className="text-[2.35rem] sm:text-[3rem] leading-tight mb-2 sm:mb-3"
              style={{ color: "#262D25", fontFamily: "var(--font-playfair), serif" }}
            >
              Begin your journey
            </Text>

            <p
              className="text-base sm:text-lg mb-8 sm:mb-10"
              style={{ color: "rgba(38, 45, 37, 0.7)", fontFamily: "var(--font-inter), sans-serif" }}
            >
              A more thoughtful way to meet someone.
            </p>

            {message && (
              <Text
                className={`text-sm text-center mb-6 ${
                  message.type === "error" ? "text-red-700" : "text-[#2F3A2F]/80"
                }`}
              >
                {message.text}
              </Text>
            )}

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full max-w-[300px] h-11 sm:h-12 rounded-full flex items-center justify-center gap-3 border border-[#D5D5D5] hover:border-[#BEBEBE] transition-colors disabled:opacity-70"
              style={{
                backgroundColor: "white",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-gray-700 font-medium">
                {loading ? "Connecting..." : "Continue with Google"}
              </span>
            </Button>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
