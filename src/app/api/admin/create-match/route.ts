import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { newMatchEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, matchedUserId, matchReason, compatibilitySummary } =
    (await req.json()) as {
      userId: string;
      matchedUserId: string;
      matchReason?: string;
      compatibilitySummary?: string;
    };

  if (!userId || !matchedUserId) {
    return NextResponse.json(
      { error: "userId and matchedUserId required" },
      { status: 400 }
    );
  }

  if (userId === matchedUserId) {
    return NextResponse.json(
      { error: "Cannot match a user with themselves" },
      { status: 400 }
    );
  }

  const [memberA, memberB] = await Promise.all([
    supabaseAdmin
      .from("membership")
      .select("status")
      .eq("user_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("membership")
      .select("status")
      .eq("user_id", matchedUserId)
      .maybeSingle(),
  ]);

  if (
    memberA.data?.status !== "approved" ||
    memberB.data?.status !== "approved"
  ) {
    return NextResponse.json(
      { error: "Both users must be approved members" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { data: matchA, error: errorA } = await supabaseAdmin
    .from("matches")
    .insert({
      user_id: userId,
      matched_user_id: matchedUserId,
      status: "introduced",
      match_reason: matchReason ?? null,
      compatibility_summary: compatibilitySummary ?? null,
      introduced_at: now,
    })
    .select()
    .single();

  if (errorA) {
    return NextResponse.json(
      { error: "Failed to create match record A: " + errorA.message },
      { status: 500 }
    );
  }

  const { data: matchB, error: errorB } = await supabaseAdmin
    .from("matches")
    .insert({
      user_id: matchedUserId,
      matched_user_id: userId,
      status: "introduced",
      match_reason: matchReason ?? null,
      compatibility_summary: compatibilitySummary ?? null,
      introduced_at: now,
    })
    .select()
    .single();

  if (errorB) {
    await supabaseAdmin.from("matches").delete().eq("id", matchA.id);
    return NextResponse.json(
      { error: "Failed to create match record B: " + errorB.message },
      { status: 500 }
    );
  }

  const [profileA, profileB] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("profiles")
      .select("display_name")
      .eq("user_id", matchedUserId)
      .maybeSingle(),
  ]);

  const nameA = profileA.data?.display_name || "Someone special";
  const nameB = profileB.data?.display_name || "Someone special";

  await Promise.all([
    supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "new_match",
      title: `Meet ${nameB}`,
      body:
        compatibilitySummary ||
        matchReason ||
        "We have someone we'd like to introduce you to.",
      link: "/home",
    }),
    supabaseAdmin.from("notifications").insert({
      user_id: matchedUserId,
      type: "new_match",
      title: `Meet ${nameA}`,
      body:
        compatibilitySummary ||
        matchReason ||
        "We have someone we'd like to introduce you to.",
      link: "/home",
    }),
  ]);

  const [authA, authB] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(userId),
    supabaseAdmin.auth.admin.getUserById(matchedUserId),
  ]);

  if (authA.data.user?.email) {
    await sendEmail({
      to: authA.data.user.email,
      subject: `A new introduction — ${nameB}`,
      html: newMatchEmail(nameA),
    });
  }
  if (authB.data.user?.email) {
    await sendEmail({
      to: authB.data.user.email,
      subject: `A new introduction — ${nameA}`,
      html: newMatchEmail(nameB),
    });
  }

  return NextResponse.json({
    ok: true,
    matchIds: { userMatch: matchA.id, partnerMatch: matchB.id },
  });
}
