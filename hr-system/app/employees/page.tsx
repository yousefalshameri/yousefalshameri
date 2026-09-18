import Badge, { type Tone } from "@/components/Badge";
import PageHeader from "@/components/PageHeader";
import { getEmployees } from "@/lib/data";
import { formatDateAr, toArabicDigits, yearsOfService } from "@/lib/utils";

const statusTone: Record<string, Tone> = {
  "على رأس العمل": "ok",
  إجازة: "warn",
  منتدب: "neutral",
  موقوف: "bad",
};

export default async function EmployeesPage() {
  const employees = await getEmployees();

  return (
    <>
      <PageHeader
        title="سجل الموظفين"
        subtitle={`${toArabicDigits(employees.length)} موظف مسجّل في المنطقة`}
      />

      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-border text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">رقم الملف</th>
              <th className="px-4 py-3 font-medium">الاسم</th>
              <th className="px-4 py-3 font-medium">المسمى الوظيفي</th>
              <th className="px-4 py-3 font-medium">القسم</th>
              <th className="px-4 py-3 font-medium">جهة العمل</th>
              <th className="px-4 py-3 font-medium">مدة الخدمة</th>
              <th className="px-4 py-3 font-medium">رصيد الإجازة</th>
              <th className="px-4 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 tabular-nums text-muted">{e.fileNumber}</td>
                <td className="px-4 py-3 font-medium">{e.fullName}</td>
                <td className="px-4 py-3">{e.jobTitle}</td>
                <td className="px-4 py-3 text-muted">{e.department}</td>
                <td className="px-4 py-3 text-muted">{e.facility}</td>
                <td className="px-4 py-3 tabular-nums" title={formatDateAr(e.hireDate)}>
                  {toArabicDigits(yearsOfService(e.hireDate))} سنة
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {toArabicDigits(e.annualLeaveBalance)} يوم
                </td>
                <td className="px-4 py-3">
                  <Badge label={e.status} tone={statusTone[e.status] ?? "neutral"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
