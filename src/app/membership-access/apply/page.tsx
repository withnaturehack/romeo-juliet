"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logoImage from "@/public/logo.png";
import { supabase } from "@/lib/supabaseClient";
import { MEMBERSHIP } from "@/config/site";
import { Button, PageContainer, Text, LoadingSpinner } from "@/components/ui";
import { COLORS } from "@/lib/theme";

type FormData = {
  fullName: string;
  age: string;
  gender: string;
  publicProfileLink: string;
};

export default function MembershipApplyPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    fullName: "",
    age: "",
    gender: "",
    publicProfileLink: "",
  });

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/");
        return;
      }

      setChecking(false);
    };

    checkSession();
  }, [router]);

  const validate = (): string | null => {
    if (!form.fullName.trim()) return MEMBERSHIP.applyErrors.fullName;

    const parsedAge = Number(form.age);
    if (!Number.isFinite(parsedAge) || parsedAge < 18 || parsedAge > 120) {
      return MEMBERSHIP.applyErrors.age;
    }

    if (!form.gender.trim()) return MEMBERSHIP.applyErrors.gender;

    try {
      const url = new URL(form.publicProfileLink.trim());
      if (!url.protocol.startsWith("http")) {
        return MEMBERSHIP.applyErrors.publicProfileLink;
      }
    } catch {
      return MEMBERSHIP.applyErrors.publicProfileLink;
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Session expired. Please sign in again.");
      setSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase.from("membership").upsert(
      {
        user_id: session.user.id,
        status: "applied",
        application_data: {
          full_name: form.fullName,
          age: parseInt(form.age),
          gender: form.gender,
          public_profile_link: form.publicProfileLink,
        },
      },
      { onConflict: "user_id" }
    );

    if (dbError) {
      setError("Something went wrong submitting your application. Please try again.");
      setSubmitting(false);
      return;
    }

    router.replace("/membership-access/apply/confirmation");
  };

  if (checking) {
    return (
      <PageContainer className="flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner />
          <Text className="text-sm" style={{ color: "rgba(38,45,37,0.6)" }}>Loading...</Text>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col items-center justify-center">
      <section
        className="w-full min-h-svh flex items-center justify-center px-4 sm:px-8 py-8"
        style={{ background: COLORS.cream }}
      >
        <div className="w-full max-w-110 sm:max-w-130 rounded-xl sm:rounded-2xl bg-white/80 shadow-[0_6px_24px_rgba(40,48,38,0.08)] border border-[#D9D6CD] px-6 sm:px-8 pt-7 sm:pt-8 pb-10 sm:pb-12">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <path
                  d="M19 12H5M5 12L12 19M5 12L12 5"
                  stroke="#262D25"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <Image src={logoImage} alt="Romeo & Juliet" className="h-auto w-12 sm:w-14" priority />
          </div>

          <div className="mt-12 sm:mt-14 flex flex-col items-center text-center">
            <Text
              as="h1"
              variant="serif"
              className="text-[2rem] sm:text-[2.5rem] leading-tight mb-8 sm:mb-10"
              style={{ color: "#262D25", fontFamily: "var(--font-playfair), serif" }}
            >
              {MEMBERSHIP.applyPageTitle}
            </Text>

            <form onSubmit={handleSubmit} className="w-full max-w-75">
              <div className="mb-3 text-left">
                <label
                  htmlFor="full-name"
                  className="text-base"
                  style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {MEMBERSHIP.applyFields.fullName}
                </label>
                <input
                  id="full-name"
                  type="text"
                  value={form.fullName}
                  onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-[#D5D5D5] bg-white px-3 text-[#2A2F2A] focus:outline-none focus:border-[#708262]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                />
              </div>

              <div className="mb-3 grid grid-cols-2 gap-3">
                <div className="text-left">
                  <label
                    htmlFor="age"
                    className="text-base"
                    style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {MEMBERSHIP.applyFields.age}
                  </label>
                  <input
                    id="age"
                    type="number"
                    min={18}
                    max={120}
                    value={form.age}
                    onChange={(event) => setForm((prev) => ({ ...prev, age: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border border-[#D5D5D5] bg-white px-3 text-[#2A2F2A] focus:outline-none focus:border-[#708262]"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  />
                </div>

                <div className="text-left">
                  <label
                    htmlFor="gender"
                    className="text-base"
                    style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {MEMBERSHIP.applyFields.gender}
                  </label>
                  <select
                    id="gender"
                    value={form.gender}
                    onChange={(event) => setForm((prev) => ({ ...prev, gender: event.target.value }))}
                    className="mt-1 h-10 w-full rounded-md border border-[#D5D5D5] bg-white px-3 text-[#2A2F2A] focus:outline-none focus:border-[#708262]"
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    <option value="">Select</option>
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="mb-5 text-left">
                <label
                  htmlFor="public-profile-link"
                  className="text-base"
                  style={{ color: "rgba(38, 45, 37, 0.58)", fontFamily: "var(--font-inter), sans-serif" }}
                >
                  {MEMBERSHIP.applyFields.publicProfileLink}
                </label>
                <input
                  id="public-profile-link"
                  type="url"
                  value={form.publicProfileLink}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, publicProfileLink: event.target.value }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-[#D5D5D5] bg-white px-3 text-[#2A2F2A] focus:outline-none focus:border-[#708262]"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                />
              </div>

              {error && <Text className="text-sm text-red-600 mb-3">{error}</Text>}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 sm:h-12 rounded-full flex items-center justify-center text-white font-medium disabled:opacity-60"
                style={{ backgroundColor: "#4E5F43", fontFamily: "var(--font-inter), sans-serif" }}
              >
                {submitting ? MEMBERSHIP.applySubmitLoading : MEMBERSHIP.applySubmit}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
