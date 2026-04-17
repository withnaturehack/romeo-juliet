"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Text, Divider, PageContainer } from "@/components/ui";
import { PHOTO_GUIDANCE } from "@/config/site";
import { COLORS } from "@/lib/theme";

const BUCKET_NAME = "profile-images";

type Profile = {
  display_name: string | null;
  social_link: string | null;
  main_photo_url: string | null;
  photo2_url: string | null;
  photo3_url: string | null;
};

export default function OnboardingStep3Page() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [socialLink, setSocialLink] = useState("");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState<string | null>(null);
  const [preview2, setPreview2] = useState<string | null>(null);
  const [preview3, setPreview3] = useState<string | null>(null);
  const [existingMainUrl, setExistingMainUrl] = useState<string | null>(null);
  const [existingUrl2, setExistingUrl2] = useState<string | null>(null);
  const [existingUrl3, setExistingUrl3] = useState<string | null>(null);
  const [photoGuidanceSlot, setPhotoGuidanceSlot] = useState<"photo1" | "photo2" | "photo3" | null>(null);

  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);

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
        .select("display_name, social_link, main_photo_url, photo2_url, photo3_url")
        .eq("user_id", session.user.id)
        .limit(1);
      const profile = data?.[0] as Profile | undefined;
      if (profile) {
        setSocialLink(profile.social_link ?? "");
        setExistingMainUrl(profile.main_photo_url);
        setExistingUrl2(profile.photo2_url);
        setExistingUrl3(profile.photo3_url);
        setMainPreview(profile.main_photo_url);
        setPreview2(profile.photo2_url);
        setPreview3(profile.photo3_url);
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const handleFileChange = (
    file: File | null,
    setFile: (f: File | null) => void,
    setPreview: (url: string | null) => void,
  ) => {
    setFile(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const openPhotoGuidance = (slot: "photo1" | "photo2" | "photo3") => {
    setPhotoGuidanceSlot(slot);
  };

  const closePhotoGuidanceAndOpenPicker = () => {
    const slot = photoGuidanceSlot;
    setPhotoGuidanceSlot(null);
    if (slot === "photo1") input1Ref.current?.click();
    else if (slot === "photo2") input2Ref.current?.click();
    else if (slot === "photo3") input3Ref.current?.click();
  };

  const uploadImage = async (
    uid: string,
    file: File | null,
    slot: string,
    existingUrl: string | null
  ): Promise<string | null> => {
    if (!file && existingUrl) return existingUrl;
    if (!file) return null;
    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${uid}/${slot}-${Date.now()}.${ext}`;
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data: publicData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
    return publicData.publicUrl;
  };

  const handleSave = async () => {
    setError(null);
    if (!userId) return;
    setSaving(true);
    try {
      const [mainUrl, url2, url3] = await Promise.all([
        uploadImage(userId, mainFile, "main", existingMainUrl),
        uploadImage(userId, file2, "secondary", existingUrl2),
        uploadImage(userId, file3, "tertiary", existingUrl3),
      ]);
      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: userId,
            social_link: socialLink.trim() || null,
            main_photo_url: mainUrl,
            photo2_url: url2,
            photo3_url: url3,
            is_complete: true,
          },
          { onConflict: "user_id" }
        );
      if (upsertError) throw upsertError;
      router.replace("/voice");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageContainer className="flex items-center justify-center">
        <Text>Loading…</Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex flex-col px-8 pt-20 sm:pt-24 pb-10">
      <header className="w-full flex flex-col items-start mb-10">
        <Text as="h2" variant="serif" className="text-3xl leading-tight font-normal text-white">
          Your profile
        </Text>
        <Text className="text-white/60 text-sm mt-2">Add photos and a social link.</Text>
      </header>

      <main className="w-full max-w-xs flex flex-col space-y-6">
        <div className="space-y-4">
          <Input
            label="Social profile link"
            id="social-link"
            type="url"
            placeholder="instagram.com/yourname"
            value={socialLink}
            onChange={(e) => setSocialLink(e.target.value)}
          />
          <div>
            <Text as="span" variant="label" className="block mb-2">
              Photos
            </Text>
            <div className="grid grid-cols-[2fr_1fr] gap-2">
              <input
                ref={input1Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null, setMainFile, setMainPreview)}
              />
              <input
                ref={input2Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null, setFile2, setPreview2)}
              />
              <input
                ref={input3Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null, setFile3, setPreview3)}
              />

              <button
                type="button"
                onClick={() => openPhotoGuidance("photo1")}
                className="block aspect-[4/3] rounded-lg border border-white/20 bg-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden p-2 text-center hover:border-white/30 transition-colors">
                {mainPreview ? (
                  <img src={mainPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white/50 text-xs leading-tight">A moment that feels like me</span>
                )}
              </button>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => openPhotoGuidance("photo2")}
                  className="block aspect-square rounded-lg border border-white/20 bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden p-2 text-center hover:border-white/30 transition-colors">
                  {preview2 ? (
                    <img src={preview2} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/50 text-[10px] leading-tight">Doing something I&apos;d love to share with someone</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => openPhotoGuidance("photo3")}
                  className="block aspect-square rounded-lg border border-white/20 bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden p-2 text-center hover:border-white/30 transition-colors">
                  {preview3 ? (
                    <img src={preview3} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white/50 text-[10px] leading-tight">With people or in a place that shaped me</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && <Text className="text-sm text-red-400">{error}</Text>}

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Continue"}
        </Button>
      </main>

      <footer className="w-full mt-auto pt-10">
        <div className="flex flex-col items-center space-y-6">
          <Divider />
          <Text className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Step 3 of 4
          </Text>
        </div>
      </footer>

      <div className="fixed bottom-6 left-6 opacity-10 pointer-events-none">
        <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
          <Text as="span" variant="serif" className="text-[10px] font-bold italic">N</Text>
        </div>
      </div>

      {/* Photo guidance modal */}
      {photoGuidanceSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo upload guidance"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPhotoGuidanceSlot(null)}
            aria-hidden="true"
          />
          <div
            className="relative w-full max-w-md rounded-xl p-6 sm:p-8 shadow-xl max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: COLORS.cream, color: COLORS.sage }}
          >
            {photoGuidanceSlot === "photo1" && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-base" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {PHOTO_GUIDANCE.photo1.title}
                </h3>
                <ul className="space-y-2 text-sm list-disc list-inside" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  {PHOTO_GUIDANCE.photo1.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {photoGuidanceSlot === "photo2" && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-base" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {PHOTO_GUIDANCE.photo2.title}
                </h3>
                <ul className="space-y-2 text-sm list-disc list-inside" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  {PHOTO_GUIDANCE.photo2.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}
            {photoGuidanceSlot === "photo3" && (
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-base" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {PHOTO_GUIDANCE.photo3.title}
                </h3>
                <ul className="space-y-2 text-sm list-disc list-inside" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  {PHOTO_GUIDANCE.photo3.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs opacity-75 mb-6 italic" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
              {PHOTO_GUIDANCE.footer}
            </p>

            <div className="flex gap-3">
              <Button
                onClick={closePhotoGuidanceAndOpenPicker}
                className="flex-1"
                style={{ background: COLORS.sage, color: COLORS.cream }}
              >
                {PHOTO_GUIDANCE.buttonContinue}
              </Button>
              <button
                type="button"
                onClick={() => setPhotoGuidanceSlot(null)}
                className="px-4 py-2 text-sm opacity-70 hover:opacity-100 transition-opacity"
                style={{ fontFamily: "var(--font-inter), sans-serif" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
