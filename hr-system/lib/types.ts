export type Department =
  | "الإدارة العامة"
  | "تقنية المعلومات"
  | "الموارد البشرية"
  | "الشؤون المالية"
  | "الخدمات الطبية"
  | "التمريض"
  | "الصيانة والمرافق";

export type EmployeeStatus = "على رأس العمل" | "إجازة" | "منتدب" | "موقوف";

export type ContractType = "تعيين دائم" | "عقد" | "بدل" | "ندب";

export interface Employee {
  id: string;
  civilId: string;
  fileNumber: string;
  fullName: string;
  jobTitle: string;
  department: Department;
  facility: string;
  status: EmployeeStatus;
  contractType: ContractType;
  nationality: string;
  phone: string;
  email: string;
  hireDate: string;
  annualLeaveBalance: number;
}

export type LeaveType =
  | "إجازة دورية"
  | "إجازة مرضية"
  | "إجازة أمومة"
  | "إجازة بدون راتب"
  | "إذن رسمي";

export type LeaveStatus = "قيد المراجعة" | "معتمدة" | "مرفوضة";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  days: number;
  status: LeaveStatus;
  reason: string;
  submittedAt: string;
}

export type AttendanceState = "حاضر" | "متأخر" | "غائب" | "إجازة";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  state: AttendanceState;
}
