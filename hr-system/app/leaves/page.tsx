import Badge, { type Tone } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { employeeName, getLeaveRequests } from "@/lib/data";
import { formatDateAr, toArabicDigits } from "@/lib/utils";

const statusTone: Record<string, Tone> = {
  "قيد المراجعة": "warn",
  معتمدة: "ok",
  مرفوضة: "bad",
};

export default async function LeavesPage() {
  const leaves = await getLeaveRequests();
  const pending = leaves.filter((l) => l.status === "قيد المراجعة").length;

  return (
    <>
      <PageHeader
        title="طلبات الإجازات"
        subtitle={`${toArabicDigits(pending)} طلب بانتظار الاعتماد من أصل ${toArabicDigits(leaves.length)}`}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {leaves.map((l) => (
          <article key={l.id} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold">{employeeName(l.employeeId)}</h2>
                <p className="mt-0.5 text-sm text-muted">{l.type}</p>
              </div>
              <Badge label={l.status} tone={statusTone[l.status] ?? "neutral"} />
            </div>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">من</dt>
                <dd>{formatDateAr(l.startDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">إلى</dt>
                <dd>{formatDateAr(l.endDate)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">عدد الأيام</dt>
                <dd className="tabular-nums">{toArabicDigits(l.days)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">السبب</dt>
                <dd className="text-left">{l.reason}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  );
}
