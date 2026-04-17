"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ONBOARDING_STEP_2_SECTIONS } from "@/config/site";
import FoundationsNav from "@/components/FoundationsNav";
import { saveProfileSection } from "@/lib/saveProfileSection";

const FOREST_GREEN = "#0B2014";
const CREAM = "#F8EDE3";

export default function WorkPage() {
  const sectionContent = ONBOARDING_STEP_2_SECTIONS.work;
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workType, setWorkType] = useState("");
  const [workSituation, setWorkSituation] = useState("");
  const [financialLifestyle, setFinancialLifestyle] = useState("");
  const [weeklySchedule, setWeeklySchedule] = useState("");

  const financialRef = useRef<HTMLElement>(null);
  const weeklyScheduleRef = useRef<HTMLElement>(null);

  const scrollTo = (ref: { current: HTMLElement | null }) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase
        .from("profiles")
        .select("work_and_life_stage")
        .eq("user_id", session.user.id)
        .limit(1);
      const saved = data?.[0]?.work_and_life_stage;
      if (saved) {
        setWorkType(saved.work_type ?? "");
        setWorkSituation(saved.work_situation ?? "");
        setFinancialLifestyle(saved.financial_lifestyle ?? "");
        setWeeklySchedule(saved.weekly_schedule ?? "");
      }

      setLoading(false);
    };
    load();
  }, [router]);

  const handleContinue = async () => {
    setError(null);
    if (!userId) {
      setError(sectionContent.errors.signedIn);
      return;
    }
    if (!workType.trim()) {
      setError(sectionContent.errors.workType);
      return;
    }
    if (!workSituation) {
      setError(sectionContent.errors.workSituation);
      return;
    }
    if (!financialLifestyle) {
      setError(sectionContent.errors.financialLifestyle);
      return;
    }
    if (!weeklySchedule) {
      setError(sectionContent.errors.weeklySchedule);
      return;
    }

    setSaving(true);
    try {
      const sectionPayload = {
        work_type: workType || null,
        work_situation: workSituation || null,
        financial_lifestyle: financialLifestyle || null,
        weekly_schedule: weeklySchedule || null,
      };

      await saveProfileSection(userId, "work_and_life_stage", sectionPayload);
      router.replace("/onboarding/step-2/education");
    } catch (err: unknown) {
      console.error(sectionContent.api.errorLog, err);
      setError(err instanceof Error ? err.message : sectionContent.errors.unknown);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: FOREST_GREEN }}>
        <p style={{ fontFamily: "var(--font-inter), sans-serif" }}>{sectionContent.loading}</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col px-8 py-10 text-white overflow-x-hidden"
      style={{ background: FOREST_GREEN, fontFamily: "var(--font-inter), sans-serif" }}
    >
      <header className="w-full flex flex-col items-center mb-10">
        <h1
          className="text-4xl text-white mb-8 mt-15"
          style={{ fontFamily: "var(--font-pinyon), cursive" }}
        >
          {sectionContent.pageTitle}
        </h1>
        <FoundationsNav />
      </header>

      <main className="w-full max-w-md mx-auto flex-grow space-y-10 pb-32">
        {/* What kind of work */}
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="work-type"
            className="text-[10px] uppercase tracking-[0.2em] text-white/60"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.workType.label}
          </label>
          <input
            id="work-type"
            type="text"
            placeholder={sectionContent.fields.workType.placeholder}
            value={workType}
            onChange={(e) => setWorkType(e.target.value)}
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-2 px-0 text-lg font-light text-white placeholder:text-white/20 focus:outline-none focus:border-[#F8EDE3] transition-colors"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          />
        </div>

        {/* Current work situation */}
        <section className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.workSituation.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.workSituation.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="work"
                  id={`work-${opt.value}`}
                  value={opt.value}
                  checked={workSituation === opt.value}
                  onChange={() => { setWorkSituation(opt.value); scrollTo(financialRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`work-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${workSituation === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Financial Lifestyle */}
        <section ref={financialRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.financialLifestyle.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.financialLifestyle.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="financial-lifestyle"
                  id={`financial-lifestyle-${opt.value}`}
                  value={opt.value}
                  checked={financialLifestyle === opt.value}
                  onChange={() => { setFinancialLifestyle(opt.value); scrollTo(weeklyScheduleRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`financial-lifestyle-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${financialLifestyle === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Weekly Schedule */}
        <section ref={weeklyScheduleRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.weeklySchedule.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.weeklySchedule.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="weekly-schedule"
                  id={`weekly-schedule-${opt.value}`}
                  value={opt.value}
                  checked={weeklySchedule === opt.value}
                  onChange={() => setWeeklySchedule(opt.value)}
                  className="hidden"
                />
                <label
                  htmlFor={`weekly-schedule-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${weeklySchedule === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>
      </main>

      {error && (
        <p className="fixed bottom-28 left-8 right-8 text-sm text-red-400 text-center z-10">{error}</p>
      )}

      <div
        className="fixed bottom-0 left-0 w-full px-8 pb-10 pt-12 z-10"
        style={{
          background: `linear-gradient(to top, ${FOREST_GREEN}, ${FOREST_GREEN}ee, transparent)`,
        }}
      >
        <button
          type="button"
          onClick={handleContinue}
          disabled={saving}
          className="w-full py-5 text-black text-sm uppercase tracking-[0.2em] hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60 focus:outline-none"
          style={{ background: CREAM, fontFamily: "var(--font-playfair), serif" }}
        >
          {saving ? sectionContent.buttonSaving : sectionContent.buttonContinue}
        </button>
      </div>

      <Link
        href="/onboarding/step-2/locAndFuture"
        className="fixed top-8 left-6 opacity-40 hover:opacity-60 transition-opacity z-10 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/10 backdrop-blur-sm"
        aria-label="Back"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
    </div>
  );
}
