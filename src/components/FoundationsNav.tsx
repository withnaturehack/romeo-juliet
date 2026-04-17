"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const FOREST_GREEN = "#0B2014";
const CREAM = "#F8EDE3";

type Tab = {
  route: string;
  label: string;
};

const TABS: Tab[] = [
  { route: "/onboarding/step-2", label: "Basic Information" },
  { route: "/onboarding/step-2/locAndFuture", label: "Location & Future Plans" },
  { route: "/onboarding/step-2/work", label: "Work & Life Stage" },
  { route: "/onboarding/step-2/education", label: "Education and Intellectual Life" },
  { route: "/onboarding/step-2/relationship", label: "Relationship Direction & Readiness" },
  { route: "/onboarding/step-2/family", label: "Family & Children" },
  { route: "/onboarding/step-2/lifestyle", label: "Lifestyle" },
  { route: "/onboarding/step-2/values", label: "Values, Faith & Culture" },
  { route: "/onboarding/step-2/politics", label: "Political & Social Outlook" },
  { route: "/onboarding/step-2/physical", label: "Physical & Attraction" },
];

export default function FoundationsNav() {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full mb-8">
      {/* Left Arrow */}
      <button
        onClick={scrollLeft}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-gradient-to-r from-[#0B2014] via-[#0B2014] to-transparent opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Scroll left"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        <span className="text-white/80 text-2xl leading-none">‹</span>
      </button>

      {/* Scrollable Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide px-10"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-6 whitespace-nowrap">
          {TABS.map((tab) => {
            const isActive = pathname === tab.route;
            return (
              <Link
                key={tab.route}
                href={tab.route}
                className={`
                  relative py-2 px-1 text-[11px] uppercase tracking-[0.15em] font-light
                  transition-all duration-300
                  ${isActive ? "text-white" : "text-white/40 hover:text-white/70"}
                `}
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[1px] animate-fadeIn"
                    style={{ backgroundColor: CREAM }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={scrollRight}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 flex items-center justify-center bg-gradient-to-l from-[#0B2014] via-[#0B2014] to-transparent opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Scroll right"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        <span className="text-white/80 text-2xl leading-none">›</span>
      </button>

      {/* Bottom Border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/5" />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
