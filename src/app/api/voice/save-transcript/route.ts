import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "");
    if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Unauthorized or missing Supabase config" },
        { status: 401 }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const { transcript, conversationId } = (await req.json()) as {
      transcript: { role: string; content: string }[];
      conversationId?: string;
    };
    if (!Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: "transcript array required" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {
      conversation_transcript: transcript,
      voice_conversation_completed: true,
    };
    if (conversationId) {
      updatePayload.elevenlabs_conversation_id = conversationId;
    }

    let { error: updateError } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("user_id", user.id);

    // Backward compatibility: some DBs may not have this column yet.
    if (
      updateError?.code === "PGRST204" &&
      updateError.message?.includes("voice_conversation_completed")
    ) {
      const fallbackPayload: Record<string, unknown> = {
        conversation_transcript: transcript,
      };
      if (conversationId) {
        fallbackPayload.elevenlabs_conversation_id = conversationId;
      }

      ({ error: updateError } = await supabase
        .from("profiles")
        .update(fallbackPayload)
        .eq("user_id", user.id));
    }

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json(
        { error: "Failed to save transcript" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Save transcript error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Save failed" },
      { status: 500 }
    );
  }
}
