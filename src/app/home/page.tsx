"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { HOME } from "@/config/site";
import type { User } from "@supabase/supabase-js";
import { Text, PageContainer, LoadingSpinner } from "@/components/ui";
import { COLORS } from "@/lib/theme";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHowWeMatch, setShowHowWeMatch] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      setUser(session.user);
      setLoading(false);
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    if (!showHowWeMatch) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowHowWeMatch(false);
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [showHowWeMatch]);

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.user_metadata?.name?.split(" ")[0] ||
    "";

  const considerationText = firstName
    ? HOME.underConsiderationPersonalized(firstName)
    : HOME.underConsideration;

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner className="border-white/30 border-t-white/80" />
          <Text className="text-sm text-white/60">{HOME.loading}</Text>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Constellation graphic */}
        <div
          className="w-52 h-52 mb-10 flex items-center justify-center constellation-pulse"
          style={{ color: COLORS.gold }}
        >
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="0.5"
          >
            {/* Main constellation nodes (6 points, diamond/shield shape) */}
            <circle cx="50" cy="20" r="3" opacity="0.9" />
            <circle cx="72" cy="38" r="3" opacity="0.9" />
            <circle cx="72" cy="62" r="3" opacity="0.9" />
            <circle cx="50" cy="80" r="3" opacity="0.9" />
            <circle cx="28" cy="62" r="3" opacity="0.9" />
            <circle cx="28" cy="38" r="3" opacity="0.9" />
            <circle cx="50" cy="50" r="2" opacity="0.7" />

            {/* Dashed connecting lines */}
            <line x1="50" y1="20" x2="72" y2="38" strokeDasharray="3 2" strokeOpacity="0.6" fill="none" />
            <line x1="72" y1="38" x2="72" y2="62" strokeDasharray="3 2" strokeOpacity="0.6" fill="none" />
            <line x1="72" y1="62" x2="50" y2="80" strokeDasharray="3 2" strokeOpacity="0.6" fill="none" />
            <line x1="50" y1="80" x2="28" y2="62" strokeDasharray="3 2" strokeOpacity="0.6" fill="none" />
            <line x1="28" y1="62" x2="28" y2="38" strokeDasharray="3 2" strokeOpacity="0.6" fill="none" />
            <line x1="28" y1="38" x2="50" y2="20" strokeDasharray="3 2" strokeOpacity="0.6" fill="none" />

            {/* Cross-lines */}
            <line x1="50" y1="20" x2="50" y2="80" strokeDasharray="3 2" strokeOpacity="0.5" fill="none" />
            <line x1="28" y1="50" x2="72" y2="50" strokeDasharray="3 2" strokeOpacity="0.5" fill="none" />

            {/* Smaller scattered dots */}
            <circle cx="15" cy="35" r="1.2" opacity="0.5" />
            <circle cx="85" cy="45" r="1.2" opacity="0.5" />
            <circle cx="80" cy="75" r="1" opacity="0.4" />
            <circle cx="20" cy="70" r="1" opacity="0.4" />
            <circle cx="45" cy="12" r="1" opacity="0.4" />
            <circle cx="55" cy="88" r="1" opacity="0.4" />
          </svg>
        </div>

        <div className="max-w-sm space-y-3 mb-8">
          <Text variant="serif" className="text-xl md:text-2xl leading-relaxed text-white">
            {considerationText}
          </Text>
          <Text className="text-sm text-white/70">
            {HOME.timelineHint}
          </Text>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Link
            href="/onboarding/step-2"
            className="text-sm px-5 py-2 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 transition-colors"
          >
            {HOME.editProfile}
          </Link>
          <span className="hidden sm:inline text-white/40">·</span>
          <button
            type="button"
            onClick={() => setShowHowWeMatch(true)}
            className="text-sm text-white/80 hover:text-white underline underline-offset-2 transition-colors"
          >
            {HOME.howWeMatch}
          </button>
        </div>
      </main>

      {/* How we match modal */}
      {showHowWeMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowHowWeMatch(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-we-match-title"
        >
          <div
            className="max-w-md w-full rounded-lg p-6 text-left shadow-xl"
            style={{ backgroundColor: "rgb(1, 32, 20)", border: `1px solid ${COLORS.gold}40` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="how-we-match-title" className="text-lg font-semibold text-white mb-3">
              {HOME.howWeMatch}
            </h2>
            <p className="text-white/80 text-sm leading-relaxed mb-6">
              {HOME.howWeMatchContent}
            </p>
            <button
              type="button"
              onClick={() => setShowHowWeMatch(false)}
              className="text-sm font-medium px-4 py-2 rounded-md transition-colors"
              style={{ color: COLORS.gold, backgroundColor: `${COLORS.gold}20` }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="w-full pb-10 flex flex-col items-center space-y-6 shrink-0">
        <div className="flex items-center w-full px-4">
          <div className="h-[1px] flex-grow" style={{ background: COLORS.gold, opacity: 0.5 }} />
          <Text as="span" variant="serif" className="px-6 text-sm" style={{ color: COLORS.gold }}>
            ∞
          </Text>
          <div className="h-[1px] flex-grow" style={{ background: COLORS.gold, opacity: 0.5 }} />
        </div>
        <a
          href={HOME.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-white/90 hover:text-white transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
          <span className="text-[10px] uppercase tracking-[0.25em]">
            {HOME.followInsta}
          </span>
        </a>
      </footer>

      <div className="fixed bottom-6 left-6 opacity-40 pointer-events-none">
        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <Text as="span" variant="serif" className="text-xs font-bold italic">N</Text>
        </div>
      </div>
    </PageContainer>
  );
}
