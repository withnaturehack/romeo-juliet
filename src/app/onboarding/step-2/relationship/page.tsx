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

export default function RelationshipPage() {
  const sectionContent = ONBOARDING_STEP_2_SECTIONS.relationship;
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [buildingToward, setBuildingToward] = useState("");
  const [structure, setStructure] = useState("");
  const [space, setSpace] = useState("");
  const [emotionalAvailability, setEmotionalAvailability] = useState("");
  const [lastRelationship, setLastRelationship] = useState("");
  const [pace, setPace] = useState("");

  const structureRef = useRef<HTMLElement>(null);
  const spaceRef = useRef<HTMLElement>(null);
  const emotionalAvailabilityRef = useRef<HTMLElement>(null);
  const lastRelationshipRef = useRef<HTMLElement>(null);
  const paceRef = useRef<HTMLElement>(null);

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
        .select("relationship_direction_and_readiness")
        .eq("user_id", session.user.id)
        .limit(1);
      const saved = data?.[0]?.relationship_direction_and_readiness;
      if (saved) {
        setBuildingToward(saved.building_toward ?? "");
        setStructure(saved.structure ?? "");
        setSpace(saved.space ?? "");
        setEmotionalAvailability(saved.emotional_availability ?? "");
        setLastRelationship(saved.last_relationship ?? "");
        setPace(saved.pace ?? "");
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
    if (!buildingToward) {
      setError(sectionContent.errors.buildingToward);
      return;
    }
    if (!structure) {
      setError(sectionContent.errors.structure);
      return;
    }
    if (!space) {
      setError(sectionContent.errors.space);
      return;
    }
    if (!emotionalAvailability) {
      setError(sectionContent.errors.emotionalAvailability);
      return;
    }
    if (!lastRelationship) {
      setError(sectionContent.errors.lastRelationship);
      return;
    }
    if (!pace) {
      setError(sectionContent.errors.pace);
      return;
    }

    setSaving(true);
    try {
      const sectionPayload = {
        building_toward: buildingToward || null,
        structure: structure || null,
        space: space || null,
        emotional_availability: emotionalAvailability || null,
        last_relationship: lastRelationship || null,
        pace: pace || null,
      };

      await saveProfileSection(userId, "relationship_direction_and_readiness", sectionPayload);
      router.replace("/onboarding/step-2/family");
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
        {/* Building Toward */}
        <section className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.buildingToward.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.buildingToward.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="building-toward"
                  id={`building-toward-${opt.value}`}
                  value={opt.value}
                  checked={buildingToward === opt.value}
                  onChange={() => { setBuildingToward(opt.value); scrollTo(structureRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`building-toward-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${buildingToward === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Structure */}
        <section ref={structureRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.structure.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.structure.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="structure"
                  id={`structure-${opt.value}`}
                  value={opt.value}
                  checked={structure === opt.value}
                  onChange={() => { setStructure(opt.value); scrollTo(spaceRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`structure-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${structure === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Space */}
        <section ref={spaceRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.space.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.space.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="space"
                  id={`space-${opt.value}`}
                  value={opt.value}
                  checked={space === opt.value}
                  onChange={() => { setSpace(opt.value); scrollTo(emotionalAvailabilityRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`space-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${space === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Emotional Availability */}
        <section ref={emotionalAvailabilityRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.emotionalAvailability.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.emotionalAvailability.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="emotional-availability"
                  id={`emotional-availability-${opt.value}`}
                  value={opt.value}
                  checked={emotionalAvailability === opt.value}
                  onChange={() => { setEmotionalAvailability(opt.value); scrollTo(lastRelationshipRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`emotional-availability-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${emotionalAvailability === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Last Relationship */}
        <section ref={lastRelationshipRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.lastRelationship.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.lastRelationship.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="last-relationship"
                  id={`last-relationship-${opt.value}`}
                  value={opt.value}
                  checked={lastRelationship === opt.value}
                  onChange={() => { setLastRelationship(opt.value); scrollTo(paceRef); }}
                  className="hidden"
                />
                <label
                  htmlFor={`last-relationship-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${lastRelationship === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Pace */}
        <section ref={paceRef} className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {sectionContent.fields.pace.heading}
          </h2>
          <div className="space-y-3">
            {sectionContent.fields.pace.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="pace"
                  id={`pace-${opt.value}`}
                  value={opt.value}
                  checked={pace === opt.value}
                  onChange={() => setPace(opt.value)}
                  className="hidden"
                />
                <label
                  htmlFor={`pace-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${pace === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
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
        href="/onboarding/step-2/education"
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
