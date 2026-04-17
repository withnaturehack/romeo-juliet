"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AUTH } from "@/config/site";
import { Button, Text, LoadingSpinner } from "@/components/ui";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Auth callback error:", error.message);
          setStatus("error");
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      const { data: membership } = await supabase
        .from("membership")
        .select("status")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!membership) {
        router.replace("/membership-access");
        return;
      }

      if (membership.status === "approved") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("conversation_transcript, onboarding_step")
          .eq("user_id", session.user.id)
          .maybeSingle();

        const hasCompletedVoice =
          Array.isArray(profile?.conversation_transcript) &&
          profile.conversation_transcript.length > 0;

        if (hasCompletedVoice) {
          router.replace("/home");
        } else if (profile?.onboarding_step && profile.onboarding_step >= 2) {
          router.replace("/onboarding/step-2");
        } else {
          router.replace("/onboarding");
        }
      } else {
        router.replace("/home");
      }
    };

    handleCallback();
  }, [router, searchParams]);

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#fafafa]">
        <Text className="text-red-600 mb-4">{AUTH.signInFailed}</Text>
        <Button variant="ghost" onClick={() => router.replace("/")}>
          {AUTH.backToLogin}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F5F0E8]">
      <LoadingSpinner className="mb-3" />
      <Text className="text-sm text-black/70">{AUTH.signingIn}</Text>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#F5F0E8]">
          <LoadingSpinner className="mb-3" />
          <Text className="text-sm text-black/70">{AUTH.signingIn}</Text>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
