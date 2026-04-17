"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import julietFadedImage from "@/public/Juliet-faded.png";
import { supabase } from "@/lib/supabaseClient";
import { JULIET_INTRO } from "@/config/site";
import { Button, Text, LoadingSpinner } from "@/components/ui";
import { COLORS } from "@/lib/theme";

function OnboardingIntro() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validateAccess = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("is_complete")
        .eq("user_id", session.user.id)
        .limit(1);

      const profile = data?.[0];
      if (profile?.is_complete) {
        router.replace("/home");
        return;
      }

      const { data: member } = await supabase
        .from("membership")
        .select("id, status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!member || member.status !== "approved") {
        router.replace("/membership-access");
        return;
      }

      setChecking(false);
    };

    validateAccess();
  }, [router]);

  if (checking) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ background: COLORS.cream }}
      >
        <div className="flex flex-col items-center">
          <LoadingSpinner className="mb-3" />
          <Text className="text-sm" style={{ color: "rgba(38,45,37,0.72)" }}>
            Loading...
          </Text>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-8 sm:px-6"
      style={{ background: COLORS.cream }}
    >
      <section className="w-full max-w-[640px] rounded-md border border-[#D5D2CA] bg-[#F5F5F6] px-4 py-5 sm:px-8 sm:py-8 shadow-[0_6px_20px_rgba(40,48,38,0.08)]">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 text-[#262D25] hover:opacity-70 transition-opacity"
            aria-label="Go back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <Image src="/logo.png" alt="Romeo & Juliet" width={74} height={39} className="h-auto w-[79px]" priority />
        </div>

        <div className="mx-auto flex max-w-[420px] flex-col items-center text-center pb-6 sm:pb-10">
          <div className="h-[122px] w-[122px] overflow-hidden rounded-full border-[5px] border-[#55654C]">
            <Image
              src={julietFadedImage}
              alt="Juliet"
              width={122}
              height={122}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          <h1
            className="mt-5 text-[2.35rem] leading-none sm:text-[2.65rem]"
            style={{ color: "#2C312A", fontFamily: "var(--font-playfair), serif" }}
          >
            Hey, I&apos;m Juliet
          </h1>

          <p
            className="mt-3 text-sm leading-relaxed sm:text-[15px]"
            style={{ color: "rgba(38,45,37,0.62)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            {JULIET_INTRO.line2}
          </p>

          <p
            className="mt-6 text-sm leading-relaxed sm:text-[15px]"
            style={{ color: "rgba(38,45,37,0.62)", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Write your response.<br />
            You can come back to this conversation at any time.<br />
            This conversation is private
          </p>

          <Button
            onClick={() => router.push("/voice")}
            className="mt-7 inline-flex h-11 w-full max-w-[280px] items-center justify-center rounded-full text-center text-sm font-medium text-white normal-case tracking-normal"
            style={{ backgroundColor: "#55654C", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Continue
          </Button>
        </div>
      </section>
    </main>
  );
}

export default function OnboardingStep1Page() {
  return (
    <Suspense>
      <OnboardingIntro />
    </Suspense>
  );
}
