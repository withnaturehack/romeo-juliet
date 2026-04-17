"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { saveProfileSection } from "@/lib/saveProfileSection";
import { Button, RadioSection, PageContainer, Text } from "@/components/ui";
import { COLORS } from "@/lib/theme";
import { ONBOARDING_STEP_2, MEMBERSHIP_STORAGE_KEY } from "@/config/site";
import FoundationsNav from "@/components/FoundationsNav";

type BasicInformation = {
  date_of_birth?: string | null;
  age_range_min?: string | null;
  age_range_max?: string | null;
  gender?: string | null;
  who_to_meet?: string | null;
  pronouns?: string | null;
};

type ProfileRow = {
  display_name: string | null;
  basic_information: BasicInformation | null;
};

export default function OnboardingFoundationsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [ageRangeMin, setAgeRangeMin] = useState("");
  const [ageRangeMax, setAgeRangeMax] = useState("");
  const [gender, setGender] = useState("");
  const [lookingForGender, setLookingForGender] = useState("");
  const [pronouns, setPronouns] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/");
        return;
      }

      if (typeof window !== "undefined" && localStorage.getItem(MEMBERSHIP_STORAGE_KEY) !== "true") {
        router.replace("/membership-access");
        return;
      }

      setUserId(session.user.id);

      const { data } = await supabase
        .from("profiles")
        .select("display_name, basic_information")
        .eq("user_id", session.user.id)
        .limit(1);

      const profile = data?.[0] as ProfileRow | undefined;
      if (profile) {
        setName(profile.display_name ?? "");
        const bi = profile.basic_information;
        if (bi) {
          setDateOfBirth(bi.date_of_birth ?? "");
          setAgeRangeMin(bi.age_range_min ?? "");
          setAgeRangeMax(bi.age_range_max ?? "");
          setGender(bi.gender ?? "");
          setLookingForGender(bi.who_to_meet ?? "");
          setPronouns(bi.pronouns ?? "");
        }
      }

      setLoading(false);
    };
    load();
  }, [router]);

  const handleContinue = async () => {
    setError(null);
    if (!userId) {
      setError(ONBOARDING_STEP_2.errors.signedIn);
      return;
    }
    if (!name.trim()) {
      setError(ONBOARDING_STEP_2.errors.name);
      return;
    }
    if (!dateOfBirth) {
      setError(ONBOARDING_STEP_2.errors.dateOfBirth);
      return;
    }
    if (!ageRangeMin || !ageRangeMax) {
      setError(ONBOARDING_STEP_2.errors.ageRange);
      return;
    }
    const minAge = parseInt(ageRangeMin, 10);
    const maxAge = parseInt(ageRangeMax, 10);
    if (isNaN(minAge) || isNaN(maxAge) || minAge < 18 || maxAge > 100 || minAge > maxAge) {
      setError(ONBOARDING_STEP_2.errors.ageRangeInvalid);
      return;
    }
    if (!gender) {
      setError(ONBOARDING_STEP_2.errors.gender);
      return;
    }
    if (!lookingForGender) {
      setError(ONBOARDING_STEP_2.errors.lookingFor);
      return;
    }
    if (!pronouns) {
      setError(ONBOARDING_STEP_2.errors.pronouns);
      return;
    }

    setSaving(true);
    try {
      const basicInformationPayload = {
        date_of_birth: dateOfBirth || null,
        age_range_min: ageRangeMin || null,
        age_range_max: ageRangeMax || null,
        gender: gender || null,
        who_to_meet: lookingForGender || null,
        pronouns: pronouns || null,
      };

      await saveProfileSection(userId, "basic_information", basicInformationPayload);

      await supabase
        .from("profiles")
        .update({ display_name: name.trim() })
        .eq("user_id", userId);

      router.replace("/onboarding/step-2/locAndFuture");
    } catch (err: unknown) {
      console.error(ONBOARDING_STEP_2.api.errorLog, err);
      setError(err instanceof Error ? err.message : ONBOARDING_STEP_2.errors.unknown);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Text>{ONBOARDING_STEP_2.loading}</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col px-8 pt-20 sm:pt-24 pb-10 overflow-x-hidden">
      <header className="w-full flex flex-col items-center mb-10">
        <Text as="h1" variant="script" className="text-4xl text-white mb-8 mt-15">
          {ONBOARDING_STEP_2.pageTitle}
        </Text>

        <FoundationsNav />

      </header>

      <main className="w-full max-w-md mx-auto flex-grow space-y-10 pb-32">
        <style jsx>{`
          select {
            background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23F8EDE3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.5rem center;
            padding-right: 2.5rem;
          }
          select option {
            padding: 0.5rem;
          }
        `}</style>

        {/* Name */}
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="name"
            className="text-[10px] uppercase tracking-[0.2em] text-white/60"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {ONBOARDING_STEP_2.fields.name.label}
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={ONBOARDING_STEP_2.fields.name.placeholder}
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-2 px-0 text-lg font-light text-white focus:outline-none focus:border-[#F8EDE3] transition-colors placeholder:text-white/30"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
          />
        </div>

        {/* Date of Birth */}
        <div className="flex flex-col space-y-1">
          <label
            htmlFor="dob"
            className="text-[10px] uppercase tracking-[0.2em] text-white/60"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {ONBOARDING_STEP_2.fields.dateOfBirth.label}
          </label>
          <input
            id="dob"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-2 px-0 text-lg font-light text-white focus:outline-none focus:border-[#F8EDE3] transition-colors"
            style={{ fontFamily: "var(--font-inter), sans-serif", colorScheme: "dark" }}
          />
        </div>

        {/* Age Range */}
        <div className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {ONBOARDING_STEP_2.fields.ageRange.heading}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 flex flex-col space-y-1">
              <label
                htmlFor="age-min"
                className="text-[10px] uppercase tracking-[0.2em] text-white/60"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {ONBOARDING_STEP_2.fields.ageRange.minLabel}
              </label>
              <select
                id="age-min"
                value={ageRangeMin}
                onChange={(e) => setAgeRangeMin(e.target.value)}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-2 px-0 text-lg font-light text-white focus:outline-none focus:border-[#F8EDE3] transition-colors appearance-none cursor-pointer"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <option value="" className="bg-[#0B2014] text-white/40">Select</option>
                {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
                  <option key={age} value={age} className="bg-[#0B2014] text-white">
                    {age}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-white/40 text-2xl mt-6">—</span>
            <div className="flex-1 flex flex-col space-y-1">
              <label
                htmlFor="age-max"
                className="text-[10px] uppercase tracking-[0.2em] text-white/60"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {ONBOARDING_STEP_2.fields.ageRange.maxLabel}
              </label>
              <select
                id="age-max"
                value={ageRangeMax}
                onChange={(e) => setAgeRangeMax(e.target.value)}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-white/30 py-2 px-0 text-lg font-light text-white focus:outline-none focus:border-[#F8EDE3] transition-colors appearance-none cursor-pointer"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                <option value="" className="bg-[#0B2014] text-white/40">{ONBOARDING_STEP_2.fields.ageRange.selectPlaceholder}</option>
                {Array.from({ length: 83 }, (_, i) => i + 18).map((age) => (
                  <option key={age} value={age} className="bg-[#0B2014] text-white">
                    {age}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Gender */}
        <section className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {ONBOARDING_STEP_2.fields.gender.heading}
          </h2>
          <div className="space-y-3">
            {ONBOARDING_STEP_2.fields.gender.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  id={`gender-${opt.value}`}
                  value={opt.value}
                  checked={gender === opt.value}
                  onChange={() => setGender(opt.value)}
                  className="hidden"
                />
                <label
                  htmlFor={`gender-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${gender === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Who would you like to meet */}
        <section className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {ONBOARDING_STEP_2.fields.lookingFor.heading}
          </h2>
          <div className="space-y-3">
            {ONBOARDING_STEP_2.fields.lookingFor.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="looking-for"
                  id={`looking-for-${opt.value}`}
                  value={opt.value}
                  checked={lookingForGender === opt.value}
                  onChange={() => setLookingForGender(opt.value)}
                  className="hidden"
                />
                <label
                  htmlFor={`looking-for-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${lookingForGender === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
                  <span className="text-sm font-light tracking-widest uppercase">{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        </section>

        {/* Pronouns */}
        <section className="space-y-4">
          <h2
            className="text-lg tracking-wide border-b border-white/10 pb-2 text-white"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {ONBOARDING_STEP_2.fields.pronouns.heading}
          </h2>
          <div className="space-y-3">
            {ONBOARDING_STEP_2.fields.pronouns.options.map((opt) => (
              <div key={opt.value} className="flex items-center">
                <input
                  type="radio"
                  name="pronouns"
                  id={`pronouns-${opt.value}`}
                  value={opt.value}
                  checked={pronouns === opt.value}
                  onChange={() => setPronouns(opt.value)}
                  className="hidden"
                />
                <label
                  htmlFor={`pronouns-${opt.value}`}
                  className="flex items-center cursor-pointer transition-colors duration-300 text-white w-full"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                >
                  <span className={`w-4 h-4 rounded-full border border-white mr-4 shrink-0 transition-all duration-300 ${pronouns === opt.value ? 'bg-[#F8EDE3] border-[#F8EDE3]' : 'bg-transparent'}`} />
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
          background: `linear-gradient(to top, ${COLORS.forestGreen}, ${COLORS.forestGreen}ee, transparent)`,
        }}
      >
        <Button onClick={handleContinue} disabled={saving}>
          {saving ? ONBOARDING_STEP_2.buttonSaving : ONBOARDING_STEP_2.buttonContinue}
        </Button>
      </div>

      <Link
        href="/onboarding"
        className="fixed top-8 left-6 opacity-40 hover:opacity-60 transition-opacity z-10 w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-black/10 backdrop-blur-sm"
        aria-label={ONBOARDING_STEP_2.backLabel}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
    </PageContainer>
  );
}
