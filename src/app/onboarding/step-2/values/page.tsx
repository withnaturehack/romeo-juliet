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

export default function ValuesPage() {
  const sectionContent = ONBOARDING_STEP_2_SECTIONS.values;
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [faithRole, setFaithRole] = useState("");
  const [partnerFaithImportance, setPartnerFaithImportance] = useState("");
  const [traditions, setTraditions] = useState("");

  const partnerFaithRef = useRef<HTMLElement>(null);
  const traditionsRef = useRef<HTMLElement>(null);

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
        .select("values_faith_and_culture")
        .eq("user_id", session.user.id)
        .limit(1);
      const saved = data?.[0]?.values_faith_and_culture;
      if (saved) {
        setFaithRole(saved.faith_role ?? "");
        setPartnerFaithImportance(saved.partner_faith_importance ?? "");
        setTraditions(saved.traditions ?? "");
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
    if (!faithRole) {
      setError(sectionContent.errors.faithRole);
      return;
    }
    if (!partnerFaithImportance) {
      setError(sectionContent.errors.partnerFaithImportance);
      return;
    }
    if (!traditions) {
      setError(sectionContent.errors.traditions);
      return;
    }

    setSaving(true);
    try {
      const sectionPayload = {
        faith_role: faithRole || null,
        partner_faith_importance: partnerFaithImportance || null,
        traditions: traditions || null,
      };

      await saveProfileSection(userId, "values_faith_and_culture", sectionPayload);
      router.replace("/onboarding/step-2/politics");
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
        {/* Faith Role */}
        <section className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.faithRole.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.faithRole.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="faith-role"
                  id={`faith-role-${opt.value}`}
                  value={opt.value}
                  checked={faithRole === opt.value}
                  onChange={() => { setFaithRole(opt.value); scrollTo(partnerFaithRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`faith-role-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${faithRole === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Partner Faith Importance */}
        <section ref={partnerFaithRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.partnerFaithImportance.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.partnerFaithImportance.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="partner-faith-importance"
                  id={`partner-faith-${opt.value}`}
                  value={opt.value}
                  checked={partnerFaithImportance === opt.value}
                  onChange={() => { setPartnerFaithImportance(opt.value); scrollTo(traditionsRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`partner-faith-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${partnerFaithImportance === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Cultural/Religious Traditions */}
        <section ref={traditionsRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.traditions.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.traditions.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="traditions"
                  id={`traditions-${opt.value}`}
                  value={opt.value}
                  checked={traditions === opt.value}
                  onChange={() => setTraditions(opt.value)}
                  className="hidden"
                />
                <label
                  htmlFor={`traditions-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${traditions === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
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
        href="/onboarding/step-2/lifestyle"
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
