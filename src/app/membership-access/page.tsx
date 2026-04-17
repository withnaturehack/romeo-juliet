"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImage from "@/public/logo.png";
import { supabase } from "@/lib/supabaseClient";
import {
  MEMBERSHIP,
  MEMBERSHIP_CODE_LENGTH,
  getMembershipReferralCode,
} from "@/config/site";
import { Button, PageContainer, Text } from "@/components/ui";
import { COLORS } from "@/lib/theme";

function isValidMembershipCode(input: string): boolean {
  return input.trim().toUpperCase() === getMembershipReferralCode();
}

export default function MembershipAccessPage() {
  const router = useRouter();
  const [chars, setChars] = useState<string[]>(Array(MEMBERSHIP_CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const checkSessionAndStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      const { data: member } = await supabase
        .from("membership")
        .select("id, status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (member) {
        if (member.status === "approved") {
          router.replace("/onboarding");
        } else {
          router.replace("/home");
        }
        return;
      }

      setChecking(false);
    };

    checkSessionAndStatus();
  }, [router]);

  const joinedCode = chars.join("");
  const canSubmit = joinedCode.length === MEMBERSHIP_CODE_LENGTH && !submitting;

  const updateChar = (index: number, rawValue: string) => {
    const next = rawValue.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (!next) {
      const copy = [...chars];
      copy[index] = "";
      setChars(copy);
      setError(null);
      return;
    }

    const copy = [...chars];
    copy[index] = next[0];
    setChars(copy);
    setError(null);

    if (index < MEMBERSHIP_CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !chars[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const text = event.clipboardData
      .getData("text")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .slice(0, MEMBERSHIP_CODE_LENGTH);

    if (!text) return;

    const nextChars = Array(MEMBERSHIP_CODE_LENGTH).fill("");
    for (let i = 0; i < text.length; i += 1) {
      nextChars[i] = text[i];
    }
    setChars(nextChars);
    setError(null);

    const focusIndex = Math.min(text.length, MEMBERSHIP_CODE_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const code = joinedCode.trim().toUpperCase();

    if (!isValidMembershipCode(code)) {
      setError(MEMBERSHIP.errorInvalidCode);
      return;
    }

    setSubmitting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Session expired. Please sign in again.");
      setSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase.from("membership").upsert(
      {
        user_id: session.user.id,
        status: "approved",
        referral_code_used: code,
      },
      { onConflict: "user_id" }
    );

    if (dbError) {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    // Ensure profile row exists so transcript saves never silently fail
    await supabase
      .from("profiles")
      .upsert({ user_id: session.user.id }, { onConflict: "user_id", ignoreDuplicates: true });

    router.replace("/onboarding");
  };

  if (checking) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Text>Loading...</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col items-center justify-center">
      <section
        className="w-full min-h-svh flex items-center justify-center px-4 sm:px-8 py-8"
        style={{ background: COLORS.cream }}
      >
        <div className="w-full max-w-110 sm:max-w-130 rounded-xl sm:rounded-2xl bg-white/80 shadow-[0_6px_24px_rgba(40,48,38,0.08)] border border-[#D9D6CD] px-6 sm:px-8 pt-7 sm:pt-8 pb-10 sm:pb-12">
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

            <Image src={logoImage} alt="Romeo & Juliet" className="h-auto w-12 sm:w-14" priority />
          </div>

          <div className="mt-12 sm:mt-14 flex flex-col items-center text-center">
            <Text
              as="h1"
              variant="serif"
              className="text-[2rem] sm:text-[2.5rem] leading-tight mb-8 sm:mb-10"
              style={{ color: "#262D25", fontFamily: "var(--font-playfair), serif" }}
            >
              {MEMBERSHIP.pageTitle}
            </Text>

            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              <label
                className="w-full max-w-75 text-left text-base mb-3"
                style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
              >
                {MEMBERSHIP.label}
              </label>

              <div className="w-full max-w-75 flex items-center justify-between gap-2 mb-5">
                {chars.map((char, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputsRef.current[index] = element;
                    }}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    maxLength={1}
                    value={char}
                    onChange={(event) => updateChar(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    className="h-11 w-11 sm:h-12 sm:w-12 rounded-md border border-[#D5D5D5] bg-white text-center text-lg uppercase text-[#2A2F2A] focus:outline-none focus:border-[#708262]"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                    aria-label={`Referral code character ${index + 1}`}
                  />
                ))}
              </div>

              {error && (
                <Text className="text-sm text-red-600 mb-3">{error}</Text>
              )}

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full max-w-75 h-11 sm:h-12 rounded-full flex items-center justify-center text-white font-medium disabled:opacity-60"
                style={{ backgroundColor: "#4E5F43", fontFamily: "var(--font-inter), sans-serif" }}
              >
                {submitting ? MEMBERSHIP.continueButtonLoading : MEMBERSHIP.continueButton}
              </Button>
            </form>

            <div className="mt-12 sm:mt-14 text-center">
              <p
                className="text-sm"
                style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
              >
                {MEMBERSHIP.noCode}
              </p>
              <p
                className="text-sm mb-3"
                style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
              >
                {MEMBERSHIP.noCodeHint}
              </p>
              <button
                type="button"
                onClick={() => router.push("/membership-access/apply")}
                className="h-8 px-6 rounded-full border border-[#BFC2B9] text-sm text-[#2A2F2A] hover:bg-[#F7F7F7] transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {MEMBERSHIP.applyButton}
              </button>
            </div>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
