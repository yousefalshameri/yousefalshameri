import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { runHrAgent, type AgentMessage } from "@/lib/agent/run";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_HISTORY = 20;

function isValidHistory(value: unknown): value is AgentMessage[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= MAX_HISTORY &&
    value.every(
      (m): m is AgentMessage =>
        typeof m === "object" &&
        m !== null &&
        ((m as AgentMessage).role === "user" ||
          (m as AgentMessage).role === "assistant") &&
        typeof (m as AgentMessage).content === "string" &&
        (m as AgentMessage).content.trim().length > 0,
    )
  );
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "المساعد غير مُفعّل: مفتاح ANTHROPIC_API_KEY غير مضبوط." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "صيغة الطلب غير صالحة." }, { status: 400 });
  }

  const messages = (body as { messages?: unknown })?.messages;
  if (!isValidHistory(messages)) {
    return NextResponse.json(
      { error: `سجل المحادثة غير صالح أو تجاوز ${MAX_HISTORY} رسالة.` },
      { status: 400 },
    );
  }

  try {
    const result = await runHrAgent(messages);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "مفتاح الـ API غير صالح." },
        { status: 502 },
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "تم تجاوز حد الطلبات. أعد المحاولة بعد قليل." },
        { status: 429 },
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `خطأ من الـ API (${error.status}).` },
        { status: 502 },
      );
    }
    console.error("[hr-agent]", error);
    return NextResponse.json(
      { error: "خطأ غير متوقع أثناء تشغيل المساعد." },
      { status: 500 },
    );
  }
}
