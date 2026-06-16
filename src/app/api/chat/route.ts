import { NextRequest, NextResponse } from "next/server";
import { chatWithVisitor } from "@/ai/agents/chatWithVisitor";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import type { ModelMessage } from "ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rl = rateLimit(`chat:${ip}`, 20, 60_000); // 20 msgs/min per IP
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please slow down." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const { messages }: { messages: ChatMessage[] } = await req.json();

    const coreMessages: ModelMessage[] = messages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    const reply = await chatWithVisitor(coreMessages);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Failed to get response. Please try again." },
      { status: 500 }
    );
  }
}
