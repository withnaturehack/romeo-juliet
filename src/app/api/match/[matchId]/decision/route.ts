import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { matchAcceptedEmail } from "@/lib/email-templates";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);
  if (userError || !user) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

  const { decision } = (await req.json()) as { decision: "accept" | "pass" };
  if (!["accept", "pass"].includes(decision)) {
    return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
  }

  const { data: match, error: matchError } = await supabaseAdmin
    .from("matches")
    .select("id, status, user_id, matched_user_id, user_decision, matched_user_decision, introduced_at")
    .eq("id", matchId)
    .eq("user_id", user.id)
    .maybeSingle() as { data: { id: string; status: string; user_id: string; matched_user_id: string; user_decision: string | null; matched_user_decision: string | null; introduced_at: string | null } | null; error: unknown };

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  if (!["introduced", "accepted_by_match"].includes(match.status)) {
    return NextResponse.json({ error: "Match is not in a decidable state" }, { status: 400 });
  }

  if (decision === "pass") {
    await supabaseAdmin
      .from("matches")
      .update({ status: "declined", user_decision: "declined", updated_at: new Date().toISOString() })
      .eq("id", matchId);

    await supabaseAdmin.from("notifications").insert({
      user_id: match.matched_user_id,
      type: "match_declined",
      title: "Introduction not accepted",
      body: "The introduction wasn't a match this time. We'll keep looking.",
      link: "/home",
    });

    return NextResponse.json({ ok: true, status: "declined" });
  }

  const partnerAlreadyAccepted = match.status === "accepted_by_match";
  const newStatus = partnerAlreadyAccepted ? "active" : "accepted_by_user";

  await supabaseAdmin
    .from("matches")
    .update({
      status: newStatus,
      user_decision: "accepted",
      introduced_at: match.introduced_at ?? new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (partnerAlreadyAccepted) {
    const [userProfileRes, partnerProfileRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("user_id", match.matched_user_id)
        .maybeSingle(),
    ]);

    const userName = userProfileRes.data?.display_name || "Someone";
    const partnerName = partnerProfileRes.data?.display_name || "Someone";

    await Promise.all([
      supabaseAdmin.from("notifications").insert({
        user_id: user.id,
        type: "match_accepted",
        title: `${partnerName} accepted your introduction`,
        body: "You're both ready. Say something.",
        link: `/chat/${matchId}`,
      }),
      supabaseAdmin.from("notifications").insert({
        user_id: match.matched_user_id,
        type: "match_accepted",
        title: `${userName} accepted the introduction`,
        body: "You're both connected. Start a conversation.",
        link: `/chat/${matchId}`,
      }),
    ]);

    const [userAuthRes, partnerAuthRes] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(user.id),
      supabaseAdmin.auth.admin.getUserById(match.matched_user_id),
    ]);

    const userEmail = userAuthRes.data.user?.email;
    const partnerEmail = partnerAuthRes.data.user?.email;

    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: "Your introduction is active",
        html: matchAcceptedEmail(userName, partnerName),
      });
    }
    if (partnerEmail) {
      await sendEmail({
        to: partnerEmail,
        subject: "Your introduction is active",
        html: matchAcceptedEmail(partnerName, userName),
      });
    }
  } else {
    await supabaseAdmin.from("notifications").insert({
      user_id: match.matched_user_id,
      type: "new_match",
      title: "Introduction response needed",
      body: "Someone has accepted your introduction. Will you say yes?",
      link: "/home",
    });
  }

  return NextResponse.json({ ok: true, status: newStatus });
}
