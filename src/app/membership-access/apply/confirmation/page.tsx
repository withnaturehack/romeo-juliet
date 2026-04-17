"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImage from "@/public/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { MEMBERSHIP } from "@/config/site";
import { Button, PageContainer, Text } from "@/components/ui";
import { COLORS } from "@/lib/theme";

export default function MembershipApplyConfirmationPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      setChecking(false);
    };

    checkSession();
  }, [router]);

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
          <div className="flex items-center justify-center">
            <Image src={logoImage} alt="Romeo & Juliet" className="h-auto w-12 sm:w-14" priority />
          </div>

          <div className="mt-12 sm:mt-14 flex flex-col items-center text-center">
            <Text
              as="h1"
              variant="serif"
              className="text-[2rem] sm:text-[2.5rem] leading-tight mb-5"
              style={{ color: "#262D25", fontFamily: "var(--font-playfair), serif" }}
            >
              {MEMBERSHIP.confirmationTitle}
            </Text>

            <p
              className="max-w-85 text-base sm:text-lg mb-9"
              style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
            >
              {MEMBERSHIP.confirmationMessage}
            </p>

            <Button
              type="button"
              onClick={() => router.replace("/")}
              className="w-full max-w-75 h-11 sm:h-12 rounded-full flex items-center justify-center text-white font-medium"
              style={{ backgroundColor: "#4E5F43", fontFamily: "var(--font-inter), sans-serif" }}
            >
              {MEMBERSHIP.confirmationContinue}
            </Button>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
