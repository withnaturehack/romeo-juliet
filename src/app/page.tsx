"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import howItDiffersImage from "@/public/How-it-differs.png";
import edinburghMapImage from "@/public/Map-of-Edinburg-768X576.jpg";
import logoImage from "@/public/logo.png";
import julietFadedImage from "@/public/Juliet-faded.png";
import { supabase } from "@/lib/supabaseClient";
import { LANDING, FAQ } from "@/config/site";
import { Button, Text, PageContainer } from "@/components/ui";
import { COLORS } from "@/lib/theme";

function getReviewStep(startAt: string): 1 | 2 | 3 {
  const startMs = new Date(startAt).getTime();
  if (Number.isNaN(startMs)) return 1;

  const elapsedDays = Math.floor((Date.now() - startMs) / (1000 * 60 * 60 * 24));
  if (elapsedDays >= 6) return 3;
  if (elapsedDays >= 3) return 2;
  return 1;
}



export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAllFaq, setShowAllFaq] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isWaitingForAccess, setIsWaitingForAccess] = useState(false);
  const [showProfileReviewState, setShowProfileReviewState] = useState(false);
  const [reviewStep, setReviewStep] = useState<1 | 2 | 3>(1);
  const [reviewStartAt, setReviewStartAt] = useState<string | null>(null);

  const hasExtraFaq = FAQ.questions.length > 4;
  const visibleFaqs = showAllFaq ? FAQ.questions : FAQ.questions.slice(0, 4);

  useEffect(() => {
      const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session) {
        const [profileResult, membershipResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("conversation_transcript, updated_at")
            .eq("user_id", session.user.id)
            .maybeSingle(),
          supabase
            .from("membership")
            .select("status")
            .eq("user_id", session.user.id)
            .maybeSingle(),
        ]);

        const profile = profileResult.data;
        const membership = membershipResult.data;

        const transcript = profile?.conversation_transcript;
        const hasConversation = Array.isArray(transcript) && transcript.length > 0;
        setShowProfileReviewState(hasConversation);

        if (hasConversation) {
          const startedAt = profile?.updated_at || new Date().toISOString();
          setReviewStartAt(startedAt);
          setReviewStep(getReviewStep(startedAt));
        } else {
          setReviewStartAt(null);
          setReviewStep(1);
        }

        const isApproved = membership?.status === "approved";
        const hasApplied = membership?.status === "applied" || membership?.status === "pending";
        setIsWaitingForAccess(!isApproved && hasApplied);
      } else {
        setShowProfileReviewState(false);
        setReviewStartAt(null);
        setReviewStep(1);
        setIsWaitingForAccess(false);
      }
    };
    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);

      if (!session) {
        setShowProfileReviewState(false);
        setReviewStartAt(null);
        setReviewStep(1);
        setIsWaitingForAccess(false);
      } else {
        (async () => {
          const [profileResult, membershipResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("conversation_transcript, updated_at")
              .eq("user_id", session.user.id)
              .maybeSingle(),
            supabase
              .from("membership")
              .select("status")
              .eq("user_id", session.user.id)
              .maybeSingle(),
          ]);

          const profile = profileResult.data;
          const membership = membershipResult.data;
          const transcript = profile?.conversation_transcript;
          const hasConversation = Array.isArray(transcript) && transcript.length > 0;
          setShowProfileReviewState(hasConversation);

          if (hasConversation) {
            const startedAt = profile?.updated_at || new Date().toISOString();
            setReviewStartAt(startedAt);
            setReviewStep(getReviewStep(startedAt));
          } else {
            setReviewStartAt(null);
            setReviewStep(1);
          }

          const isApproved = membership?.status === "approved";
          const hasApplied = membership?.status === "applied" || membership?.status === "pending";
          setIsWaitingForAccess(!isApproved && hasApplied);
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!reviewStartAt || !showProfileReviewState) return;

    setReviewStep(getReviewStep(reviewStartAt));
    const interval = setInterval(() => {
      setReviewStep(getReviewStep(reviewStartAt));
    }, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [reviewStartAt, showProfileReviewState]);


  /*adding content for google auth */
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

  const handleNavbarAuth = async () => {
    setMessage(null);

    if (isLoggedIn) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage({ type: "error", text: error.message });
        return;
      }
      setMenuOpen(false);
      router.push("/");
      return;
    }

    await handleGoogleLogin();
    setMenuOpen(false);
  };

  /*google auth end */
  return (
    <PageContainer className="flex flex-col items-center">
      <section
        className={`relative w-full flex flex-col items-center overflow-hidden px-4 sm:px-8 ${showProfileReviewState && isLoggedIn
            ? "min-h-[78svh] sm:min-h-[82svh] justify-start pt-4 sm:pt-10 pb-3 sm:pb-4"
            : "h-[100svh] justify-between sm:justify-start pt-4 sm:pt-12 pb-6 sm:pb-5"
          }`}
        style={{ background: COLORS.cream }}
      >
        <header className="w-full max-w-6xl mb-3 sm:mb-5">
          <div className="relative h-11 sm:hidden">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="absolute left-0 top-0 h-10 w-10 flex items-center justify-start hover:opacity-85 transition-opacity"
            >
              <svg
                width="16"
                height="12"
                viewBox="0 0 16 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="shrink-0"
              >
                <path d="M3 2H13" stroke="#262D25" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M5 6H13" stroke="#262D25" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M3 10H13" stroke="#262D25" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>

            <Image
              src={logoImage}
              alt="Romeo & Juliet"
              className="absolute right-0 top-1 h-auto w-[72px]"
              priority
            />
          </div>

          <div
            className="hidden sm:flex h-12 sm:h-14 rounded-full px-4 sm:px-6 items-center justify-between"
            style={{ backgroundColor: COLORS.sage }}
          >
            <Image
              src={logoImage}
              alt="Romeo & Juliet"
              className="h-auto w-[68px] sm:w-[78px]"
              style={{ filter: "brightness(0) invert(1)" }}
              priority
            />

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="p-1.5 hover:opacity-80 transition-opacity"
              >
                <svg
                  width="16"
                  height="12"
                  viewBox="0 0 16 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="shrink-0"
                >
                  <path d="M3 2H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M5 6H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M3 10H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNavbarAuth}
                disabled={loading}
                className="h-8 sm:h-9 min-w-24 sm:min-w-28 px-5 rounded-full border border-white/35 text-xs sm:text-sm font-medium text-white/95 hover:text-white hover:border-white/55 transition-colors disabled:opacity-70"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {loading ? "Opening..." : isLoggedIn ? "Log out" : "Log in"}
              </button>
            </div>
          </div>
        </header>

        {showProfileReviewState && isLoggedIn ? (
          <main className="w-full max-w-5xl mt-2 sm:mt-6 flex flex-col items-center text-center">
            <Text
              as="h1"
              variant="serif"
              className="text-[2.35rem] sm:text-[4.3rem] leading-[0.98] sm:leading-[0.96]"
              style={{ color: "#2A2F28", fontFamily: "var(--font-playfair), serif" }}
            >
              Reviewing your profile
            </Text>
            <p className="mt-2 text-[0.96rem] sm:text-lg" style={{ color: "rgba(38,45,37,0.52)", fontFamily: "var(--font-inter), sans-serif" }}>
              We&apos;re taking a careful look
            </p>

            <div className="mt-8 sm:mt-12 w-full max-w-[860px] px-1 sm:px-2">
              <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 sm:gap-5">
                <span className={`h-3.5 w-3.5 justify-self-center rounded-full sm:h-4 sm:w-4 ${reviewStep === 1 ? "border-[3px] border-[#5A694F] bg-transparent" : "bg-[#5A694F]"}`} />
                <span className={`h-px w-full ${reviewStep >= 2 ? "bg-[#7B8772]" : "bg-[#C3C5C1]"}`} />
                <span className={`h-3.5 w-3.5 justify-self-center rounded-full sm:h-4 sm:w-4 ${reviewStep === 2 ? "border-[3px] border-[#5A694F] bg-transparent" : reviewStep > 2 ? "bg-[#5A694F]" : "bg-[#C3C5C1]"}`} />
                <span className={`h-px w-full ${reviewStep >= 3 ? "bg-[#7B8772]" : "bg-[#C3C5C1]"}`} />
                <span className={`h-3.5 w-3.5 justify-self-center rounded-full sm:h-4 sm:w-4 ${reviewStep === 3 ? "border-[3px] border-[#5A694F] bg-transparent" : "bg-[#C3C5C1]"}`} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 sm:gap-6 text-[11px] sm:text-[15px]" style={{ color: "rgba(42,47,40,0.64)", fontFamily: "var(--font-inter), sans-serif" }}>
                <p>Looking at your profile</p>
                <p>Understanding what matters</p>
                <p>Preparing introductions</p>
              </div>
            </div>

            <div className="mt-10 sm:mt-18 flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3">
              <Button
                onClick={() => router.push("/voice")}
                className="h-10 w-[230px] sm:w-[270px] rounded-full inline-flex items-center justify-center text-center text-sm font-medium text-white"
                style={{ backgroundColor: COLORS.sage, fontFamily: "var(--font-inter), sans-serif", textTransform: "none", letterSpacing: "normal" }}
              >
                Return to the conversation
              </Button>
              <button
                type="button"
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
                className="h-10 w-[180px] sm:w-[170px] rounded-full border border-[#7E837B] text-sm text-[#333931] hover:bg-[#EAE6DB] transition-colors"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                How we work?
              </button>
            </div>

            <p className="mt-4 max-w-[330px] sm:max-w-2xl text-[1.02rem] sm:text-base leading-relaxed" style={{ color: "rgba(42,47,40,0.5)", fontFamily: "var(--font-inter), sans-serif" }}>
              This usually takes a few days. You don&apos;t need to check this often<br />
              We&apos;ll let you know when something is worth your time
            </p>
          </main>
        ) : (
          <>
            <main className="w-full max-w-[92vw] sm:max-w-2xl lg:max-w-3xl flex flex-col items-center text-center mt-1 sm:mt-0">
              <p
                className="text-[12px] sm:text-sm tracking-[0.26em] uppercase mb-4 sm:mb-5"
                style={{ color: "rgba(36, 45, 36, 0.55)", fontFamily: "var(--font-inter), sans-serif" }}
              >
                Not a dating app
              </p>

              <Text
                as="h1"
                variant="serif"
                className="text-[3.9rem] sm:text-6xl md:text-6xl leading-[0.92] sm:leading-[0.95] tracking-[-0.02em] max-w-[11ch] sm:max-w-[16ch]"
                style={{ color: "#262D25", fontFamily: "var(--font-playfair), serif" }}
              >
                A better way to meet someone
              </Text>

              <div className="mt-2.5 sm:mt-3.5 mb-4 sm:mb-4.5 space-y-1.5 sm:space-y-1">
                <p className="text-[12px] sm:text-sm leading-[1.15]" style={{ color: "rgba(38,45,37,0.6)", fontFamily: "var(--font-inter), sans-serif" }}>
                  One introduction at a time
                </p>
                <p className="text-[12px] sm:text-sm leading-[1.25] max-w-[22ch] sm:max-w-none" style={{ color: "rgba(38,45,37,0.5)", fontFamily: "var(--font-inter), sans-serif" }}>
                  You both decide. If it holds, a conversation begins.
                </p>
              </div>

              <div className="w-full flex flex-col items-center space-y-4">
                {message && (
                  <Text
                    className={`text-sm text-center ${message.type === "error" ? "text-red-700" : "text-[#2F3A2F]/80"}`}
                  >
                    {message.text}
                  </Text>
                )}

                <Button
                  onClick={() => router.push("/start")}
                  disabled={loading || isWaitingForAccess}
                  className="hidden sm:inline-flex mx-auto rounded-full h-10 sm:h-9 w-full max-w-[330px] sm:w-56 items-center justify-center text-center whitespace-nowrap text-sm normal-case tracking-normal font-medium text-white/95"
                  style={{ backgroundColor: COLORS.sage, textTransform: "none", letterSpacing: "normal" }}
                >
                  {loading ? "Starting..." : isWaitingForAccess ? "Waiting for access" : "Start Quietly"}
                </Button>
              </div>
            </main>

            <div className="mt-3 sm:mt-3 w-full flex flex-col items-center justify-center gap-4">
              <Image
                src={julietFadedImage}
                alt="Juliet illustration"
                className="w-[290px] sm:w-[230px] md:w-[295px] h-auto"
                priority
              />

              <Button
                onClick={() => router.push("/start")}
                disabled={loading || isWaitingForAccess}
                className="sm:hidden mx-auto rounded-full h-11 w-full max-w-[330px] inline-flex items-center justify-center text-center whitespace-nowrap text-base normal-case tracking-normal font-medium text-white/95"
                style={{ backgroundColor: COLORS.sage, textTransform: "none", letterSpacing: "normal" }}
              >
                {loading ? "Starting..." : isWaitingForAccess ? "Waiting for access" : "Start quietly"}
              </Button>
            </div>
          </>
        )}
      </section>

      <div
        className={`fixed inset-0 z-[60] transition-all duration-500 ${menuOpen ? "visible" : "invisible"}`}
        aria-hidden={!menuOpen}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-500 ${menuOpen ? "opacity-100" : "opacity-0"}`}
        />

        <aside
          className={`absolute left-4 top-4 bottom-auto h-fit max-h-[calc(100svh-2rem)] overflow-y-auto w-[min(190px,calc(100%-2rem))] sm:left-auto sm:right-4 sm:w-[320px] sm:bottom-4 sm:h-auto sm:max-h-none sm:overflow-visible rounded-[4px] border px-4 py-4 transition-transform duration-500 shadow-[0_14px_40px_rgba(0,0,0,0.28)] ${menuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-full"}`}
          style={{ backgroundColor: "#D9D2C4", borderColor: "rgba(24, 20, 16, 0.45)", color: "#262D25" }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-3 right-3 text-2xl leading-none hover:opacity-70 transition-opacity"
            style={{ color: "#262D25" }}
            type="button"
          >
            ×
          </button>

          <nav className="mt-8 flex flex-col gap-5 sm:gap-7">
            <button
              onClick={handleNavbarAuth}
              className="block text-left text-[17px] sm:text-2xl font-normal italic tracking-[-0.01em] transition-colors hover:opacity-80"
              style={{ fontFamily: "var(--font-playfair), serif", color: "#262D25" }}
              type="button"
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>

            {[
              { label: "How it works", href: "/#how" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "FAQs", href: "/#faq" },
              { label: "Terms", href: "/terms" },
              { label: "Contact us", href: "/contact" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block text-left text-[17px] sm:text-2xl font-normal italic tracking-[-0.01em] transition-colors hover:opacity-80"
                style={{ fontFamily: "var(--font-playfair), serif", color: "#262D25" }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
      </div>

      {/* HOW IT WORKS */}
      <section id="how" className="w-full min-h-svh flex items-center px-4 sm:px-8 lg:px-10 py-8 sm:py-10" style={{ background: COLORS.cream }}>
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[34px] sm:rounded-[44px] border border-[#66665F] px-6 sm:px-14 lg:px-20 py-8 sm:py-12 lg:py-14" style={{ background: COLORS.cream }}>
            <Text
              as="h2"
              variant="serif"
              className="text-[2.05rem] sm:text-[3.1rem] lg:text-[3.35rem] leading-none text-center mb-8 sm:mb-10 lg:mb-12"
              style={{ color: "#2D2F2C", fontFamily: "var(--font-playfair), serif" }}
            >
              How it works
            </Text>

            <div className="space-y-6 sm:space-y-7 text-left max-w-4xl mx-auto">
              <p className="text-[1.02rem] sm:text-[1.05rem] lg:text-[1.08rem] leading-[1.75]" style={{ color: "rgba(45,47,44,0.8)", fontFamily: "var(--font-inter), sans-serif" }}>
                You speak. We listen. We introduce.
              </p>
              <p className="text-[1.02rem] sm:text-[1.05rem] lg:text-[1.08rem] leading-[1.75]" style={{ color: "rgba(45,47,44,0.8)", fontFamily: "var(--font-inter), sans-serif" }}>
                You start with Juliet. She listens to how you talk, not just what you say. People are clearer out loud. They change their mind, repeat themselves, come back to things. That matters more than a list of preferences.
              </p>
              <p className="text-[1.02rem] sm:text-[1.05rem] lg:text-[1.08rem] leading-[1.75]" style={{ color: "rgba(45,47,44,0.8)", fontFamily: "var(--font-inter), sans-serif" }}>
                Romeo makes introductions, one at a time. No browsing profiles. What matters is how you respond when you meet someone.
              </p>
              <p className="text-[1.02rem] sm:text-[1.05rem] lg:text-[1.08rem] leading-[1.75]" style={{ color: "rgba(45,47,44,0.8)", fontFamily: "var(--font-inter), sans-serif" }}>
                Each introduction is mutual. If either of you passes, it ends there.
              </p>
              <p className="text-[1.02rem] sm:text-[1.05rem] lg:text-[1.08rem] leading-[1.75]" style={{ color: "rgba(45,47,44,0.8)", fontFamily: "var(--font-inter), sans-serif" }}>
                When there's a decision, we'll let you know. Try to reply while it's still fresh.
              </p>
              <p className="text-[1.02rem] sm:text-[1.05rem] lg:text-[1.08rem] leading-[1.75]" style={{ color: "rgba(45,47,44,0.8)", fontFamily: "var(--font-inter), sans-serif" }}>
                No need to check in. We'll reach out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW THIS IS DIFFERENT */}
      <section className="w-full min-h-0 sm:min-h-svh flex items-start sm:items-center px-4 sm:px-8 lg:px-10 py-10 sm:py-6 sm:-mt-10 lg:-mt-12" style={{ background: COLORS.cream }}>
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-1 sm:mb-8 lg:mb-9">
            <Text
              as="h2"
              variant="serif"
              className="text-[2.05rem] sm:text-[2.7rem] lg:text-[3.2rem] leading-[1.0] sm:leading-[1.05]"
              style={{ color: "#2D2F2C", fontFamily: "var(--font-playfair), serif" }}
            >
              How this is different
            </Text>
            <p
              className="mt-2 sm:mt-4 text-[0.98rem] sm:text-[1.02rem] lg:text-[1.1rem] leading-relaxed"
              style={{ color: "rgba(45,47,44,0.5)", fontFamily: "var(--font-inter), sans-serif" }}
            >
              You're not shown options. You're introduced to one person at a time, only when it feels worth it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] xl:grid-cols-[1.9fr_1fr] gap-2 sm:gap-4 lg:gap-6 items-start">
            <div className="ml-6 sm:ml-6 lg:ml-6">
              <Image
                src={howItDiffersImage}
                alt="Phone conversation preview"
                width={960}
                height={640}
                className="block w-full h-[190px] sm:h-[260px] md:h-[300px] lg:h-[320px] object-cover object-center rounded-none"
              />
            </div>

            <div className="space-y-1.5 sm:space-y-3 lg:space-y-3.5">
              <div className="rounded-xl border border-[#8A8A82] px-4 sm:px-4.5 py-3 sm:py-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                <p className="text-[0.88rem] sm:text-[0.92rem] lg:text-[1.05rem] leading-[1.45]" style={{ color: "rgba(45,47,44,0.85)", fontFamily: "var(--font-inter), sans-serif" }}>
                  There are no profiles or filters, you start with a conversation.
                </p>
              </div>

              <div className="rounded-xl border border-[#8A8A82] px-4 sm:px-4.5 py-3 sm:py-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                <p className="text-[0.88rem] sm:text-[0.92rem] lg:text-[1.05rem] leading-[1.45]" style={{ color: "rgba(45,47,44,0.85)", fontFamily: "var(--font-inter), sans-serif" }}>
                  There's no pressure to keep things moving. If nothing feels right, we wait.
                </p>
              </div>

              <div className="rounded-xl border border-[#8A8A82] px-4 sm:px-4.5 py-3 sm:py-4" style={{ background: "rgba(255,255,255,0.08)" }}>
                <p className="text-[0.88rem] sm:text-[0.92rem] lg:text-[1.05rem] leading-[1.45]" style={{ color: "rgba(45,47,44,0.85)", fontFamily: "var(--font-inter), sans-serif" }}>
                  The goal isn't to keep you engaged. It's to introduce someone you'd actually want to meet.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVACY */}
      <div className="h-10 sm:hidden w-full" style={{ background: COLORS.cream }} />

      <section className="sm:mt-0 w-full px-6 sm:px-8 lg:px-10 py-10 sm:py-6 lg:py-8" style={{ background: COLORS.sage }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 lg:gap-10 items-stretch lg:items-end">
          <div>
            <Text
              as="h2"
              variant="serif"
              className="text-[2.35rem] sm:text-5xl lg:text-[3.15rem] leading-[1.08]"
              style={{ color: "rgba(255,255,255,0.92)", fontFamily: "var(--font-playfair), serif" }}
            >
              Your privacy comes first
            </Text>
            <ul className="mt-6 sm:mt-7 space-y-1.5 sm:space-y-2.5 pl-6 list-disc marker:text-white/85 text-sm sm:text-base lg:text-[1.12rem]" style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-inter), sans-serif" }}>
              <li>What you share stays here.</li>
              <li>Your responses are saved and used to improve future introductions.</li>
              <li>Your voice is not public and is never shared.</li>
              <li>Nothing is visible unless you both choose to meet.</li>
            </ul>
          </div>

          <div className="flex justify-center lg:justify-end lg:-translate-y-21">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="h-11 sm:h-12 w-52 sm:w-60 rounded-lg inline-flex items-center justify-center text-center whitespace-nowrap text-sm sm:text-base font-medium normal-case tracking-normal"
              style={{ backgroundColor: COLORS.cream, color: "#3C4637", boxShadow: "0 4px 0 rgba(0,0,0,0.28)", fontFamily: "var(--font-inter), sans-serif", textTransform: "none", letterSpacing: "normal" }}
            >
              {loading ? "Starting..." : "Start Quietly"}
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="w-full px-6 sm:px-8 lg:px-10 py-10 sm:py-24 lg:py-28" style={{ background: COLORS.cream }}>
        <div className="max-w-3xl mx-auto text-center">
          <Text
            as="h2"
            variant="serif"
            className="text-[2.25rem] sm:text-5xl lg:text-[3.55rem] leading-[1.05] mb-10 sm:mb-12"
            style={{ color: "#2F352E", fontFamily: "var(--font-playfair), serif" }}
          >
            Your Questions, Answered Directly
          </Text>

          <div className="space-y-3 sm:space-y-4 text-left">
            {visibleFaqs.map((faq, index) => (
              <div key={index} className="rounded-lg border border-[#BEBBB4] bg-transparent overflow-hidden">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-4 text-base sm:text-[1.05rem]"
                  style={{ color: "#4B4F49", fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span>{faq.question}</span>
                  <span className={`shrink-0 transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""}`}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M4 6L8 10L12 6" stroke="#9A978F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                <div className={`overflow-hidden transition-all duration-400 ${openIndex === index ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <p className="px-5 sm:px-6 pb-4 text-sm sm:text-base leading-relaxed" style={{ color: "rgba(75,79,73,0.8)", fontFamily: "var(--font-inter), sans-serif" }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {hasExtraFaq && (
            <button
              type="button"
              onClick={() => {
                if (showAllFaq && openIndex !== null && openIndex >= 4) {
                  setOpenIndex(null);
                }
                setShowAllFaq(!showAllFaq);
              }}
              className="mt-6 sm:mt-8 h-10 sm:h-11 min-w-36 rounded-full border border-[#A8A49D] text-sm sm:text-base px-7"
              style={{ color: "#4B4F49", fontFamily: "var(--font-inter), sans-serif" }}
            >
              {showAllFaq ? "View less" : "View more"}
            </button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="w-full border-t border-white/10"
        style={{
          background: "linear-gradient(90deg, #212325 0%, #1D1F22 45%, #1A1C1E 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-12 sm:py-14 lg:py-16 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_2fr] gap-12 lg:gap-16">
            <div>
              <Text
                as="h2"
                variant="serif"
                className="text-5xl sm:text-6xl lg:text-[3.25rem] leading-[1.05]"
                style={{ color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-playfair), serif" }}
              >
                Join our community
              </Text>
              <p
                className="mt-3 sm:mt-4 max-w-lg text-[1.05rem] sm:text-[1.15rem] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.72)", fontFamily: "var(--font-inter), sans-serif" }}
              >
                Be part of a curated network of people looking for meaningful connections.
              </p>

              <form className="mt-7 sm:mt-8 max-w-[420px]" onSubmit={(e) => e.preventDefault()}>
                <div className="flex items-center rounded-md border border-[#B9B7AC]/80 bg-[#E7E1D4] overflow-hidden">
                  <input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    aria-label="Email address"
                    className="w-full bg-transparent px-4 py-3 text-[0.95rem] tracking-[0.12em] uppercase outline-none"
                    style={{ color: "#6A6B66", fontFamily: "var(--font-inter), sans-serif" }}
                  />
                  <button
                    type="submit"
                    aria-label="Submit email"
                    className="h-[46px] w-[52px] shrink-0 border-l border-[#B9B7AC]/70 flex items-center justify-center"
                    style={{ backgroundColor: "#51644B" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M3 1L9 7L3 13" stroke="#ECE8DD" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 lg:pt-3">
              <div>
                <h3 className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter), sans-serif" }}>Links</h3>
                <ul className="space-y-2.5 text-[1.05rem]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  <li><a href="/privacy" className="text-white/88 hover:text-white transition-colors">Privacy Policy</a></li>
                  <li><a href="/terms" className="text-white/88 hover:text-white transition-colors">Terms</a></li>
                  <li><a href="/#how" className="text-white/88 hover:text-white transition-colors">How it works</a></li>
                  <li><a href="/#faq" className="text-white/88 hover:text-white transition-colors">FAQs</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter), sans-serif" }}>Social</h3>
                <ul className="space-y-2.5 text-[1.05rem]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  <li><a href="https://instagram.com/romeojuliet.love" target="_blank" rel="noopener noreferrer" className="text-white/88 hover:text-white transition-colors">Instagram</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-inter), sans-serif" }}>Contact</h3>
                <img
                  src={edinburghMapImage.src}
                  alt="Map preview"
                  className="h-20 w-full rounded-sm object-cover border border-white/10"
                />
                <ul className="mt-3 space-y-1.5 text-[1.05rem]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  <li className="text-white/88">Location</li>
                  <li><a href="/contact" className="text-white/88 hover:text-white transition-colors">Contact</a></li>
                  <li><a href="/contact" className="text-white/88 hover:text-white transition-colors">Email</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </PageContainer>
  );
}
