"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useConversation } from "@elevenlabs/react";
import julietFadedImage from "@/public/Juliet-faded.png";
import { supabase } from "@/lib/supabaseClient";
import { VOICE } from "@/config/site";
import { COLORS } from "@/lib/theme";

type TranscriptEntry = { role: "assistant" | "user"; content: string };

export default function VoicePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<"conversation" | "saving">("conversation");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const pendingTypedMessagesRef = useRef<string[]>([]);
  const skipSaveOnDisconnectRef = useRef(false);
  const conversationIdRef = useRef<string | undefined>(undefined);
  const hasAutoStartedRef = useRef(false);

  const saveTranscriptAndRedirect = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setError(VOICE.errorSessionExpired);
      return;
    }

    const latestTranscript = transcriptRef.current;
    if (latestTranscript.length === 0) {
      router.replace("/");
      return;
    }

    setPhase("saving");
    try {
      const payload = latestTranscript.map((entry) => ({ role: entry.role, content: entry.content }));
      const conversationId = conversationIdRef.current;
      const res = await fetch("/api/voice/save-transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ transcript: payload, ...(conversationId && { conversationId }) }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save transcript");
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : VOICE.errorSaveSummary);
      setPhase("conversation");
    }
  }, [router]);

  const conversation = useConversation({
    micMuted: !isMicActive,
    volume: isSpeakerMuted ? 0 : 1,
    onConnect: ({ conversationId }) => {
      conversationIdRef.current = conversationId;
      setError(null);
      setIsReconnecting(false);
      setIsMicActive(false);
    },
    onDisconnect: () => {
      setIsMicActive(false);
      if (skipSaveOnDisconnectRef.current) {
        skipSaveOnDisconnectRef.current = false;
        return;
      }
      saveTranscriptAndRedirect();
    },
    onMessage: (payload) => {
      const role: "user" | "assistant" = payload.role === "user" ? "user" : "assistant";
      const content = (payload.message || "").trim();
      if (!content) return;

      if (role === "user" && pendingTypedMessagesRef.current[0] === content) {
        pendingTypedMessagesRef.current.shift();
        return;
      }

      const entry: TranscriptEntry = { role, content };
      setTranscript((prev) => {
        const next = [...prev, entry];
        transcriptRef.current = next;
        return next;
      });
    },
    onError: (message) => {
      setError(message || "Connection error");
      setIsReconnecting(false);
    },
  });

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    if (conversation.isSpeaking && isMicActive) {
      setIsMicActive(false);
    }
  }, [conversation.isSpeaking, isMicActive]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) router.replace("/");
    };
    init();
  }, [router]);

  const startConversation = useCallback(async () => {
    setError(null);
    setDraft("");

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError(VOICE.errorMicrophone);
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(VOICE.errorSessionExpired);
        return;
      }

      const tokenRes = await fetch("/api/voice/elevenlabs-token", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) {
        throw new Error(tokenData.error || "Failed to start conversation");
      }

      pendingTypedMessagesRef.current = [];
      setPhase("conversation");
      await conversation.startSession({
        conversationToken: tokenData.token,
        connectionType: "webrtc",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect");
    }
  }, [conversation]);

  useEffect(() => {
    if (hasAutoStartedRef.current) return;
    if (conversation.status !== "disconnected" || phase !== "conversation") return;
    hasAutoStartedRef.current = true;
    startConversation();
  }, [conversation.status, phase, startConversation]);

  const handleEndSession = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleReconnectVoice = useCallback(async () => {
    if (phase === "saving" || isReconnecting) return;

    setError(null);
    setIsReconnecting(true);

    try {
      if (conversation.status === "connected" || conversation.status === "connecting") {
        skipSaveOnDisconnectRef.current = true;
        await conversation.endSession();
      }
    } catch {
      skipSaveOnDisconnectRef.current = false;
    }

    await startConversation();
  }, [conversation, isReconnecting, phase, startConversation]);

  const handleMicToggle = useCallback(() => {
    if (conversation.status !== "connected" || phase === "saving" || conversation.isSpeaking) {
      return;
    }
    setIsMicActive((prev) => !prev);
  }, [conversation.isSpeaking, conversation.status, phase]);

  const appendTranscript = useCallback((entry: TranscriptEntry) => {
    setTranscript((prev) => {
      const next = [...prev, entry];
      transcriptRef.current = next;
      return next;
    });
  }, []);

  const handleSendText = useCallback(() => {
    const text = draft.trim();
    if (!text || conversation.status !== "connected" || phase === "saving") {
      return;
    }

    pendingTypedMessagesRef.current.push(text);
    appendTranscript({ role: "user", content: text });
    conversation.sendUserMessage(text);
    setDraft("");
    setError(null);
  }, [appendTranscript, conversation, draft, phase]);

  const isSaving = phase === "saving";

  return (
    <main className="h-[100svh] overflow-hidden px-3 py-3 sm:px-6 sm:py-6" style={{ background: COLORS.cream }}>
      <div className="mx-auto flex h-full w-full max-w-[860px] flex-col rounded-lg border border-[#D1CEC6] bg-[#F3F3F5] p-4 shadow-[0_10px_35px_rgba(40,48,38,0.08)] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-1 text-[#2C312A] hover:opacity-70 transition-opacity"
            aria-label="Go back"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <Image src="/logo.png" alt="Romeo & Juliet" width={78} height={39} className="h-auto w-[78px]" priority />
        </div>

        <div className="mb-7 hidden items-center justify-center gap-3 text-[13px] sm:flex" style={{ color: "rgba(44,49,42,0.65)", fontFamily: "var(--font-inter), sans-serif" }}>
          <span className="inline-flex h-3 w-3 rounded-full border-2 border-[#5A694F]" />
          <div className="h-px w-16 bg-[#BCC0B9]" />
          <span className="inline-flex h-3 w-3 rounded-full bg-[#BCC0B9]" />
          <div className="h-px w-16 bg-[#BCC0B9]" />
          <span className="inline-flex h-3 w-3 rounded-full bg-[#BCC0B9]" />
          <div className="h-px w-16 bg-[#BCC0B9]" />
          <span className="inline-flex h-3 w-3 rounded-full bg-[#BCC0B9]" />
        </div>

        <section className="mx-auto flex min-h-0 flex-1 w-full max-w-[760px] flex-col">
          <header className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-[#5A694F]">
                <Image src={julietFadedImage} alt="Juliet" width={48} height={48} className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-[2rem] leading-none" style={{ color: "#2C312A", fontFamily: "var(--font-playfair), serif" }}>
                  Juliet
                </p>
                <button
                  type="button"
                  onClick={() => setIsSpeakerMuted((prev) => !prev)}
                  disabled={isSaving || conversation.status !== "connected"}
                  className="text-[#5A694F] disabled:opacity-45"
                  aria-label={isSpeakerMuted ? "Unmute Juliet voice" : "Mute Juliet voice"}
                >
                  {isSpeakerMuted ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                      <path d="m22 9-6 6" />
                      <path d="m16 9 6 6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReconnectVoice}
              disabled={isSaving || isReconnecting}
              className="rounded-full border border-[#BCC0B9] px-3 py-1 text-xs text-[#5A694F] hover:bg-[#E9E9EA] disabled:opacity-45"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              {isReconnecting ? "Reconnecting..." : "Reconnect"}
            </button>
          </header>

          <main className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {transcript.length === 0 ? (
              <div className="max-w-[58%] rounded-lg border border-[#A8AEA3] bg-[#F4F4F4] px-3 py-2 text-[15px] leading-relaxed text-[#3A4037]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                You can speak naturally. Take your time.
              </div>
            ) : null}

            {transcript.map((entry, i) => {
              const isAssistant = entry.role === "assistant";
              return (
                <div key={`${entry.role}-${i}-${entry.content.slice(0, 24)}`} className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[68%] rounded-lg px-3 py-2 text-[15px] leading-relaxed ${
                      isAssistant
                        ? "border border-[#A8AEA3] bg-[#F4F4F4] text-[#3A4037]"
                        : "bg-[#55654C] text-[#F3F3F3]"
                    }`}
                    style={{ fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {entry.content}
                  </div>
                </div>
              );
            })}

            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div ref={transcriptEndRef} />
          </main>

          <footer className="mt-4">
            <div className="flex items-center gap-2">
              <div className="flex h-11 flex-1 items-center rounded-[10px] border border-[#B8BCB5] bg-[#F4F4F4] px-3">
                <span className="mr-2 text-lg text-[#80867E]">+</span>
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSendText();
                    }
                  }}
                  disabled={conversation.status !== "connected" || isSaving}
                  placeholder="Type here"
                  className="h-full flex-1 bg-transparent text-sm text-[#343A32] placeholder:text-[#8A8F88] focus:outline-none disabled:opacity-50"
                  style={{ fontFamily: "var(--font-inter), sans-serif" }}
                />
                <button
                  type="button"
                  onClick={handleSendText}
                  disabled={!draft.trim() || conversation.status !== "connected" || isSaving}
                  className="text-[#80867E] disabled:opacity-40"
                  aria-label="Send message"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 2 11 13" />
                    <path d="m22 2-7 20-4-9-9-4Z" />
                  </svg>
                </button>
              </div>

              <button
                type="button"
                disabled={conversation.status !== "connected" || isSaving || conversation.isSpeaking}
                onClick={handleMicToggle}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40 ${isMicActive ? "bg-[#41503B] text-white" : "bg-[#55654C] text-white"}`}
                aria-label={isMicActive ? "Stop listening" : "Start listening"}
                title={isMicActive ? "Tap when done" : "Tap to speak"}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3Z" />
                  <path d="M19 11a7 7 0 0 1-14 0" />
                  <path d="M12 18v3" />
                </svg>
              </button>
            </div>

            <p className="mt-3 text-center text-sm" style={{ color: "rgba(60,66,56,0.55)", fontFamily: "var(--font-inter), sans-serif" }}>
              {isSaving ? VOICE.statusSaving : "Your conversation is private and secure"}
            </p>

            <button
              type="button"
              onClick={handleEndSession}
              disabled={isSaving || conversation.status !== "connected"}
              className="mx-auto mt-3 block rounded-full border border-[#B8BCB5] px-4 py-1 text-xs text-[#5A694F] disabled:opacity-40"
              style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
              End + Save
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}
