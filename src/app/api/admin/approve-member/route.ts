import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { membershipApprovedEmail } from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, action } = (await req.json()) as {
    userId: string;
    action: "approved" | "rejected";
  };

  if (!userId || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("membership")
    .update({
      status: action,
      approved_at: action === "approved" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to update membership" },
      { status: 500 }
    );
  }

  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
  const email = authUser?.user?.email;
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name")
    .eq("user_id", userId)
    .maybeSingle();
  const name =
    profile?.display_name ||
    authUser?.user?.user_metadata?.full_name ||
    "Member";

  if (action === "approved") {
    await supabaseAdmin
      .from("profiles")
      .upsert(
        { user_id: userId },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      type: "membership_approved",
      title: "Welcome to Romeo & Juliet",
      body: "Your membership has been approved. Start your journey with Juliet.",
      link: "/onboarding",
    });

    if (email) {
      await sendEmail({
        to: email,
        subject: "You're in — Romeo & Juliet",
        html: membershipApprovedEmail(name),
      });
    }
  }

  return NextResponse.json({ success: true, action });
}
