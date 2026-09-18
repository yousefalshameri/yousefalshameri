import type { AttendanceRecord, Employee, LeaveRequest } from "./types";

/**
 * بيانات تجريبية للتطوير. عند ربط Supabase استبدل هذه الدوال
 * باستعلامات من lib/supabase.ts مع إبقاء نفس التواقيع.
 */
const employees: Employee[] = [
  {
    id: "emp-1001",
    civilId: "288101500123",
    fileNumber: "JH-1001",
    fullName: "يوسف عبدالله الشمري",
    jobTitle: "أخصائي نظم معلومات",
    department: "تقنية المعلومات",
    facility: "مستشفى الجهراء",
    status: "على رأس العمل",
    contractType: "تعيين دائم",
    nationality: "كويتي",
    phone: "9xxxxxxx",
    email: "y.alshameri@jahra-health.gov.kw",
    hireDate: "2019-09-01",
    annualLeaveBalance: 24,
  },
  {
    id: "emp-1002",
    civilId: "290043000456",
    fileNumber: "JH-1002",
    fullName: "منى خالد العنزي",
    jobTitle: "رئيس قسم الموارد البشرية",
    department: "الموارد البشرية",
    facility: "مستشفى الجهراء",
    status: "على رأس العمل",
    contractType: "تعيين دائم",
    nationality: "كويتي",
    phone: "9xxxxxxx",
    email: "m.alanzi@jahra-health.gov.kw",
    hireDate: "2014-03-15",
    annualLeaveBalance: 11,
  },
  {
    id: "emp-1003",
    civilId: "285112700789",
    fileNumber: "JH-1003",
    fullName: "أحمد سالم المطيري",
    jobTitle: "مهندس صيانة",
    department: "الصيانة والمرافق",
    facility: "مركز سعد العبدالله الصحي",
    status: "إجازة",
    contractType: "عقد",
    nationality: "كويتي",
    phone: "9xxxxxxx",
    email: "a.almutairi@jahra-health.gov.kw",
    hireDate: "2021-11-07",
    annualLeaveBalance: 6,
  },
  {
    id: "emp-1004",
    civilId: "292070100321",
    fileNumber: "JH-1004",
    fullName: "فاطمة حسين الرشيدي",
    jobTitle: "ممرضة أولى",
    department: "التمريض",
    facility: "مستشفى الجهراء",
    status: "على رأس العمل",
    contractType: "تعيين دائم",
    nationality: "كويتي",
    phone: "9xxxxxxx",
    email: "f.alrashidi@jahra-health.gov.kw",
    hireDate: "2017-06-20",
    annualLeaveBalance: 18,
  },
  {
    id: "emp-1005",
    civilId: "287020900654",
    fileNumber: "JH-1005",
    fullName: "راشد ناصر العجمي",
    jobTitle: "محاسب أول",
    department: "الشؤون المالية",
    facility: "الإدارة - منطقة الجهراء الصحية",
    status: "منتدب",
    contractType: "ندب",
    nationality: "كويتي",
    phone: "9xxxxxxx",
    email: "r.alajmi@jahra-health.gov.kw",
    hireDate: "2012-01-10",
    annualLeaveBalance: 30,
  },
  {
    id: "emp-1006",
    civilId: "294091200987",
    fileNumber: "JH-1006",
    fullName: "نورة فهد الظفيري",
    jobTitle: "طبيب مقيم",
    department: "الخدمات الطبية",
    facility: "مستشفى الجهراء",
    status: "على رأس العمل",
    contractType: "عقد",
    nationality: "كويتي",
    phone: "9xxxxxxx",
    email: "n.aldhafiri@jahra-health.gov.kw",
    hireDate: "2023-02-01",
    annualLeaveBalance: 21,
  },
];

const leaveRequests: LeaveRequest[] = [
  {
    id: "lv-501",
    employeeId: "emp-1003",
    type: "إجازة دورية",
    startDate: "2026-09-14",
    endDate: "2026-09-24",
    days: 11,
    status: "معتمدة",
    reason: "إجازة سنوية مجدولة",
    submittedAt: "2026-08-30",
  },
  {
    id: "lv-502",
    employeeId: "emp-1004",
    type: "إجازة مرضية",
    startDate: "2026-09-21",
    endDate: "2026-09-23",
    days: 3,
    status: "قيد المراجعة",
    reason: "تقرير طبي مرفق",
    submittedAt: "2026-09-17",
  },
  {
    id: "lv-503",
    employeeId: "emp-1006",
    type: "إذن رسمي",
    startDate: "2026-09-19",
    endDate: "2026-09-19",
    days: 1,
    status: "قيد المراجعة",
    reason: "مراجعة الجهة الحكومية",
    submittedAt: "2026-09-18",
  },
  {
    id: "lv-504",
    employeeId: "emp-1002",
    type: "إجازة بدون راتب",
    startDate: "2026-10-05",
    endDate: "2026-10-19",
    days: 15,
    status: "مرفوضة",
    reason: "ضغط العمل في القسم",
    submittedAt: "2026-09-10",
  },
];

const attendance: AttendanceRecord[] = [
  { id: "at-1", employeeId: "emp-1001", date: "2026-09-18", checkIn: "07:12", checkOut: "14:05", state: "حاضر" },
  { id: "at-2", employeeId: "emp-1002", date: "2026-09-18", checkIn: "07:48", checkOut: "14:10", state: "متأخر" },
  { id: "at-3", employeeId: "emp-1003", date: "2026-09-18", checkIn: null, checkOut: null, state: "إجازة" },
  { id: "at-4", employeeId: "emp-1004", date: "2026-09-18", checkIn: "06:55", checkOut: "14:00", state: "حاضر" },
  { id: "at-5", employeeId: "emp-1005", date: "2026-09-18", checkIn: "07:05", checkOut: "14:02", state: "حاضر" },
  { id: "at-6", employeeId: "emp-1006", date: "2026-09-18", checkIn: null, checkOut: null, state: "غائب" },
];

export async function getEmployees(): Promise<Employee[]> {
  return employees;
}

export async function getEmployee(id: string): Promise<Employee | undefined> {
  return employees.find((e) => e.id === id);
}

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  return leaveRequests;
}

export async function getAttendance(date: string): Promise<AttendanceRecord[]> {
  return attendance.filter((a) => a.date === date);
}

export function employeeName(id: string): string {
  return employees.find((e) => e.id === id)?.fullName ?? "—";
}
