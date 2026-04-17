"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import julietImage from "@/public/Juliet-faded.png";
import { supabase } from "@/lib/supabaseClient";

type ChatMessage = {
  id: number;
  from: "juliet" | "romeo";
  type: "text" | "audio";
  content: string;
  time: string;
};

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    from: "juliet",
    type: "text",
    content:
      "I loved the AI's recommendation, your profile is poetic! It said our voices matched perfectly. 🌿",
    time: "10:42 AM",
  },
  {
    id: 2,
    from: "romeo",
    type: "text",
    content:
      "I agree! The Voice AI really knows my type. It caught that specific tone I use when I'm excited. How are you today?",
    time: "10:45 AM",
  },
  {
    id: 3,
    from: "juliet",
    type: "text",
    content:
      "I'm doing great! Just drinking some matcha and thinking about our chat. 🍵",
    time: "10:47 AM",
  },
  {
    id: 4,
    from: "romeo",
    type: "audio",
    content: "0:12",
    time: "10:48 AM",
  },
];

export default function JulietChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace("/");
    });
  }, [router]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const nextId = (messages[messages.length - 1]?.id ?? 0) + 1;
    setMessages([
      ...messages,
      {
        id: nextId,
        from: "romeo",
        type: "text",
        content: trimmed,
        time: "Now",
      },
    ]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-[#f4f5f2] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b border-black/5 bg-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-black/5"
            aria-label="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#e0e5db]">
              <Image
                src={julietImage}
                alt="Juliet"
                className="w-full h-full object-cover"
                width={32}
                height={32}
              />
            </div>
            <div>
              <p className="text-sm font-semibold">Juliet</p>
              <p className="text-[11px] text-[#2e7d32] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                Online now
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 text-gray-700">
          <button
            type="button"
            className="p-2 rounded-full hover:bg-black/5"
            aria-label="Call"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.95" />
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
            </svg>
          </button>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-black/5"
            aria-label="Info"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </button>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 px-3 py-3 space-y-2 overflow-y-auto max-w-md mx-auto w-full">
        <div className="flex items-center justify-center my-2">
          <span className="text-[11px] px-3 py-1 rounded-full bg-white/70 text-gray-500">
            TODAY
          </span>
        </div>
        {messages.map((m) => {
          const isJuliet = m.from === "juliet";
          const isAudio = m.type === "audio";
          return (
            <div
              key={m.id}
              className={`flex mb-1 ${isJuliet ? "justify-start" : "justify-end"
                }`}
            >
              <div className="max-w-[80%] flex gap-2 items-end">
                {isJuliet && (
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-[#e0e5db]">
                    <Image
                      src={julietImage}
                      alt="Juliet"
                      className="w-full h-full object-cover"
                      width={28}
                      height={28}
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${isAudio
                        ? "bg-[#d8e5d5] text-gray-900 flex items-center gap-3"
                        : isJuliet
                          ? "bg-white text-gray-900"
                          : "bg-[#2e4a35] text-white rounded-br-none"
                      }`}
                  >
                    {isAudio ? (
                      <>
                        <div className="w-7 h-7 rounded-full bg-[#2e7d32] flex items-center justify-center text-white">
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                        <div className="flex-1 h-6 flex items-center gap-1">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <span
                              key={i}
                              className="w-1 rounded-full bg-[#2e7d32]"
                              style={{ height: `${8 + i * 4}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-700">
                          {m.content}
                        </span>
                      </>
                    ) : (
                      m.content
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-gray-400 mt-0.5 ${isJuliet ? "text-left" : "text-right"
                      }`}
                  >
                    {m.time}
                  </span>
                </div>
                {!isJuliet && (
                  <div className="w-7 h-7 rounded-full bg-[#e0e5db] flex items-center justify-center text-xs font-semibold">
                    R
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Input bar */}
      <footer className="border-t border-black/5 bg-white px-3 py-2 flex items-center gap-2 max-w-md mx-auto w-full">
        <button
          type="button"
          className="w-8 h-8 rounded-full bg-[#e0e5db] flex items-center justify-center"
        >
          <span className="w-3 h-3 border border-gray-600 rounded-sm" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full bg-[#f4f5f2] px-3 py-2 text-sm focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSend}
          className="w-8 h-8 rounded-full bg-[#2e7d32] flex items-center justify-center text-white disabled:opacity-40"
          disabled={!input.trim()}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </footer>
    </div>
  );
}

