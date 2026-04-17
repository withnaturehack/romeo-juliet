"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Text, LoadingSpinner } from "@/components/ui";
import { COLORS } from "@/lib/theme";
import logoImage from "@/public/logo.png";

type MatchRow = {
  id: string;
  status: string;
  match_reason: string | null;
  compatibility_summary: string | null;
  introduced_at: string | null;
  user_decision: string | null;
  matched_user_id: string;
  partner_profile?: {
    display_name: string | null;
    main_photo_url: string | null;
  } | null;
};

type NotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [deciding, setDeciding] = useState<"accept" | "pass" | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);

  const loadData = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      router.replace("/");
      return;
    }

    const [matchRes, notifsRes] = await Promise.all([
      supabase
        .from("matches")
        .select(
          "id, status, match_reason, compatibility_summary, introduced_at, user_decision, matched_user_id"
        )
        .eq("user_id", session.user.id)
        .in("status", [
          "introduced",
          "accepted_by_user",
          "accepted_by_match",
          "active",
        ])
        .order("introduced_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("notifications")
        .select("id, type, title, body, link, read, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (matchRes.data) {
      const m = matchRes.data as MatchRow;
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("display_name, main_photo_url")
        .eq("user_id", m.matched_user_id)
        .maybeSingle();
      m.partner_profile = partnerProfile ?? null;
      setMatch(m);
    }

    if (notifsRes.data) {
      setNotifications(notifsRes.data);
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const channel = supabase
      .channel("home-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "matches" },
        () => loadData()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => loadData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadData]);

  const handleDecision = async (decision: "accept" | "pass") => {
    if (!match || deciding) return;
    setDecisionError(null);
    setDeciding(decision);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      setDecisionError("Session expired. Please refresh.");
      setDeciding(null);
      return;
    }

    try {
      const res = await fetch(`/api/match/${match.id}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      await loadData();
    } catch (err) {
      setDecisionError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setDeciding(null);
    }
  };

  const markNotifRead = async (id: string, link: string | null) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    if (link) router.push(link);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    <div
      className="min-h-screen flex flex-col"
      style={{ background: COLORS.cream }}
    >
      <header
        className="w-full flex items-center justify-between px-4 sm:px-8 py-4 border-b"
        style={{ borderColor: "rgba(90,105,79,0.15)" }}
      >
        <Image src={logoImage} alt="Romeo & Juliet" width={72} height={36} className="h-auto w-[72px]" priority />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/onboarding/step-2")}
            className="text-sm px-4 py-1.5 rounded-full border text-[#5A694F] hover:bg-[#EAE6DB] transition-colors"
            style={{
              borderColor: "rgba(90,105,79,0.4)",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            Edit profile
          </button>

          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative p-2 rounded-full hover:bg-[#EAE6DB] transition-colors"
            aria-label="Notifications"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-[#5A694F]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#c0392b] text-white text-[10px] flex items-center justify-center font-medium">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {showNotifications && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          onClick={() => setShowNotifications(false)}
        >
          <div
            className="w-full max-w-sm h-full bg-white shadow-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2
                className="text-base font-medium text-[#2C312A]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Notifications
              </h2>
              <button
                type="button"
                onClick={() => setShowNotifications(false)}
                className="text-[#5A694F] hover:opacity-70"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <p
                  className="text-sm text-center py-10"
                  style={{ color: "rgba(44,49,42,0.5)", fontFamily: "var(--font-inter), sans-serif" }}
                >
                  No notifications yet
                </p>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => markNotifRead(n.id, n.link)}
                    className={`w-full text-left px-5 py-4 border-b transition-colors hover:bg-[#F5F0E8] ${n.read ? "opacity-60" : ""}`}
                    style={{ borderColor: "rgba(0,0,0,0.06)" }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium text-[#2C312A] mb-0.5"
                          style={{ fontFamily: "var(--font-inter), sans-serif" }}
                        >
                          {n.title}
                          {!n.read && (
                            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#5A694F]" />
                          )}
                        </p>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: "rgba(44,49,42,0.65)", fontFamily: "var(--font-inter), sans-serif" }}
                        >
                          {n.body}
                        </p>
                      </div>
                      <span
                        className="text-[11px] shrink-0 mt-0.5"
                        style={{ color: "rgba(44,49,42,0.4)", fontFamily: "var(--font-inter), sans-serif" }}
                      >
                        {new Date(n.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 py-10">
        {match ? (
          <MatchCard
            match={match}
            deciding={deciding}
            decisionError={decisionError}
            onAccept={() => handleDecision("accept")}
            onPass={() => handleDecision("pass")}
            onOpenChat={() => router.push(`/chat/${match.id}`)}
          />
        ) : (
          <WaitingState />
        )}
      </main>

      <footer
        className="w-full py-5 flex flex-col items-center gap-2 border-t"
        style={{ borderColor: "rgba(90,105,79,0.12)" }}
      >
        <button
          type="button"
          onClick={async () => {
            await supabase.auth.signOut();
            router.push("/");
          }}
          className="text-xs"
          style={{
            color: "rgba(44,49,42,0.4)",
            fontFamily: "var(--font-inter), sans-serif",
          }}
        >
          Sign out
        </button>
      </footer>
    </div>
  );
}

function WaitingState() {
  return (
    <div className="max-w-md w-full text-center space-y-5">
      <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(90,105,79,0.08)" }}>
        <svg viewBox="0 0 24 24" className="h-9 w-9 text-[#5A694F]" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div>
        <Text
          as="h1"
          variant="serif"
          className="text-[2rem] leading-tight mb-2"
          style={{ color: "#2A2F28", fontFamily: "var(--font-playfair), serif" }}
        >
          You're in consideration
        </Text>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "rgba(42,47,40,0.6)", fontFamily: "var(--font-inter), sans-serif" }}
        >
          We're looking carefully at your profile and finding someone worth introducing. This usually takes a few days — we'll email you when there's news.
        </p>
      </div>
      <div
        className="rounded-lg px-5 py-4 text-sm text-left"
        style={{ backgroundColor: "rgba(90,105,79,0.07)", fontFamily: "var(--font-inter), sans-serif", color: "rgba(42,47,40,0.7)" }}
      >
        <p className="font-medium text-[#2A2F28] mb-1">What happens next?</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>We review your conversation with Juliet</li>
          <li>We find someone who genuinely matches</li>
          <li>You both receive an introduction</li>
          <li>If you both say yes, a conversation begins</li>
        </ul>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  deciding,
  decisionError,
  onAccept,
  onPass,
  onOpenChat,
}: {
  match: MatchRow;
  deciding: "accept" | "pass" | null;
  decisionError: string | null;
  onAccept: () => void;
  onPass: () => void;
  onOpenChat: () => void;
}) {
  const partner = match.partner_profile;
  const name = partner?.display_name || "Someone special";
  const photo = partner?.main_photo_url;
  const isActive = match.status === "active";
  const userAccepted = match.user_decision === "accepted";
  const waitingForPartner =
    userAccepted && match.status === "accepted_by_user";

  return (
    <div className="w-full max-w-md space-y-5">
      <div className="text-center">
        <p
          className="text-xs uppercase tracking-[0.22em] mb-2"
          style={{ color: "rgba(42,47,40,0.5)", fontFamily: "var(--font-inter), sans-serif" }}
        >
          {isActive ? "Your introduction" : "A new introduction"}
        </p>
        <Text
          as="h1"
          variant="serif"
          className="text-[2.2rem] leading-tight"
          style={{ color: "#2A2F28", fontFamily: "var(--font-playfair), serif" }}
        >
          {isActive ? `You're connected with ${name}` : `Meet ${name}`}
        </Text>
      </div>

      <div
        className="rounded-xl overflow-hidden border"
        style={{ borderColor: "rgba(90,105,79,0.2)" }}
      >
        {photo ? (
          <div className="aspect-[4/3] w-full overflow-hidden">
            <img
              src={photo}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="aspect-[4/3] w-full flex items-center justify-center"
            style={{ backgroundColor: "rgba(90,105,79,0.08)" }}
          >
            <div className="h-20 w-20 rounded-full bg-[#5A694F]/20 flex items-center justify-center">
              <span
                className="text-3xl text-[#5A694F]"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {name[0]}
              </span>
            </div>
          </div>
        )}

        <div className="px-5 py-4 space-y-3" style={{ backgroundColor: "rgba(90,105,79,0.04)" }}>
          {match.compatibility_summary && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(42,47,40,0.75)", fontFamily: "var(--font-inter), sans-serif" }}
            >
              {match.compatibility_summary}
            </p>
          )}
          {match.match_reason && !match.compatibility_summary && (
            <p
              className="text-sm leading-relaxed italic"
              style={{ color: "rgba(42,47,40,0.65)", fontFamily: "var(--font-inter), sans-serif" }}
            >
              "{match.match_reason}"
            </p>
          )}
        </div>
      </div>

      {decisionError && (
        <p className="text-sm text-red-600 text-center" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          {decisionError}
        </p>
      )}

      {isActive ? (
        <button
          type="button"
          onClick={onOpenChat}
          className="w-full h-12 rounded-full text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: "#5A694F", fontFamily: "var(--font-inter), sans-serif" }}
        >
          Open conversation
        </button>
      ) : waitingForPartner ? (
        <div className="text-center space-y-2">
          <div
            className="w-full h-12 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: "rgba(90,105,79,0.1)", color: "#5A694F", fontFamily: "var(--font-inter), sans-serif" }}
          >
            Waiting for {name} to respond…
          </div>
          <p className="text-xs" style={{ color: "rgba(42,47,40,0.5)", fontFamily: "var(--font-inter), sans-serif" }}>
            We'll notify you when they decide
          </p>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onPass}
            disabled={!!deciding}
            className="flex-1 h-12 rounded-full border text-sm font-medium transition-colors hover:bg-[#F0EDE7] disabled:opacity-50"
            style={{
              borderColor: "rgba(90,105,79,0.35)",
              color: "#5A694F",
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            {deciding === "pass" ? "Passing…" : "Pass"}
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={!!deciding}
            className="flex-1 h-12 rounded-full text-white font-medium text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#5A694F", fontFamily: "var(--font-inter), sans-serif" }}
          >
            {deciding === "accept" ? "Accepting…" : "Accept introduction"}
          </button>
        </div>
      )}

      {!isActive && (
        <p
          className="text-xs text-center"
          style={{ color: "rgba(42,47,40,0.45)", fontFamily: "var(--font-inter), sans-serif" }}
        >
          Both of you need to accept before a conversation begins
        </p>
      )}
    </div>
  );
}
