import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { newMessageEmail } from "@/lib/email-templates";

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

  const { content } = (await req.json()) as { content: string };
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message content required" }, { status: 400 });
  }

  const { data: match, error: matchError } = await supabaseAdmin
    .from("matches")
    .select("id, status, user_id, matched_user_id")
    .eq("id", matchId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (matchError || !match) {
    return NextResponse.json({ error: "Match not found or not active" }, { status: 404 });
  }

  const { data: message, error: insertError } = await supabaseAdmin
    .from("messages")
    .insert({
      match_id: matchId,
      sender_id: user.id,
      content: content.trim(),
    })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  const recipientId = match.matched_user_id;

  await supabaseAdmin.from("notifications").insert({
    user_id: recipientId,
    type: "new_message",
    title: "New message",
    body: content.length > 60 ? content.slice(0, 57) + "…" : content,
    link: `/chat/${matchId}`,
  });

  const [senderProfileRes, recipientAuthRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("display_name").eq("user_id", user.id).maybeSingle(),
    supabaseAdmin.auth.admin.getUserById(recipientId),
  ]);

  const senderName = senderProfileRes.data?.display_name || "Your match";
  const recipientEmail = recipientAuthRes.data.user?.email;

  if (recipientEmail) {
    await sendEmail({
      to: recipientEmail,
      subject: `New message from ${senderName}`,
      html: newMessageEmail(senderName),
    });
  }

  return NextResponse.json({ ok: true, message });
}
