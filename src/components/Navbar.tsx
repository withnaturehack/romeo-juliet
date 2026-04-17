"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { COLORS } from "@/lib/theme";
import { VOICE } from "@/config/site";
const CREAM = "#F8EDE3";
const SIDEBAR_BG = "#D9D2C4";
const SIDEBAR_TEXT = "#262D25";
const SIDEBAR_BORDER = "rgba(24, 20, 16, 0.45)";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if we're on an onboarding page
  const isOnboardingPage = pathname?.startsWith("/onboarding");

  useEffect(() => {
    const handleScroll = () => {
      // Change navbar background after scrolling 50px
      setIsScrolled(window.scrollY > 50);
    };

    // Cleanup listener on unmount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* TOP NAV */}
      <div
        className="fixed top-0 left-0 w-full z-50 transition-all duration-300"
        style={{
          background: (isScrolled || isOnboardingPage) ? COLORS.forestGreen : "transparent",
          backdropFilter: (isScrolled || isOnboardingPage) ? "blur(10px)" : "none",
        }}
      >
        <div className="px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
          {/* LEFT - Logo */}
          <a href="/">
            <h2
              className="text-2xl sm:text-3xl text-white whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
              style={{ fontFamily: "var(--font-pinyon), cursive" }}
            >
              Romeo & Juliet
            </h2>
          </a>

          {/* RIGHT - actions */}
          <div className="flex items-center gap-4 sm:gap-8">
            {/* HAMBURGER */}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex flex-col gap-1.5 p-2 hover:opacity-80 transition-opacity"
              aria-label="Open menu"
            >
              <span className="w-6 h-[2px] bg-white block"></span>
              <span className="w-6 h-[2px] bg-white block"></span>
            </button>
          </div>
        </div>

        {/* LUXURY HAIRLINE */}
        <div
          className={`h-px w-full bg-white/10 transition-opacity duration-300 ${(isScrolled || isOnboardingPage) ? "opacity-100" : "opacity-0"}`}
        ></div>
      </div>

      {/* ===== SIDE MENU OVERLAY ===== */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-500 ${menuOpen ? "visible" : "invisible"
          }`}
      >
        {/* backdrop */}
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-500 ${menuOpen ? "opacity-100" : "opacity-0"
            }`}
        />

        {/* panel */}
        <div
          className={`
            absolute left-4 top-4 bottom-auto h-fit max-h-[calc(100svh-2rem)] overflow-y-auto
            w-[min(190px,calc(100%-2rem))] sm:left-auto sm:right-4 sm:w-[320px]
            sm:bottom-4 sm:h-auto sm:max-h-none sm:overflow-visible
            rounded-[4px]
            border
            px-4 py-4
            transition-transform duration-500
            shadow-[0_14px_40px_rgba(0,0,0,0.28)]
            ${menuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-full"}
          `}
          style={{
            backgroundColor: SIDEBAR_BG,
            borderColor: SIDEBAR_BORDER,
            color: SIDEBAR_TEXT,
          }}
        >
          {/* close */}
          <button
            onClick={() => setMenuOpen(false)}
            className="absolute top-3 right-3 text-2xl leading-none hover:opacity-70 transition-opacity"
            style={{ color: SIDEBAR_TEXT }}
            aria-label="Close menu"
          >
            ×
          </button>

          {/* menu links */}
          <nav className="mt-8 flex flex-col gap-5 sm:gap-7">
            <button
              onClick={async () => {
                if (isLoggedIn) {
                  await supabase.auth.signOut();
                  router.push("/");
                } else {
                  const redirectTo = `${window.location.origin}/auth/callback`;
                  await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
                }
                setMenuOpen(false);
              }}
              className="block text-left text-[17px] sm:text-2xl font-normal italic tracking-[-0.01em] transition-colors hover:opacity-80"
              style={{ fontFamily: "var(--font-playfair), serif", color: SIDEBAR_TEXT }}
            >
              {isLoggedIn ? "Logout" : "Login"}
            </button>

            {isLoggedIn && pathname === "/home" && (
              <a
                href="/voice"
                onClick={() => setMenuOpen(false)}
                className="block text-left text-[17px] sm:text-2xl font-normal italic tracking-[-0.01em] transition-colors hover:opacity-80"
                style={{ fontFamily: "var(--font-playfair), serif", color: SIDEBAR_TEXT }}
              >
                {VOICE.reRecordLabel}
              </a>
            )}

            {/* Other Menu Links */}
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
                style={{ fontFamily: "var(--font-playfair), serif", color: SIDEBAR_TEXT }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
