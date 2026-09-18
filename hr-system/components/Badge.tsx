const tones = {
  ok: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warn: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  bad: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  neutral: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
} as const;

export type Tone = keyof typeof tones;

export default function Badge({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-1 text-xs font-medium ${tones[tone]}`}
    >
      {label}
    </span>
  );
}
