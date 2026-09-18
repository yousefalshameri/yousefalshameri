import Badge, { type Tone } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { employeeName, getAttendance } from "@/lib/data";
import { formatDateAr, toArabicDigits } from "@/lib/utils";

const TODAY = "2026-09-18";

const stateTone: Record<string, Tone> = {
  حاضر: "ok",
  متأخر: "warn",
  غائب: "bad",
  إجازة: "neutral",
};

export default async function AttendancePage() {
  const records = await getAttendance(TODAY);
  const present = records.filter((r) => r.state === "حاضر").length;

  return (
    <>
      <PageHeader
        title="الحضور والانصراف"
        subtitle={`${formatDateAr(TODAY)} — حضور ${toArabicDigits(present)} من ${toArabicDigits(records.length)}`}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">الموظف</th>
              <th className="px-4 py-3 font-medium">وقت الحضور</th>
              <th className="px-4 py-3 font-medium">وقت الانصراف</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{employeeName(r.employeeId)}</td>
                <td className="px-4 py-3 tabular-nums">
                  {r.checkIn ? toArabicDigits(r.checkIn) : "—"}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {r.checkOut ? toArabicDigits(r.checkOut) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge label={r.state} tone={stateTone[r.state] ?? "neutral"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
