import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const JULIET_AGENT_ID = "agent_1301kjdtzaf1ej8rccjms7v3af48";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export async function GET(req: Request) {
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

    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${JULIET_AGENT_ID}`,
      {
        headers: { "xi-api-key": apiKey },
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs token error:", response.status, errText);
      return NextResponse.json(
        { error: "Failed to get conversation token" },
        { status: 502 }
      );
    }

    const { token: conversationToken } = (await response.json()) as {
      token: string;
    };
    return NextResponse.json({ token: conversationToken });
  } catch (err) {
    console.error("ElevenLabs token error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Token request failed" },
      { status: 500 }
    );
  }
}
