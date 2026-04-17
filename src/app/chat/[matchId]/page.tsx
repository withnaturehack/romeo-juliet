"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LoadingSpinner } from "@/components/ui";
import { COLORS } from "@/lib/theme";
import Image from "next/image";
import logoImage from "@/public/logo.png";

type MessageRow = {
  id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

type PartnerProfile = {
  display_name: string | null;
  main_photo_url: string | null;
};

export default function ChatPage() {
  const router = useRouter();
  const { matchId } = useParams<{ matchId: string }>();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadChat = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/");
      return;
    }
    setMyUserId(session.user.id);

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, status, matched_user_id")
      .eq("id", matchId)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (matchError || !match || match.status !== "active") {
      router.replace("/home");
      return;
    }

    const [messagesRes, partnerRes] = await Promise.all([
      supabase
        .from("messages")
        .select("id, sender_id, content, read_at, created_at")
        .eq("match_id", matchId)
        .order("created_at", { ascending: true }),
      supabase
        .from("profiles")
        .select("display_name, main_photo_url")
        .eq("user_id", match.matched_user_id)
        .maybeSingle(),
    ]);

    if (messagesRes.data) {
      setMessages(messagesRes.data);
      const unread = messagesRes.data
        .filter((m) => m.sender_id !== session.user.id && !m.read_at)
        .map((m) => m.id);
      if (unread.length > 0) {
        supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unread)
          .then(() => {});
      }
    }

    if (partnerRes.data) {
      setPartner(partnerRes.data);
    }

    setLoading(false);
  }, [matchId, router]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    if (!matchId) return;
    const channel = supabase
      .channel(`chat-${matchId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow;
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          if (myUserId && newMsg.sender_id !== myUserId && !newMsg.read_at) {
            supabase
              .from("messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMsg.id)
              .then(() => {});
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, myUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;

    setError(null);
    setSending(true);
    setDraft("");

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setError("Session expired.");
      setSending(false);
      return;
    }

    try {
      const res = await fetch(`/api/messages/${matchId}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
      setDraft(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const partnerName = partner?.display_name || "Your match";
  const partnerPhoto = partner?.main_photo_url;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: COLORS.cream }}
      >
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100svh] bg-[#F3F3F5]">
      <header className="flex items-center gap-3 px-4 py-3 border-b bg-white border-black/[0.06] shrink-0">
        <button
          type="button"
          onClick={() => router.push("/home")}
          className="p-1.5 -ml-1.5 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#2C312A]" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {partnerPhoto ? (
          <div className="h-9 w-9 rounded-full overflow-hidden border border-[#5A694F]/20 shrink-0">
            <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="h-9 w-9 rounded-full bg-[#5A694F]/15 flex items-center justify-center shrink-0">
            <span className="text-[#5A694F] text-sm font-medium">{partnerName[0]}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium text-[#2C312A] truncate"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            {partnerName}
          </p>
          <p className="text-[11px] text-[#5A694F]" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            Your introduction
          </p>
        </div>

        <Image src={logoImage} alt="Romeo & Juliet" width={56} height={28} className="h-auto w-14 shrink-0" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {messages.length === 0 && (
          <div className="flex justify-center">
            <div
              className="rounded-lg px-4 py-3 text-sm max-w-xs text-center"
              style={{
                backgroundColor: "rgba(90,105,79,0.08)",
                color: "rgba(42,47,40,0.65)",
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              You're connected. Say hello.
            </div>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === myUserId;
          const prevMsg = messages[idx - 1];
          const showTime =
            !prevMsg ||
            new Date(msg.created_at).getTime() -
              new Date(prevMsg.created_at).getTime() >
              5 * 60 * 1000;

          return (
            <div key={msg.id}>
              {showTime && (
                <div className="flex justify-center my-2">
                  <span
                    className="text-[11px] px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: "rgba(90,105,79,0.08)",
                      color: "rgba(42,47,40,0.5)",
                      fontFamily: "var(--font-inter), sans-serif",
                    }}
                  >
                    {formatMessageTime(msg.created_at)}
                  </span>
                </div>
              )}
              <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[72%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed ${
                    isMe
                      ? "rounded-br-sm text-white"
                      : "rounded-bl-sm text-[#2C312A] border"
                  }`}
                  style={{
                    backgroundColor: isMe ? "#55654C" : "#F4F4F4",
                    borderColor: isMe ? "transparent" : "rgba(0,0,0,0.08)",
                    fontFamily: "var(--font-inter), sans-serif",
                  }}
                >
                  {msg.content}
                </div>
              </div>
              {isMe && idx === messages.length - 1 && (
                <div className="flex justify-end mt-0.5">
                  <span
                    className="text-[10px]"
                    style={{ color: "rgba(42,47,40,0.4)", fontFamily: "var(--font-inter), sans-serif" }}
                  >
                    {msg.read_at ? "Read" : "Sent"}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {error && (
          <p className="text-xs text-red-600 text-center" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
            {error}
          </p>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="shrink-0 px-4 py-3 bg-white border-t border-black/[0.06]">
        <div className="flex items-center gap-2 max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Write a message…"
            className="flex-1 h-10 rounded-full px-4 text-sm bg-[#F3F3F5] border border-[#B8BCB5] text-[#2C312A] placeholder:text-[#8A8F88] focus:outline-none focus:border-[#5A694F] transition-colors"
            style={{ fontFamily: "var(--font-inter), sans-serif" }}
            disabled={sending}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!draft.trim() || sending}
            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#55654C" }}
            aria-label="Send"
          >
            {sending ? (
              <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
}

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } else if (diffDays === 1) {
    return `Yesterday ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  } else {
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
  }
}
