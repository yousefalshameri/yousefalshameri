"use client";

import { useRef, useState } from "react";
import PageHeader from "@/components/PageHeader";
import type { AgentMessage, ToolCall } from "@/lib/agent/run";

interface Turn extends AgentMessage {
  toolCalls?: ToolCall[];
}

const SUGGESTIONS = [
  "منو الموظفين اللي على إجازة حالياً؟",
  "كم طلب إجازة بانتظار الاعتماد؟",
  "عطني حضور اليوم ٢٠٢٦-٠٩-١٨",
  "منو أطول موظف بالخدمة في تقنية المعلومات؟",
];

const TOOL_LABELS: Record<string, string> = {
  search_employees: "بحث في سجل الموظفين",
  get_employee_details: "تفاصيل موظف",
  list_leave_requests: "طلبات الإجازات",
  get_attendance_summary: "كشف الحضور",
};

export default function AssistantPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;

    const history: Turn[] = [...turns, { role: "user", content: question }];
    setTurns(history);
    setDraft("");
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "تعذّر الاتصال بالمساعد.");
        return;
      }

      setTurns([
        ...history,
        { role: "assistant", content: payload.text, toolCalls: payload.toolCalls },
      ]);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setBusy(false);
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      <PageHeader
        title="المساعد الذكي"
        subtitle="يجيب على استفسارات الموظفين والإجازات والحضور من بيانات النظام"
      />

      {turns.length === 0 ? (
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-xl border border-border bg-surface px-4 py-3 text-right text-sm transition hover:border-brand hover:text-brand"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-4">
        {turns.map((turn, i) => (
          <div
            key={i}
            className={turn.role === "user" ? "flex justify-start" : "flex justify-end"}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap ${
                turn.role === "user"
                  ? "bg-brand text-white"
                  : "border border-border bg-surface"
              }`}
            >
              {turn.toolCalls && turn.toolCalls.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-1">
                  {turn.toolCalls.map((call, j) => (
                    <span
                      key={j}
                      className="rounded-md bg-brand-soft px-2 py-1 text-xs text-brand"
                    >
                      {TOOL_LABELS[call.name] ?? call.name}
                    </span>
                  ))}
                </div>
              ) : null}
              {turn.content}
            </div>
          </div>
        ))}

        {busy ? (
          <p className="text-sm text-muted">المساعد يراجع بيانات النظام…</p>
        ) : null}
        {error ? (
          <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-400">
            {error}
          </p>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="mt-6 flex gap-2"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="اكتب استفسارك…"
          disabled={busy}
          className="flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-brand disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || draft.trim().length === 0}
          className="rounded-xl bg-brand px-5 py-3 text-sm font-medium text-white transition disabled:opacity-40"
        >
          إرسال
        </button>
      </form>

      <p className="mt-3 text-xs text-muted">
        المساعد للاستعلام فقط — لا يعتمد إجازات ولا يعدّل السجلات.
      </p>
    </>
  );
}
