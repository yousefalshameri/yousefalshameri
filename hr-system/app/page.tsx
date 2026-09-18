import Link from "next/link";
import Badge, { type Tone } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { employeeName, getAttendance, getEmployees, getLeaveRequests } from "@/lib/data";
import { formatDateAr, toArabicDigits } from "@/lib/utils";

const TODAY = "2026-09-18";

const leaveTone: Record<string, Tone> = {
  "قيد المراجعة": "warn",
  معتمدة: "ok",
  مرفوضة: "bad",
};

export default async function DashboardPage() {
  const [employees, leaves, today] = await Promise.all([
    getEmployees(),
    getLeaveRequests(),
    getAttendance(TODAY),
  ]);

  const onDuty = employees.filter((e) => e.status === "على رأس العمل").length;
  const pending = leaves.filter((l) => l.status === "قيد المراجعة");
  const present = today.filter((a) => a.state === "حاضر").length;
  const attendanceRate = today.length
    ? Math.round((present / today.length) * 100)
    : 0;

  const byDepartment = employees.reduce<Record<string, number>>((acc, e) => {
    acc[e.department] = (acc[e.department] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        title="لوحة المؤشرات"
        subtitle={`ملخص اليوم — ${formatDateAr(TODAY)}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="إجمالي الموظفين" value={employees.length} />
        <StatCard label="على رأس العمل" value={onDuty} hint="باستثناء الإجازات والندب" />
        <StatCard label="طلبات إجازة معلّقة" value={pending.length} hint="بانتظار الاعتماد" />
        <StatCard
          label="نسبة الحضور اليوم"
          value={`${toArabicDigits(attendanceRate)}٪`}
          hint={`${toArabicDigits(present)} من ${toArabicDigits(today.length)}`}
        />
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">طلبات بانتظار الاعتماد</h2>
            <Link href="/leaves" className="text-sm text-brand hover:underline">
              عرض الكل
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-muted">لا توجد طلبات معلّقة.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((l) => (
                <li
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-sm">
                    <span className="font-medium">{employeeName(l.employeeId)}</span>
                    <span className="text-muted"> — {l.type}</span>
                  </span>
                  <span className="text-xs text-muted">
                    {toArabicDigits(l.days)} يوم
                  </span>
                  <Badge label={l.status} tone={leaveTone[l.status] ?? "neutral"} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-4 font-bold">التوزيع حسب القسم</h2>
          <ul className="space-y-3">
            {Object.entries(byDepartment)
              .sort((a, b) => b[1] - a[1])
              .map(([dept, count]) => (
                <li key={dept}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{dept}</span>
                    <span className="text-muted tabular-nums">
                      {toArabicDigits(count)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-border">
                    <div
                      className="h-2 rounded-full bg-brand"
                      style={{ width: `${(count / employees.length) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </section>
    </>
  );
}
