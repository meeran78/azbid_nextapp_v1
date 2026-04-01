import { NextResponse } from "next/server";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(12_000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).max(40),
});

const SYSTEM_PROMPT = `You are AzBid Assistant, a helpful guide for the AzBid online auction marketplace.
Help users understand bidding, stores, lots, payments, shipping, and account basics.
Be concise, friendly, and accurate. If you do not know something specific about a user's order or account, say so and suggest they check their dashboard or contact support at info@az-bid.com.
Do not invent policies, prices, or legal terms.`;

export const maxDuration = 60;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI chat is not configured. Set OPENAI_API_KEY in the environment." },
      { status: 503 }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid messages", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { messages } = parsed.data;
  const model = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    }),
  });

  if (!upstream.ok) {
    const errText = await upstream.text().catch(() => "");
    console.error("OpenAI chat error:", upstream.status, errText);
    return NextResponse.json(
      { error: "The assistant could not respond. Try again in a moment." },
      { status: 502 }
    );
  }

  if (!upstream.body) {
    return NextResponse.json({ error: "Empty response from model" }, { status: 502 });
  }

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
