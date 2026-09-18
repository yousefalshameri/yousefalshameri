import { toArabicDigits } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export default function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums">
        {typeof value === "number" ? toArabicDigits(value) : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
