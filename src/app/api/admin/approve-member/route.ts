import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const adminSecret = req.headers.get("x-admin-secret");
  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId, action } = await req.json() as { userId: string; action: string };
  if (!userId || !["approved", "rejected"].includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error: updateError } = await supabaseAdmin
    .from("membership")
    .update({
      status: action,
      approved_at: action === "approved" ? new Date().toISOString() : null,
    })
    .eq("user_id", userId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update membership" }, { status: 500 });
  }

  return NextResponse.json({ success: true, action });
}
