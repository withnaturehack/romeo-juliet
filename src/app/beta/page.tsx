"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  BETA,
  BETA_CODE_LENGTH,
  BETA_STORAGE_KEY,
  BETA_GATE_ENABLED,
  getBetaCode,
} from "@/config/site";
import { Button, Text, PageContainer, LoadingSpinner } from "@/components/ui";

function isValidCode(input: string): boolean {
  const normalized = input.trim().toLowerCase();
  return normalized.length === BETA_CODE_LENGTH && normalized === getBetaCode();
}

export default function BetaGatePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      if (!BETA_GATE_ENABLED || (typeof window !== "undefined" && localStorage.getItem(BETA_STORAGE_KEY) === "true")) {
        router.replace("/onboarding");
        return;
      }
      setChecking(false);
    };
    check();
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim().toLowerCase();
    if (trimmed.length !== BETA_CODE_LENGTH) {
      setError(BETA.errorWrongLength);
      return;
    }
    if (!isValidCode(trimmed)) {
      setError(BETA.errorInvalidCode);
      return;
    }
    setLoading(true);
    if (typeof window !== "undefined") {
      localStorage.setItem(BETA_STORAGE_KEY, "true");
    }
    router.replace("/onboarding");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^a-zA-Z]/g, "").slice(0, BETA_CODE_LENGTH);
    setCode(val);
    setError(null);
  };

  if (checking) {
    return (
      <PageContainer className="flex flex-col items-center justify-center px-8">
        <LoadingSpinner className="mb-3" />
        <Text className="text-sm opacity-80">{BETA.loading}</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col justify-center items-center px-8 py-12">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-8">
        <header>
          <Text variant="tagline" className="text-sm opacity-90">
            {BETA.subtitle}
          </Text>
        </header>

        <form onSubmit={handleSubmit} className="w-full flex flex-col space-y-6">
          <div className="flex flex-col space-y-1">
            <label htmlFor="beta-code" className="sr-only">
              {BETA.label}
            </label>
            <input
              id="beta-code"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={BETA_CODE_LENGTH}
              placeholder={BETA.placeholder}
              value={code}
              onChange={handleChange}
              className="w-full bg-transparent border-t-0 border-x-0 border-b border-white py-4 px-1 text-lg font-light tracking-[0.3em] text-center placeholder:text-white/30 focus:outline-none focus:ring-0 uppercase"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            />
          </div>
          {error && (
            <Text className="text-sm text-red-400">
              {error}
            </Text>
          )}
          <Button
            type="submit"
            disabled={loading || code.length !== BETA_CODE_LENGTH}
          >
            {loading ? BETA.buttonEntering : BETA.buttonContinue}
          </Button>
        </form>
      </div>
    </PageContainer>
  );
}
